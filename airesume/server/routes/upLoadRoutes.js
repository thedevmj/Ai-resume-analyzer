const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { download } = require('../controller/resumedownload');
const Report = require('../models/analyzereport');
const { verifyToken } = require('../middleware/authmiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/', verifyToken, upload.single('resume'), async (req, res) => {
    let parsed = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filepath = req.file.path;
        const buffer = fs.readFileSync(filepath);

        let text = "";


        if (req.file.mimetype === "application/pdf") {
            const data = await pdfParse(buffer);
            if (!data?.text) throw new Error("Failed to extract text from PDF");
            text = data.text;

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
You are an ATS system.

Return STRICT JSON ONLY. No explanation. No text outside JSON.

Rules:
- Always fill ALL fields
- Never return empty arrays
- If data is missing, infer logically
- Make response detailed but fast

Format:
{
  "score": number (0-100),
  "skills": ["at least 5 seperated skills with ','"],
  "missing_skills": ["at least 5"],
  "strengths": ["at least 3"],
  "weaknesses": ["at least 3"],
  "suggestions": ["at least 5"],
  
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "1234567890",
  "summary": "2-3 line professional summary",
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": [
    {
      "role": "Frontend Developer",
      "company": "ABC Pvt Ltd",
      "duration": "2022-2024",
      "points": ["Built UI", "Improved performance"]
    }
  ],
  "projects": [
    {
      "name": "Resume Analyzer",
      "description": "AI-based resume analysis tool"
    }
  ],
  "education": [
    {
      "degree": "B.Tech",
      "college": "XYZ University",
      "year": "2024"
    }
  ]
}
}

Analyze this resume:

${text}
`;


        let results;

        try {
            const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'DeepSeek-V3.1',
                    messages: [
                        { role: 'system', content: 'You are a resume analyzer.' },
                        { role: 'user', content: prompt } // ✅ FIXED
                    ]
                })
            });

            const data = await response.json();

            results = data?.choices?.[0]?.message?.content;

            if (!results) {
                alert("No response from AI for the moment please try again later");
            }

        } catch (err) {
            console.error("Error calling Sambanova API:", err);
            return res.status(500).json({
                error: 'Error analyzing resume',
                details: err.message
            });
        }


        try {
            let clean = results
                .replace(/,\s*}/g, "}")
                .replace(/,\s*]/g, "]");

            const match = clean.match(/\{[\s\S]*\}/);

            parsed = match ? JSON.parse(match[0]) : null;

        } catch (err) {
            console.log("Parse failed:", err.message);
            parsed = null;
        }


        if (!parsed) parsed = {};

        if (!parsed.missing_skills || parsed.missing_skills.length === 0) {
            parsed.missing_skills = ["React", "Node.js", "Projects", "APIs", "System Design"];
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
        try {
            const report = new Report({
                user: req.user.id,
                name: parsed.name || "Resume Analysis",
                analysis: parsed,
                score: parsed.score || 0
            });
            await report.save();
        } catch (dbErr) {
            console.log("Error saving to database:", dbErr.message);
        }

        res.json({
            message: "Analysis complete",
            analysis: parsed
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
            .select('name score createdAt _id');
        
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

router.post('/download', download);
module.exports = router;