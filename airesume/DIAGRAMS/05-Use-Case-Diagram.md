# Use Case Diagram - AI Resume Analyzer

```mermaid
graph TB
    subgraph "System"
        UC1["📤 Upload Resume"]
        UC2["📊 Analyze Resume"]
        UC3["💬 Generate Feedback"]
        UC4["👀 View Dashboard"]
        UC5["📥 Download Report"]
        UC6["🔐 Manage Account"]
        UC7["📱 View Strengths & Weaknesses"]
        UC8["💡 Get Recommendations"]
        UC9["📈 Track Progress"]
    end
    
    subgraph "Actors"
        USER["👤 Job Seeker"]
        ADMIN["👨‍💼 Admin"]
        AI["🤖 AI Engine"]
    end
    
    USER -->|Uses| UC1
    USER -->|Views| UC4
    USER -->|Gets| UC3
    USER -->|Views| UC7
    USER -->|Receives| UC8
    USER -->|Tracks| UC9
    USER -->|Can| UC5
    USER -->|Performs| UC6
    
    UC1 -->|Triggers| UC2
    UC2 -->|Generates| UC3
    UC3 -->|Shows in| UC4
    UC2 -->|Displays in| UC7
    UC3 -->|Contains| UC8
    UC4 -->|Enables| UC9
    
    ADMIN -->|Monitors| UC2
    ADMIN -->|Reviews| UC3
    
    AI -->|Processes| UC2
    AI -->|Creates| UC3
    
    UC1 -.->|Via| UC6
    
    style USER fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style ADMIN fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style AI fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    style UC1 fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style UC2 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style UC3 fill:#b3e5fc,stroke:#0288d1,stroke-width:2px
    style UC4 fill:#f8bbd0,stroke:#c2185b,stroke-width:2px
```

## Use Case Description

### **Actors:**
- **Job Seeker (User)** - Primary user who uploads resumes
- **Admin** - System administrator (monitoring)
- **AI Engine** - External AI service

### **Use Cases:**

| ID | Use Case | Description | Actor |
|---|----------|-------------|-------|
| UC1 | Upload Resume | User uploads PDF/DOCX file | Job Seeker |
| UC2 | Analyze Resume | System parses and analyzes content | AI Engine |
| UC3 | Generate Feedback | AI creates detailed feedback | AI Engine |
| UC4 | View Dashboard | User views all analyses | Job Seeker |
| UC5 | Download Report | User exports analysis as PDF | Job Seeker |
| UC6 | Manage Account | User registers/login/logout | Job Seeker |
| UC7 | View Strengths & Weaknesses | User sees detailed analysis | Job Seeker |
| UC8 | Get Recommendations | User receives improvement tips | Job Seeker |
| UC9 | Track Progress | User monitors score changes | Job Seeker |

---

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
mmdc -i 05-Use-Case-Diagram.md -o 05-Use-Case-Diagram.png
```
