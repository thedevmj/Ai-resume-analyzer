# Detailed Database Schema

```mermaid
erDiagram
    USER ||--o{ REPORT : has
    
    USER {
        ObjectId _id "Primary Key"
        string email "Unique, Required"
        string password "Hashed"
    }
    
    REPORT {
        ObjectId _id "Primary Key"
        ObjectId user_id "Foreign Key"
        string name "Resume Name"
        object analysis "Resume Analysis Data"
        object feedback "AI Generated Feedback"
        date createdAt "Timestamp"
        number score "ATS Score 0-100"
    }
    
    ANALYSIS_DATA {
        string name "Candidate Name"
        string email "Email Address"
        string phone "Phone Number"
        number score "ATS Score"
        string summary "Resume Summary"
        string_array skills "Detected Skills"
        string_array missing_skills "Skills to Develop"
        string_array strengths "Resume Strengths"
        string_array weaknesses "Areas to Improve"
        string_array suggestions "Recommendations"
        object_array experience "Work Experience"
        object_array projects "Projects"
        object_array education "Education"
    }
    
    FEEDBACK_DATA {
        string overall_assessment "Resume Assessment"
        string career_recommendation "Career Path"
        string_array interview_tips "Interview Advice"
        object cover_letter_suggestions "Cover Letter Tips"
        object skill_development_plan "Learning Plan"
        string_array optimization_checklist "Action Items"
        string motivation_boost "Encouragement"
    }
    
    REPORT ||--|| ANALYSIS_DATA : embeds
    REPORT ||--|| FEEDBACK_DATA : embeds
```

## How to Download:

### Option 1: Use Mermaid Live Editor (Easiest)
1. Go to: https://mermaid.live
2. Copy the entire code block above (everything after the triple backticks)
3. Paste into Mermaid Live Editor
4. Click the download icon (top right) to get PNG/SVG

### Option 2: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Right-click on the diagram → Export as PNG/SVG

### Option 3: Command Line (requires mermaid-cli)
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i 03-Detailed-Schema.md -o 03-Detailed-Schema.png
```
