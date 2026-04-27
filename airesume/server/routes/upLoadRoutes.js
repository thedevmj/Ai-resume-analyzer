const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('resume'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filepath = req.file.path;
        const buffer = fs.readFileSync(filepath);

        let text = "";


        if (req.file.mimetype === "application/pdf") {
            const data = await pdfParse(buffer);
            if (!data || !data.text) {
                throw new Error("Failed to extract text from PDF");
            }
            text = data.text;

        } else if (
            req.file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const data = await mammoth.extractRawText({ buffer });
            if (!data.value || !data.value.trim()) {
                throw new Error("Failed to extract text from DOCX");
            }
            text = data.value;

        } else {
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
- make the response as detailed as possible based on the resume provided
-make response fast, do not overthink, just give your best guess based on the resume

Format:
{
  "score": number (0-100),
  "skills": ["at least 5"],
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
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: 'llama3',
                prompt: prompt,
                stream: false
            });

            results = response.data.response;

        } catch (err) {
            console.error("Ollama error:", err.message);


            results = JSON.stringify({
                score: 70,
                skills: ["Java", "Python"],
                missing_skills: ["React", "Node.js"],
                strengths: ["Good fundamentals"],
                weaknesses: ["Lack of projects"],
                suggestions: ["Build more real-world applications"]
            });
        }


        let parsed;

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
        parsed = null;
        console.error(err);
        res.status(500).json({
            error: 'Error processing file',
            details: err.message
        });
    }
});

module.exports = router;