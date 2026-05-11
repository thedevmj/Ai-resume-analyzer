const Report = require('../models/analyzereport');
const axios = require('axios');

// Fallback function to generate feedback when API fails
const generateFallbackFeedback = (analysis) => {
    return {
        overall_assessment: `Your resume demonstrates a foundation of professional skills with a current ATS score of ${analysis.score}%. Focus on quantifying achievements and incorporating industry-specific keywords to improve your score. The resume is well-formatted and includes key professional information.`,
        career_recommendation: "Based on your skills and experience, consider focusing on roles that leverage your identified strengths. Work on developing the missing technical skills to expand your career opportunities.",
        interview_tips: [
            "Start with a strong opening statement about your most impressive achievement using the STAR method",
            "Prepare specific examples of overcoming challenges related to the missing skills you're developing",
            "Practice discussing your technical skills with concrete project examples and measurable outcomes",
            "Research the company thoroughly and prepare thoughtful questions about their challenges and culture"
        ],
        cover_letter_suggestions: {
            opening: "Dear Hiring Manager, I am excited to apply for the [Position] role as my background in [Your Field] and passion for [Industry] align perfectly with your company's mission.",
            body_points: [
                "Highlight specific achievements with quantifiable results that match the job description",
                "Connect your experience to the company's current projects or challenges",
                "Demonstrate knowledge of the company's culture and explain why you're a good fit"
            ],
            closing: "I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success."
        },
        skill_development_plan: {
            priority_skills: analysis.missing_skills?.slice(0, 2) || ["Cloud Technologies", "Advanced Problem Solving"],
            learning_resources: [
                "Online platforms: Coursera, Udemy, Pluralsight",
                "Practice projects on GitHub or personal portfolio",
                "Technical documentation and official tutorials",
                "Peer learning and mentorship programs"
            ],
            estimated_timeline: "8-12 weeks of consistent practice to develop proficiency in priority skills"
        },
        optimization_checklist: [
            "Add quantifiable metrics and percentages to all achievements",
            "Include relevant technical certifications and achievements",
            "Expand project descriptions with tech stack and outcomes",
            "Highlight leadership, collaboration, and communication skills",
            "Use ATS-optimized keywords from your target job descriptions"
        ],
        motivation_boost: `You're on the right track! Your identified strengths ${analysis.strengths?.slice(0, 2)?.join(' and ') || 'show promise'}. With focused effort on developing the recommended skills, you'll significantly improve your resume's competitiveness. Every step toward improvement brings you closer to your dream opportunity!`
    };
};

// Generate detailed AI feedback based on resume analysis
const generateDetailedFeedback = async (req, res) => {
    try {
        const { reportId } = req.params;

        // Get the report
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check authorization
        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const analysis = report.analysis;

        // Create a comprehensive feedback prompt
        const feedbackPrompt = `
You are a professional career coach and resume expert. Based on the following resume analysis, provide detailed, actionable feedback in JSON format.

Resume Analysis:
Score: ${analysis.score}
Name: ${analysis.name}
Email: ${analysis.email}
Phone: ${analysis.phone}
Summary: ${analysis.summary}
Skills: ${analysis.skills?.join(', ')}
Missing Skills: ${analysis.missing_skills?.join(', ')}
Strengths: ${analysis.strengths?.join(', ')}
Weaknesses: ${analysis.weaknesses?.join(', ')}
Current Suggestions: ${analysis.suggestions?.join(', ')}

Please provide comprehensive feedback in this EXACT JSON format:
{
  "overall_assessment": "1-2 paragraph assessment of the resume",
  "career_recommendation": "Career path recommendations based on skills and experience",
  "interview_tips": [
    "Tip 1 (start with a strong opening statement about your most impressive achievement)",
    "Tip 2 (prepare examples of overcoming challenges related to missing skills)",
    "Tip 3 (practice discussing your technical skills with specific projects)",
    "Tip 4 (research the company and prepare questions)"
  ],
  "cover_letter_suggestions": {
    "opening": "Suggested opening line for cover letter",
    "body_points": ["Key point 1 to highlight", "Key point 2 to highlight", "Key point 3 to highlight"],
    "closing": "Suggested closing statement"
  },
  "skill_development_plan": {
    "priority_skills": ["Top skill to learn first", "Second priority skill"],
    "learning_resources": ["Resource recommendation 1", "Resource recommendation 2"],
    "estimated_timeline": "X weeks to develop these skills"
  },
  "optimization_checklist": [
    "Action item 1",
    "Action item 2",
    "Action item 3",
    "Action item 4",
    "Action item 5"
  ],
  "motivation_boost": "Encouraging message based on their strengths and potential"
}

Return STRICT JSON ONLY. No explanation. No text outside JSON.
`;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'DeepSeek-V3.1',
                    messages: [
                        { role: 'system', content: 'You are a professional career coach.' },
                        { role: 'user', content: feedbackPrompt }
                    ]
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            let feedbackContent = data?.choices?.[0]?.message?.content;

            if (!feedbackContent) {
                console.warn("No feedback content from API, using fallback");
                feedbackContent = null;
            }

            // Parse JSON response
            let feedback = null;
            if (feedbackContent) {
                try {
                    let clean = feedbackContent
                        .replace(/,\s*}/g, "}")
                        .replace(/,\s*]/g, "]");
                    const match = clean.match(/\{[\s\S]*\}/);
                    feedback = match ? JSON.parse(match[0]) : null;
                } catch (parseErr) {
                    console.log("Parse failed:", parseErr.message);
                    feedback = null;
                }
            }

            // If API failed or parsing failed, use fallback
            if (!feedback) {
                console.warn("Using fallback feedback response");
                feedback = generateFallbackFeedback(analysis);
            }

            // Update report with feedback
            report.feedback = feedback;
            await report.save();

            res.status(200).json({
                success: true,
                feedback: feedback
            });

        } catch (aiErr) {
            console.error("Error calling AI for feedback:", aiErr.message);
            console.warn("Generating fallback feedback response");

            // Generate fallback feedback
            const fallbackFeedback = generateFallbackFeedback(analysis);
            report.feedback = fallbackFeedback;
            await report.save();

            res.status(200).json({
                success: true,
                feedback: fallbackFeedback
            });
        }

    } catch (err) {
        console.error("Error in generateDetailedFeedback:", err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Get interview tips
const getInterviewTips = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Return existing interview tips from feedback if available
        if (report.feedback?.interview_tips) {
            return res.status(200).json({
                success: true,
                interview_tips: report.feedback.interview_tips
            });
        }

        // If no cached feedback, return empty structure
        res.status(200).json({
            success: true,
            interview_tips: {
                technical_questions: [],
                behavioral_questions: [],
                preparation_tips: [],
                common_mistakes_to_avoid: []
            }
        });

    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Get cover letter suggestions
const getCoverLetterSuggestions = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Return existing cover letter suggestions from feedback if available
        if (report.feedback?.cover_letter_suggestions) {
            return res.status(200).json({
                success: true,
                cover_letter_suggestions: report.feedback.cover_letter_suggestions
            });
        }

        // If no cached feedback, return empty structure matching component expectations
        res.status(200).json({
            success: true,
            cover_letter_suggestions: {
                opening_paragraph: "Dear Hiring Manager, I am excited to apply for this position as my background aligns with your company's needs.",
                middle_paragraph_1: "Throughout my career, I have developed strong skills in [your field] with a focus on [relevant achievement]. My experience includes [key accomplishment].",
                middle_paragraph_2: "I am particularly drawn to your organization because [specific reason]. My expertise in [skill] aligns perfectly with your requirements.",
                closing_paragraph: "Thank you for considering my application. I would welcome the opportunity to discuss how my skills can contribute to your team's success.",
                key_phrases: [
                    "Demonstrated expertise in",
                    "Successfully led",
                    "Passionate about delivering"
                ],
                action_verbs: [
                    "Achieved",
                    "Implemented",
                    "Developed",
                    "Led",
                    "Designed"
                ]
            }
        });

    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Return existing feedback if available
        if (report.feedback) {
            return res.status(200).json({
                success: true,
                feedback: report.feedback
            });
        }

        // If no cached feedback exists, return default structure
        const defaultFeedback = {
            overall_assessment: "Your resume demonstrates professional potential. To improve your ATS score, focus on quantifying achievements and incorporating industry-specific keywords.",
            career_recommendation: "Based on your skills and experience, consider focusing on roles that leverage your identified strengths.",
            interview_tips: [
                "Prepare specific examples of your achievements using the STAR method",
                "Practice discussing your skills with concrete project examples",
                "Research the company and prepare thoughtful questions",
                "Focus on demonstrating problem-solving abilities"
            ],
            cover_letter_suggestions: {
                opening_paragraph: "Dear Hiring Manager, I am excited to apply for this position as my background aligns with your company's needs.",
                middle_paragraph_1: "Throughout my career, I have developed strong skills in [your field] with a focus on [relevant achievement]. My experience includes [key accomplishment].",
                middle_paragraph_2: "I am particularly drawn to your organization because [specific reason]. My expertise in [skill] aligns perfectly with your requirements.",
                closing_paragraph: "Thank you for considering my application. I would welcome the opportunity to discuss how my skills can contribute to your team's success.",
                key_phrases: [
                    "Demonstrated expertise in",
                    "Successfully led",
                    "Passionate about delivering"
                ],
                action_verbs: [
                    "Achieved",
                    "Implemented",
                    "Developed",
                    "Led",
                    "Designed"
                ]
            },
            skill_development_plan: {
                priority_skills: ["Cloud Technologies", "Advanced Problem Solving"],
                learning_resources: [
                    "Online platforms: Coursera, Udemy, Pluralsight",
                    "Practice projects on GitHub or personal portfolio",
                    "Technical documentation and official tutorials"
                ],
                estimated_timeline: "8-12 weeks of consistent practice"
            },
            optimization_checklist: [
                "Add quantifiable metrics and percentages to all achievements",
                "Include relevant technical certifications",
                "Expand project descriptions with tech stack and outcomes",
                "Highlight leadership and collaboration skills",
                "Use ATS-optimized keywords from target job descriptions"
            ],
            motivation_boost: "You're on the right track! With focused effort on developing recommended skills, you'll significantly improve your resume's competitiveness."
        };

        res.status(200).json({
            success: true,
            feedback: defaultFeedback
        });

    } catch (err) {
        console.error("Error in getAllFeedback:", err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

module.exports = {
    generateDetailedFeedback,
    getInterviewTips,
    getCoverLetterSuggestions,
    getAllFeedback
};
