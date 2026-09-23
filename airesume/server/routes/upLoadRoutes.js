const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { download } = require('../controller/resumedownload');
const Report = require('../models/analyzereport');
const { verifyToken } = require('../middleware/authmiddleware');
const {
    analysisLimiter,
    feedbackLimiter,
    downloadLimiter
} = require('../middleware/rateLimiter');
const {
    generateDetailedFeedback,
    getInterviewTips,
    getCoverLetterSuggestions,
    getAllFeedback
} = require('../controller/feedbackController');

const upload = multer({ dest: 'uploads/' });

// Validating PDF structure before parsing 

const validatePDF = (buffer) => {
    // Check if buffer starts with PDF header
    if (!buffer.toString('utf8', 0, 4).includes('%PDF')) {
        throw new Error('Invalid PDF: File does not have a valid PDF header');
    }

    // Check buffer size (PDFs should typically be at least 100 bytes)
    if (buffer.length < 100) {
        throw new Error('Invalid PDF: File is too small to be a valid PDF');
    }

    // Check for common corruption patterns
    const bufferStr = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    
    // Try to find xref section
    if (!bufferStr.includes('xref') && !bufferStr.includes('stream')) {
        throw new Error('Invalid PDF: Missing required PDF structures');
    }

    return true;
};

// Fallback analysis when API fails
const detectRole = (text) => {
    const t = text.toLowerCase();
    const roleKeywords = [
        { role: 'Machine Learning Engineer', keywords: ['machine learning', 'llm', 'genai', 'generative ai', 'model training', 'tensorflow', 'pytorch', 'mlops'] },
        { role: 'Data Scientist', keywords: ['data science', 'analytics', 'statistics', 'pandas', 'numpy', 'tableau', 'power bi', 'python'] },
        { role: 'Data Engineer', keywords: ['data engineer', 'etl', 'spark', 'kafka', 'airflow', 'data warehouse'] },
        { role: 'DevOps Engineer', keywords: ['devops', 'ci/cd', 'jenkins', 'docker', 'kubernetes', 'terraform', 'aws', 'azure'] },
        { role: 'Backend Engineer', keywords: ['backend', 'node.js', 'express', 'spring', 'java', 'rest api', 'database', 'sql'] },
        { role: 'Frontend Developer', keywords: ['frontend', 'react', 'angular', 'vue', 'next.js', 'typescript', 'css', 'html'] },
        { role: 'Mobile Developer', keywords: ['mobile', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'] },
        { role: 'Full Stack Developer', keywords: ['full stack', 'mern', 'mean', 'frontend and backend', 'api development'] },
        { role: 'Product Manager', keywords: ['product manager', 'product owner', 'roadmap', 'stakeholder', 'agile', 'scrum'] },
        { role: 'Software Engineer', keywords: ['software engineer', 'developer', 'programming', 'software development'] },
        { role: 'Cloud Engineer', keywords: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'infrastructure'] },
        { role: 'Cybersecurity Analyst', keywords: ['cyber', 'security', 'threat', 'penetration', 'siem', 'compliance'] },
    ];

    let bestRole = 'Software Engineer';
    let bestScore = 0;
    for (const entry of roleKeywords) {
        const score = entry.keywords.reduce((acc, kw) => (t.includes(kw) ? acc + 1 : acc), 0);
        if (score > bestScore) {
            bestScore = score;
            bestRole = entry.role;
        }
    }
    return bestRole;
};

const createFallbackAnalysis = (text) => {
    const textLower = text.toLowerCase();
    const targetRole = detectRole(text);
    
    // Extract basic info
    const emailMatch = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    const phoneMatch = text.match(/\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/);
    
    // Calculate basic score based on content
    let score = 50;
    if (text.length > 500) score += 10;
    if (textLower.includes('experience') || textLower.includes('worked')) score += 10;
    if (textLower.includes('project') || textLower.includes('developed')) score += 10;
    if (textLower.includes('education') || textLower.includes('degree')) score += 5;
    if (text.match(/\b(python|java|javascript|react|node|angular|vue|sql|aws|docker|kubernetes|git|ci\/cd)\b/gi)?.length > 3) score += 10;
    if (text.match(/\b(leadership|team|communication|problem.solving|analytical)\b/gi)) score += 5;
    
    score = Math.min(100, Math.max(0, score));
    
    return {
        name: "Resume Analysis",
        email: emailMatch ? emailMatch[0] : "Not found",
        phone: phoneMatch ? `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}` : "Not found",
        target_role: targetRole,
        market_demand: score >= 70 ? "High" : score >= 50 ? "Medium" : "Low",
        job_market_insights: [
            `Role detected: ${targetRole}. 2026 demand for this role remains strong, with AI/LLM familiarity increasingly expected.`,
            "Employers now prioritize practical, project-based evidence of AI, cloud, and automation skills.",
            "Quantified achievements with business impact are the strongest differentiators for ATS screening."
        ],
        score: score,
        summary: text.substring(0, 200),
        skills: extractSkills(text),
        strengths: [
            "Resume submitted in proper format",
            "Contains relevant professional information",
            "Document is readable and accessible"
        ],
        weaknesses: [
            "Limited quantifiable achievements shown",
            "Could include more specific technical skills",
            "Consider adding measurable impact metrics",
            "More detailed project descriptions would help"
        ],
        missing_skills: [
            "Cloud Technologies (AWS, Azure)",
            "Containerization (Docker, Kubernetes)",
            "CI/CD Pipelines",
            "Advanced Data Analysis",
            "System Design"
        ],
        suggestions: [
            "Add specific metrics and numbers to achievements",
            "Include relevant technical certifications",
            "Expand project descriptions with measurable outcomes",
            "Highlight leadership and collaboration experiences",
            "Use industry-specific keywords from job descriptions"
        ]
    };
};

// Extract skills from resume text
const extractSkills = (text) => {
    const commonSkills = [
        'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript',
        'React', 'Angular', 'Vue', 'Node.js', 'Express',
        'SQL', 'MongoDB', 'PostgreSQL', 'Firebase',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
        'Git', 'REST API', 'GraphQL', 'HTML', 'CSS'
    ];
    
    const found = commonSkills.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
    );
    
    return found.length > 0 ? found : ['Communication', 'Problem Solving', 'Team Collaboration'];
};

router.post('/', analysisLimiter, verifyToken, upload.single('resume'), async (req, res) => {
    let parsed = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filepath = req.file.path;
        const buffer = fs.readFileSync(filepath);

        let text = "";


        if (req.file.mimetype === "application/pdf") {
            try {
                // Validate PDF before parsing
                validatePDF(buffer);
                
                // Attempt to parse with timeout protection
                const parsePromise = pdfParse(buffer);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('PDF parsing timed out')), 15000)
                );
                
                const data = await Promise.race([parsePromise, timeoutPromise]);
                if (!data?.text) throw new Error("Failed to extract text from PDF");
                text = data.text;
            } catch (pdfError) {
                fs.unlinkSync(filepath);
                console.error("PDF Error:", pdfError.message);
                return res.status(400).json({ 
                    error: 'Invalid or corrupted PDF file',
                    details: pdfError.message || 'The PDF file could not be processed. Please ensure it is a valid, non-corrupted PDF.'
                });
            }

        } else if (
            req.file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const data = await mammoth.extractRawText({ buffer });
            if (!data?.value?.trim()) throw new Error("Failed to extract text from DOCX");
            text = data.value;

        } else {
            fs.unlinkSync(filepath);
            return res.status(400).json({ error: 'Unsupported file type' });
        }


        fs.unlinkSync(filepath);


        const prompt = `
You are an expert ATS (Applicant Tracking System) resume analyzer and career advisor with up-to-date knowledge of the current (2026) job market.

STEP 1 — ROLE DETECTION:
Analyze the resume and AUTO-DETECT the candidate's most likely target role(s) from the content (most recent job title, skills, projects, summary, education). Pick a SINGLE, commonly-recognized job title (e.g. "Full Stack Developer", "Frontend Developer", "Data Scientist", "DevOps Engineer", "Product Manager", "Backend Engineer", "Machine Learning Engineer", "Mobile Developer").

STEP 2 — SCORING (role-aware & current-market-aware):
Score the resume 0-100 FOR THE DETECTED ROLE, against what recruiters and ATS filters actually look for in today's (2026) market:
- 90-100: Excellent - ATS-ready, quantified achievements, in-demand 2026 keywords for the role
- 75-89: Good - Solid experience, mostly ATS-optimized, minor gaps vs. current market
- 60-74: Fair - Basic structure, missing modern/role-critical keywords or detail
- 40-59: Poor - Missing key info, weak format, outdated skills
- 0-39: Very Poor - Incomplete or severely lacking

Score THESE factors with current-market expectations for the detected role:
1. Format & ATS-friendliness (standard sections, scannable, no tables/embedded images)
2. Role-relevant skills (match against in-demand 2026 tech — e.g. AI/LLM integration & prompt engineering, cloud & serverless, data engineering, MLOps, automation, system design, cybersecurity — whenever relevant to the role)
3. Experience depth (quantified results, metrics, business impact, "action verb + metric" bullets)
4. Keyword optimization (current industry terminology, not dated terms)
5. Education & certifications (relevant and up-to-date)
6. Contact info, grammar, and overall professionalism

missing_skills AND suggestions MUST be tailored to the detected role and the CURRENT 2026 market (call out in-demand trends only when relevant, e.g. AI tooling, cloud-native, data literacy, automation, security).

Return STRICT JSON ONLY with this EXACT structure:

{
  "target_role": "auto-detected job title",
  "score": <number 0-100 based on the analysis>,
  "market_demand": "High" or "Medium" or "Low",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "missing_skills": ["role-specific + current-market skill1", "skill2", "skill3", "skill4", "skill5"],
  "job_market_insights": ["1-line takeaway about 2026 hiring trends for this role", "trend2", "trend3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "name": "Extracted name or 'Not Found'",
  "email": "Extracted email or 'Not Found'",
  "phone": "Extracted phone or 'Not Found'",
  "summary": "2-3 line professional summary from resume or generated",
  "experience": [
    {
      "role": "Job title",
      "company": "Company name",
      "duration": "Years",
      "points": ["Achievement 1", "Achievement 2"]
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "college": "Institution name",
      "year": "Graduation year"
    }
  ]
}

Rules:
- Only extract data that is actually present in the resume. Do NOT invent names, companies, or achievements.
- Generate realistic, VARIED scores based on the actual quality of the resume.
- If a role is not obvious, infer the best-fit from the dominant skills, projects, and recent experience.
- STRICT JSON ONLY. No explanation. No markdown. No text outside the JSON object.

Resume to analyze:

${text}
`;


        let results = null;

        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: [
                        { role: 'system', content: 'You are a professional resume analyzer.' },
                        { role: 'user', content: prompt }
                    ]
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            results = data?.choices?.[0]?.message?.content;

            if (!results) {
                console.warn("No response content from Groq API, using fallback");
                results = null;
            }

        } catch (err) {
            console.error("Error calling Groq API:", err.message);
            console.warn("Falling back to local analysis...");
            results = null;
        }


        try {
            if (!results) {
                console.warn("No results from API - creating fallback analysis");
                parsed = createFallbackAnalysis(text);
            } else {
                let clean = results
                    .replace(/,\s*}/g, "}")
                    .replace(/,\s*]/g, "]");

                const match = clean.match(/\{[\s\S]*\}/);
                parsed = match ? JSON.parse(match[0]) : null;
            }
        } catch (err) {
            console.log("Parse failed:", err.message);
            console.warn("Using fallback analysis");
            parsed = null;
        }


        if (!parsed) parsed = {};

        // Ensure score is a valid number between 0-100
        if (!parsed.score || typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
            parsed.score = 60; // Default if invalid
        }

        if (!parsed.missing_skills || parsed.missing_skills.length === 0) {
            parsed.missing_skills = ["React", "Node.js", "Projects", "APIs", "System Design"];
        }

        if (!parsed.target_role) {
            parsed.target_role = detectRole(text);
        }

        if (!parsed.market_demand) {
            parsed.market_demand = parsed.score >= 70 ? "High" : parsed.score >= 50 ? "Medium" : "Low";
        }

        if (!parsed.job_market_insights || parsed.job_market_insights.length === 0) {
            parsed.job_market_insights = [
                `Role detected: ${parsed.target_role}. The 2026 market increasingly rewards candidates who pair core skills with AI/LLM fluency.`,
                "Recruiters expect quantifiable, project-based evidence of impact rather than generic descriptions."
            ];
        }

        if (!parsed.suggestions || parsed.suggestions.length === 0) {
            parsed.suggestions = [
                "Build real-world projects",
                "Improve technical depth",
                "Add GitHub portfolio",
                "Highlight achievements",
                "Optimize resume keywords"
            ];
        }

        // Save to database
        let reportId = null;
        try {
            const report = new Report({
                user: req.user.id,
                name: parsed.name || "Resume Analysis",
                analysis: parsed,
                score: parsed.score || 0
            });
            await report.save();
            reportId = report._id;
          
        } catch (dbErr) {
            console.log("Error saving to database:", dbErr.message);
        }

        res.json({
            message: "Analysis complete",
            analysis: parsed,
            reportId: reportId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error processing file',
            details: err.message
        });
    }
});

// Get user's resume history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('name analysis createdAt _id score');
        
        res.json({
            success: true,
            history: reports
        });
    } catch (err) {
        console.log("Error fetching history:", err.message);
        res.status(500).json({ error: 'Error fetching history' });
    }
});

// Get specific report
router.get('/report/:id', verifyToken, async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.json({
            success: true,
            report
        });
    } catch (err) {
        console.log("Error fetching report:", err.message);
        res.status(500).json({ error: 'Error fetching report' });
    }
});

// Delete report
router.delete('/report/:id', verifyToken, async (req, res) => {
    try {
        const report = await Report.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (err) {
        console.log("Error deleting report:", err.message);
        res.status(500).json({ error: 'Error deleting report' });
    }
});

router.post('/download', downloadLimiter, verifyToken, download);

// Feedback routes
router.get('/feedback/:reportId', feedbackLimiter, verifyToken, getAllFeedback);
router.post('/feedback/:reportId', feedbackLimiter, verifyToken, generateDetailedFeedback);
router.get('/feedback/:reportId/interview-tips', verifyToken, getInterviewTips);
router.get('/feedback/:reportId/cover-letter', verifyToken, getCoverLetterSuggestions);

module.exports = router;