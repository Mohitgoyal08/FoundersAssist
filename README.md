# 🚀 FoundersAssist

**FoundersAssist** is an AI-powered backend platform designed to help early-stage startup founders manage their ventures efficiently. It provides tools for startup profile management, task tracking, legal document generation, board meeting scheduling, team notifications, startup health scoring, and an AI-powered chatbot advisor — all through a secure REST API.

---

## 🛠️ Technology Stack and Tools Used

| Category | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Database** | MongoDB (via Mongoose) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **AI Integration** | Google Gemini API |
| **Email Service** | Nodemailer |
| **PDF Generation** | PDFKit |
| **Environment Config** | dotenv |
| **Dev Tool** | Nodemon |
| **API Style** | RESTful |

---

## ✨ Features and Functionalities Implemented

### 🔐 Authentication & Authorization
- User registration and login with hashed passwords (bcryptjs)
- OTP-based email verification
- JWT-based session management
- Role-based access control middleware

### 🏢 Startup Management
- Create and manage a startup profile (name, industry, stage, team size, website)
- Activity logging for all major startup events

### ✅ Task Management
- Create, read, update, and delete tasks
- Task status updates with startup-scoped ownership

### 📄 Document Generation
- AI-assisted generation of legal documents (NDAs, co-founder agreements, etc.)
- PDF download support via PDFKit
- Document storage and retrieval per startup

### 📅 Board Meeting Management
- Schedule and manage board meetings
- Meeting records linked to startup profile

### 🤖 AI Chatbot Advisor
- Powered by Google Gemini API
- Startup-context-aware conversations
- Persistent chat history per user
- Smart fallback responses for offline/API-unavailable scenarios
- Covers topics: fundraising, pitch decks, GTM strategy, legal registration, key metrics

### 📊 Startup Health Score
- Track and update startup health metrics
- Historical health scoring records

### 👤 User Profile Management
- View and update user profile
- Profile linked to startup data

### 🔔 Notification System
- In-app notifications for key events
- Notification read/unread status management

### 📧 Email Service
- OTP and verification emails via Nodemailer
- Configurable SMTP setup

---

## ⚙️ Installation / Execution Steps to Run the Project

### Prerequisites
- Node.js (v18 or above)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Gmail account (for Nodemailer SMTP)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/Mohitgoyal08/FoundersAssist.git
cd FoundersAssist
```

**2. Install dependencies**
```bash
npm install
```

**3. Create a `.env` file in the root directory**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

**4. Run the development server**
```bash
npm run dev
```

**5. The server will start at:**
```
http://localhost:5000
```

### API Base Routes
| Route | Description |
|---|---|
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Login and receive JWT |
| `GET/POST /api/startups` | Manage startup profile |
| `GET/POST /api/tasks` | Manage tasks |
| `POST /api/documents/generate` | Generate legal document |
| `GET /api/documents/:id/download` | Download document as PDF |
| `POST /api/ai/chat` | Chat with AI advisor |
| `GET /api/health` | Get startup health score |
| `GET /api/notifications` | Fetch notifications |
| `GET /api/profile` | Get user profile |

---

## 👥 Team Members

| Name | Role |
|---|---|
| Mohit Goyal | Backend Developer |
| Mohit Bajpai | Frontend Devloper |
| Mohid Sheikh | API handling and ui design |

---


## 📁 Project Structure

```
FoundersAssist/
├── config/           # DB and email configuration
├── controllers/      # Route handler logic
├── middleware/       # Auth, error, and role middlewares
├── models/           # Mongoose schemas
├── routes/           # Express route definitions
├── services/         # Gemini AI, email, PDF services
├── utils/            # Token, OTP, document template helpers
├── server.js         # App entry point
└── package.json
```

---

## 📜 License

This project was developed as a Mini Project submission for academic evaluation.