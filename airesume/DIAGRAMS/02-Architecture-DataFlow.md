# Architecture & Data Flow Diagram

```mermaid
graph TB
    subgraph "Database Layer"
        U["👤 USER<br/>_id: ObjectId<br/>email: String (Unique)<br/>password: String (Hashed)"]
        R["📄 REPORT<br/>_id: ObjectId<br/>user_id: FK → User<br/>name: String<br/>score: Number<br/>createdAt: Date"]
        A["📊 ANALYSIS<br/>(Embedded)<br/>score, skills, strengths,<br/>weaknesses, suggestions"]
        F["✨ FEEDBACK<br/>(Embedded)<br/>tips, recommendations,<br/>career_path, checklist"]
    end
    
    subgraph "Backend"
        AUTH["🔐 Auth Controller<br/>Register/Login/Logout"]
        UPLOAD["📤 Upload Controller<br/>Parse Resume<br/>Generate Analysis"]
        FEEDBACK_CTRL["💬 Feedback Controller<br/>Generate AI Feedback"]
    end
    
    subgraph "Frontend"
        LOGIN["Login/Signup"]
        UPLOAD_PAGE["Upload Page"]
        DASHBOARD["Dashboard<br/>View Analysis"]
    end
    
    subgraph "External Services"
        SAMBANOVA["🤖 Sambanova API<br/>Resume Analysis<br/>AI Feedback"]
    end
    
    LOGIN -->|Register/Login| AUTH
    AUTH -->|Save/Verify| U
    
    UPLOAD_PAGE -->|Upload Resume| UPLOAD
    UPLOAD -->|Parse & Analyze| SAMBANOVA
    SAMBANOVA -->|Analysis Result| UPLOAD
    UPLOAD -->|Save Analysis| R
    R -->|Contains| A
    
    DASHBOARD -->|Fetch Reports| R
    DASHBOARD -->|Get Feedback| FEEDBACK_CTRL
    FEEDBACK_CTRL -->|Request| SAMBANOVA
    SAMBANOVA -->|AI Response| FEEDBACK_CTRL
    FEEDBACK_CTRL -->|Save Feedback| R
    R -->|Contains| F
    
    U -->|owns| R
    
    style U fill:#e1f5ff
    style R fill:#f3e5f5
    style A fill:#fff3e0
    style F fill:#e8f5e9
    style AUTH fill:#ffe0e0
    style SAMBANOVA fill:#fff9c4
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
mmdc -i 02-Architecture-DataFlow.md -o 02-Architecture-DataFlow.png
```
