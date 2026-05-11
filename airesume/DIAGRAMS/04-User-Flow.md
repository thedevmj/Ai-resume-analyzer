# User Flow Diagram

```mermaid
graph TD
    A["🏠 Home Page<br/>Get Started"] --> B{User<br/>Logged In?}
    B -->|No| C["🔐 Login/Signup"]
    B -->|Yes| D["📤 Upload Resume"]
    
    C --> C1["Enter Email & Password"]
    C1 --> C2{Account<br/>Exists?}
    C2 -->|No| C3["Create New Account"]
    C2 -->|Yes| C4["Verify Password"]
    C3 --> E["✅ Login Successful"]
    C4 --> E
    
    E --> D
    D --> D1["📎 Select Resume File"]
    D1 --> D2["📤 Upload PDF/DOCX"]
    D2 --> D3["⏳ Processing..."]
    D3 --> D4["🤖 Parsing Resume"]
    D4 --> D5["📊 AI Analysis"]
    D5 --> D6["💾 Save to Database"]
    D6 --> F["✨ View Results"]
    
    F --> G{User Action?}
    G -->|View Dashboard| H["📈 Dashboard<br/>View All Analyses"]
    G -->|Get Feedback| I["💬 Detailed Feedback<br/>Tips & Recommendations"]
    G -->|Upload Again| D
    G -->|Logout| J["👋 Logged Out<br/>Return to Home"]
    
    H --> H1["📊 Score Circle<br/>Strengths & Weaknesses"]
    H1 --> H2["🎯 Skills Analysis"]
    H2 --> H3["💡 Suggestions"]
    H3 --> G
    
    I --> I1["💼 Career Tips"]
    I1 --> I2["📝 Cover Letter Help"]
    I2 --> I3["🎓 Skill Development Plan"]
    I3 --> G
    
    J --> A
    
    style A fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style F fill:#e8f5e9
    style H fill:#fce4ec
    style I fill:#e0f2f1
    style E fill:#c8e6c9
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
mmdc -i 04-User-Flow.md -o 04-User-Flow.png
```
