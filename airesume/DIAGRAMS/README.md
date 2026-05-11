# 📊 AI Resume Analyzer - Diagrams

This folder contains all system diagrams for the AI Resume Analyzer application.

## 📁 Included Diagrams

| # | Diagram | File | Purpose |
|---|---------|------|---------|
| 1 | **ER Diagram - Basic** | `01-ER-Diagram-Basic.md` | Database schema relationships |
| 2 | **Architecture & Data Flow** | `02-Architecture-DataFlow.md` | System components and interactions |
| 3 | **Detailed Database Schema** | `03-Detailed-Schema.md` | Complete field descriptions |
| 4 | **User Flow** | `04-User-Flow.md` | User journey through the app |
| 5 | **Use Case Diagram** | `05-Use-Case-Diagram.md` | System actors and functionalities |

---

## 🖼️ How to Convert to Image

### ⭐ **EASIEST METHOD - Mermaid Live Editor**

1. Go to: **https://mermaid.live**
2. Open any `.md` file from this folder
3. Copy the code block (between the triple backticks)
4. Paste into Mermaid Live Editor
5. Click **Download** icon (top right menu)
6. Choose format: **PNG** or **SVG**

### 📦 **METHOD 2 - VS Code Extension**

1. Install extension: **"Markdown Preview Mermaid Support"**
2. Open any `.md` file in VS Code
3. Right-click on the diagram
4. Select **Export as PNG/SVG**

### 💻 **METHOD 3 - Command Line (Advanced)**

**Install mermaid-cli:**
```bash
npm install -g @mermaid-js/mermaid-cli
```

**Convert any diagram to PNG:**
```bash
mmdc -i 01-ER-Diagram-Basic.md -o 01-ER-Diagram-Basic.png
```

**Convert all diagrams:**
```bash
mmdc -i 01-ER-Diagram-Basic.md -o 01-ER-Diagram-Basic.png
mmdc -i 02-Architecture-DataFlow.md -o 02-Architecture-DataFlow.png
mmdc -i 03-Detailed-Schema.md -o 03-Detailed-Schema.png
mmdc -i 04-User-Flow.md -o 04-User-Flow.png
```

### 🌐 **METHOD 4 - GitHub**

1. Commit these files to GitHub
2. GitHub automatically renders Mermaid diagrams
3. Right-click on diagram → Save as image

---

## 📋 Diagram Overview

### 1️⃣ ER Diagram - Basic
- Shows core database entities
- User and Report relationships
- Embedded Analysis and Feedback

### 2️⃣ Architecture & Data Flow
- Frontend components
- Backend controllers
- Database layer
- External API integration
- Complete data flow

### 3️⃣ Detailed Schema
- All fields with descriptions
- Field types and purposes
- Embedded document relationships

### 4️⃣ User Flow
- User registration & login
- Resume upload process
- Analysis generation
- Dashboard interaction
- Feedback viewing

### 5️⃣ Use Case Diagram
- System actors (Job Seeker, Admin, AI)
- All use cases in the system
- Relationships between actors and use cases
- System functionality overview

---

## 🎯 Quick Links

| Action | Link |
|--------|------|
| **View Online** | https://mermaid.live |
| **Mermaid Docs** | https://mermaid.js.org |
| **Mermaid CLI** | https://github.com/mermaid-js/mermaid-cli |
| **VS Code Extension** | https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.mermaid-export |

---

## 💡 Tips

- **SVG format** is better for web (scalable, smaller file size)
- **PNG format** is better for presentations (universal compatibility)
- **For reports**: Use SVG with transparent background
- **For printing**: Use PNG with white background

---

## 📝 Notes

All diagrams are created in **Mermaid** format, which is:
- ✅ Open source
- ✅ Free to use
- ✅ Supports all major platforms
- ✅ Easy to maintain and update

---

**Last Updated:** May 7, 2026
