const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('resume'), async (req, res) => {
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
  "suggestions": ["at least 5"]
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

module.exports = router;