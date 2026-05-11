# ER Diagram - Basic Database Schema

```mermaid
erDiagram
    USER ||--o{ REPORT : "creates"
    
    USER {
        ObjectId _id PK
        string email UK
        string password
    }
    
    REPORT {
        ObjectId _id PK
        ObjectId user_id FK
        string name
        object analysis
        object feedback
        date createdAt
        number score
    }
    
    ANALYSIS ||--|| REPORT : "contains"
    ANALYSIS {
        string name
        string email
        string phone
        number score
        string summary
        array skills
        array missing_skills
        array strengths
        array weaknesses
        array suggestions
        array experience
        array projects
        array education
    }
    
    FEEDBACK ||--|| REPORT : "contains"
    FEEDBACK {
        string overall_assessment
        string career_recommendation
        array interview_tips
        object cover_letter_suggestions
        object skill_development_plan
        array optimization_checklist
        string motivation_boost
    }
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
mmdc -i 01-ER-Diagram-Basic.md -o 01-ER-Diagram-Basic.png
```
