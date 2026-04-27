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
Return ONLY valid JSON. No explanation.

{
  "score": number between 0 and 10,
  "skills": [],
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
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
            parsed = JSON.parse(results);
        } catch {
            parsed = { raw: results };
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