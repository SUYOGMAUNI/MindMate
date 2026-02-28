<div align="center">

# 🌿 MindMate

**A gentle AI-powered mental wellness companion**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3-F54A28?style=flat-square)](https://groq.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Report Bug](https://github.com/SUYOGMAUNI/MindMate/issues) · [Request Feature](https://github.com/SUYOGMAUNI/MindMate/issues)

</div>

---

## 📖 About

MindMate is a full-stack AI mental wellness chat application that provides a safe, private space for emotional support. Powered by **LLaMA 3 via Groq**, it offers empathetic, context-aware conversations with persistent session history, crisis detection, and a thoughtfully designed interface built for calm and clarity.

> ⚠️ **Disclaimer:** MindMate provides AI-based emotional support and is **not** a substitute for professional mental health care. In an emergency, contact **1166** (Nepal) or **988** (International).

---

## ✨ Features

- 🤖 **AI-Powered Conversations** — Empathetic responses via LLaMA 3.1 (Groq API), context-aware across the full session
- 🧠 **Persistent Sessions** — Multiple named chat sessions saved per user with full message history
- 🆘 **Crisis Detection** — Automatic recognition of crisis keywords with immediate helpline resources
- 🔐 **JWT Authentication** — Secure register/login with token-based auth
- 💬 **Smart Session Titles** — AI auto-generates a meaningful title for each conversation
- ✏️ **Conversation Starters** — Curated prompts to ease users into sharing
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile
- 🌿 **Calming UI** — Organic, nature-inspired design with animated blob backgrounds and typing indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router, Zustand, CSS Modules |
| **Backend** | FastAPI, Python, SQLAlchemy, Alembic |
| **AI** | Groq API (LLaMA 3.1 8B / 70B) |
| **Database** | PostgreSQL |
| **Auth** | JWT (python-jose), bcrypt |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
MindMate/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios instance
│   │   ├── pages/
│   │   │   ├── Chat.jsx           # Main chat interface
│   │   │   ├── Login.jsx          # Auth - Login
│   │   │   └── Register.jsx       # Auth - Register
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js
│
└── backend/
    ├── main.py                    # FastAPI app entry point
    ├── chat_service.py            # Groq API integration
    ├── models.py                  # SQLAlchemy models
    ├── schemas.py                 # Pydantic schemas
    ├── auth.py                    # JWT authentication
    ├── database.py                # DB connection
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL
- A [Groq API key](https://console.groq.com/)

### 1. Clone the repository

```bash
git clone https://github.com/SUYOGMAUNI/MindMate.git
cd MindMate
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mindmate
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_jwt_secret_key_here
```

Run database migrations and start the server:

```bash
alembic upgrade head
uvicorn main:app --reload
```

The API will be live at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The app will be live at `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Your Groq API key |
| `SECRET_KEY` | Secret key for JWT signing |

### Frontend `.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'Add amazing feature'`
4. Push to the branch — `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Suyog Mauni**

- Portfolio: [suyogmauni.com.np](https://suyogmauni.com.np)
- GitHub: [@SUYOGMAUNI](https://github.com/SUYOGMAUNI)

---

<div align="center">
  <sub>Built with 🌿 by <a href="https://suyogmauni.com.np">Suyog Mauni</a></sub>
</div>
