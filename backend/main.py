import uuid
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db, init_db, User, ChatSession, Message
from auth import hash_password, verify_password, create_token, get_current_user
from chat_service import chat_with_groq, auto_title

app = FastAPI(title="MindMate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ── Auth ──────────────────────────────────────────────────────────────────────

class AuthBody(BaseModel):
    email: EmailStr
    password: str


@app.post("/auth/register")
def register(body: AuthBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    return {"access_token": create_token(user.id)}


@app.post("/auth/login")
def login(body: AuthBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token(user.id)}


# ── Sessions ──────────────────────────────────────────────────────────────────

@app.get("/sessions")
def list_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        }
        for s in sessions
    ]


@app.post("/sessions")
def create_session(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = ChatSession(id=str(uuid.uuid4()), user_id=user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "title": session.title, "created_at": session.created_at}


@app.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(404, "Session not found")
    db.delete(session)
    db.commit()


@app.get("/sessions/{session_id}/messages")
def get_messages(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(404, "Session not found")
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at,
        }
        for m in session.messages
    ]


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatBody(BaseModel):
    session_id: str
    message: str


@app.post("/chat")
def send_message(
    body: ChatBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == body.session_id, ChatSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(404, "Session not found")

    is_first = len(session.messages) == 0

    user_msg = Message(
        id=str(uuid.uuid4()),
        session_id=session.id,
        role="user",
        content=body.message,
    )
    db.add(user_msg)
    db.flush()

    try:
        history = session.messages[:-1]  # exclude the just-added user msg; pass prior history
        reply = chat_with_groq(history, body.message)
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

    assistant_msg = Message(
        id=str(uuid.uuid4()),
        session_id=session.id,
        role="assistant",
        content=reply,
    )
    db.add(assistant_msg)

    if is_first:
        session.title = auto_title(body.message)

    session.updated_at = datetime.utcnow()
    db.commit()

    return {"reply": reply, "session_title": session.title}
