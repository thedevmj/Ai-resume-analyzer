const Report = require('../models/analyzereport');
const axios = require('axios');

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

        // Create a comprehensive [feedback prompt
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
                })
            });

            const data = await response.json();
            let feedbackContent = data?.choices?.[0]?.message?.content;

            if (!feedbackContent) {
                return res.status(500).json({
                    error: 'Error generating feedback from AI'
                });
            }

            // Parse JSON response
            let feedback = null;
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

            // Update report with feedback
            report.feedback = feedback;
            await report.save();

            res.status(200).json({
                success: true,
                feedback: feedback || { message: 'Feedback generated but could not be parsed' }
            });

        } catch (aiErr) {
            console.error("Error calling AI for feedback:", aiErr);
            return res.status(500).json({
                error: 'Error generating AI feedback',
                details: aiErr.message
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

        const analysis = report.analysis;

        const interviewPrompt = `
You are an interview coach. Based on this candidate's skills and experience, generate 10 specific interview questions and tips.

Skills: ${analysis.skills?.join(', ')}
Experience: ${analysis.experience?.map(e => e.role).join(', ')}
Strengths: ${analysis.strengths?.join(', ')}

Provide in JSON format:
{
  "technical_questions": [
    {"question": "...", "tip": "..."},
    {"question": "...", "tip": "..."}
  ],
  "behavioral_questions": [
    {"question": "...", "tip": "..."},
    {"question": "...", "tip": "..."}
  ],
  "preparation_tips": ["tip1", "tip2", "tip3"],
  "common_mistakes_to_avoid": ["mistake1", "mistake2", "mistake3"]
}

Return STRICT JSON ONLY.
`;

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
                        { role: 'system', content: 'You are an expert interview coach.' },
                        { role: 'user', content: interviewPrompt }
                    ]
                })
            });

            const data = await response.json();
            let tipsContent = data?.choices?.[0]?.message?.content;

            let tips = null;
            try {
                let clean = tipsContent
                    .replace(/,\s*}/g, "}")
                    .replace(/,\s*]/g, "]");
                const match = clean.match(/\{[\s\S]*\}/);
                tips = match ? JSON.parse(match[0]) : null;
            } catch (parseErr) {
                tips = null;
            }

            res.status(200).json({
                success: true,
                interview_tips: tips || { message: 'Tips generated' }
            });

        } catch (aiErr) {
            console.error("Error calling AI for interview tips:", aiErr);
            res.status(500).json({
                error: 'Error generating interview tips',
                details: aiErr.message
            });
        }

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

        const analysis = report.analysis;

        const experienceStr = analysis.experience?.map(e => `${e.role} at ${e.company}`).join(', ') || 'N/A';
        
        const coverLetterPrompt = `
You are an expert cover letter writer. Based on this resume analysis, create a professional cover letter template.

Name: ${analysis.name}
Email: ${analysis.email}
Summary: ${analysis.summary}
Skills: ${analysis.skills?.join(', ')}
Experience: ${experienceStr}
Strengths: ${analysis.strengths?.join(', ')}

Generate a template in JSON format:
{
  "opening_paragraph": "Engaging opening that introduces the candidate and shows enthusiasm",
  "middle_paragraph_1": "Paragraph highlighting relevant experience and achievements",
  "middle_paragraph_2": "Paragraph demonstrating how skills match the job requirements",
  "closing_paragraph": "Strong closing that expresses interest and call to action",
  "key_phrases": ["phrase1", "phrase2", "phrase3"],
  "action_verbs": ["verb1", "verb2", "verb3", "verb4", "verb5"]
}

Return STRICT JSON ONLY.
`;

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
                        { role: 'system', content: 'You are an expert cover letter writer.' },
                        { role: 'user', content: coverLetterPrompt }
                    ]
                })
            });

            const data = await response.json();
            let letterContent = data?.choices?.[0]?.message?.content;

            let suggestions = null;
            try {
                let clean = letterContent
                    .replace(/,\s*}/g, "}")
                    .replace(/,\s*]/g, "]");
                const match = clean.match(/\{[\s\S]*\}/);
                suggestions = match ? JSON.parse(match[0]) : null;
            } catch (parseErr) {
                suggestions = null;
            }

            res.status(200).json({
                success: true,
                cover_letter_suggestions: suggestions || { message: 'Suggestions generated' }
            });

        } catch (aiErr) {
            console.error("Error calling AI for cover letter:", aiErr);
            res.status(500).json({
                error: 'Error generating cover letter suggestions',
                details: aiErr.message
            });
        }

    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Get all feedback for a report
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

        // Generate new feedback if not available
        const analysis = report.analysis;

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

Please provide comprehensive feedback in this EXACT JSON format:
{
  "overall_assessment": "1-2 paragraph assessment of the resume",
  "career_recommendation": "Career path recommendations based on skills and experience",
  "interview_tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4"
  ],
  "cover_letter_suggestions": {
    "opening": "Suggested opening line for cover letter",
    "body_points": ["Key point 1", "Key point 2", "Key point 3"],
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
                })
            });

            const data = await response.json();
            let feedbackContent = data?.choices?.[0]?.message?.content;

            if (!feedbackContent) {
                return res.status(500).json({
                    error: 'Error generating feedback from AI'
                });
            }

            let feedback = null;
            try {
                let clean = feedbackContent
                    .replace(/,\s*}/g, "}")
                    .replace(/,\s*]/g, "]");
                const match = clean.match(/\{[\s\S]*\}/);
                feedback = match ? JSON.parse(match[0]) : null;
            } catch (parseErr) {
                feedback = null;
            }

            // Save feedback to database
            report.feedback = feedback;
            await report.save();

            res.status(200).json({
                success: true,
                feedback: feedback || { message: 'Feedback generated' }
            });

        } catch (aiErr) {
            console.error("Error calling AI for feedback:", aiErr);
            res.status(500).json({
                error: 'Error generating AI feedback',
                details: aiErr.message
            });
        }

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
