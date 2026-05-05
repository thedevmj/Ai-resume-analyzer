🤖 AI Resume Analyzer (MERN Stack)

An intelligent web application that analyzes resumes using AI techniques and provides feedback, scoring, and insights to improve job applications.

---

 🚀 Overview

The AI Resume Analyzer is a full-stack web application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.
It allows users to upload resumes, analyze them using AI-based techniques, and receive a detailed report including scores and suggestions.

This project aims to simplify the recruitment process and help job seekers improve their resumes effectively.

---

 ✨ Features

* 🔐 User Authentication (JWT-based login & registration)
* 📄 Resume Upload (PDF/DOC support)
* 🧠 AI-based Resume Analysis
* 📊 Resume Scoring System
* 💡 Feedback & Suggestions
* 🗂️ Report Storage (MongoDB)
* 📜 View Previous Reports
* ⚡ Fast & Responsive UI

---

 🛠️ Tech Stack

Frontend

* React.js
* HTML5, CSS3, JavaScript

Backend

* Node.js
* Express.js

Database

* MongoDB (Mongoose)

Authentication & Security

* JSON Web Token (JWT)
* bcrypt.js

---

📁 Project Structure

```
.
├── client/                 # React Frontend
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   ├── controllers/        # Business Logic
│   └── middleware/         # Auth Middleware
├── uploads/                # Resume Storage
└── README.md
```

---

 ⚙️ Installation & Setup

 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
```

---

 2️⃣ Install dependencies

 Backend

```bash
cd server
npm install
```

 Frontend

```bash
cd client
npm install
```

---

3️⃣ Environment Variables

Create a `.env` file in the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=1d
```

---

 4️⃣ Run the application

 Start backend:

```bash
npm run dev
```

 Start frontend:

```bash
npm start
```

---

 🔄 How It Works

1. User registers or logs in securely
2. JWT token is generated for authentication
3. User uploads a resume
4. Resume is processed and text is extracted
5. AI analyzes skills, keywords, and structure
6. Score and feedback are generated
7. Results are stored in MongoDB
8. User can view previous reports anytime

---

🧩 Database Models

 User Model

* email
* password (hashed using bcrypt)

Report Model

* user (reference)
* name
* analysis (AI output)
* score
* createdAt

---

🔐 Security Features

* Password hashing using bcrypt
* JWT-based authentication
* Protected API routes
* Secure data handling

---

 📸 Screenshots

> Add your project screenshots here
> Example:
>
> * Login Page
> * Resume Upload
> * Analysis Result

---

 🚀 Future Enhancements

* 📌 Job description matching
* 📌 Resume keyword optimization
* 📌 AI-powered suggestions using advanced NLP
* 📌 Recruiter dashboard
* 📌 Resume ranking system

---

 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

 📄 License

This project is licensed under the MIT License.

---

👨‍💻 Author

Developed by mohammad junaid

---
⭐ Support

If you like this project, give it a ⭐ on GitHub!
