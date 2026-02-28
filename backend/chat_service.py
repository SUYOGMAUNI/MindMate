import os
from groq import Groq
from database import Message

SYSTEM_PROMPT = """You are MindMate, a warm and empathetic mental health support companion. Your role is to:

- Listen actively and respond with genuine compassion and understanding
- Help users explore their feelings without judgment
- Ask thoughtful follow-up questions to better understand their situation
- Offer gentle coping strategies and perspectives when appropriate
- Validate emotions and make users feel heard
- Maintain a calm, grounding presence

Important guidelines:
- You are NOT a therapist or mental health professional
- If someone expresses thoughts of self-harm or suicide, always provide crisis resources:
  Nepal: 1166 (Lifeline Nepal), International: 988 (US), Emergency: 112
  And strongly encourage professional help
- Never diagnose conditions or prescribe treatments
- Keep responses concise but warm — 2 to 4 paragraphs maximum
- Remember details from earlier in the conversation and reference them naturally
- Use the user's name if they have shared it

Start each new conversation warmly but without assuming how the user feels."""

MEMORY_WINDOW = 20  # last N messages sent as context to Groq


def build_messages(history: list[Message], new_content: str) -> list[dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    recent = history[-MEMORY_WINDOW:] if len(history) > MEMORY_WINDOW else history
    for msg in recent:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": new_content})
    return messages


def auto_title(first_message: str) -> str:
    words = first_message.strip().split()
    title = " ".join(words[:6])
    return (title[:50] + "\u2026") if len(title) > 50 else title


def chat_with_groq(history: list[Message], user_message: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set in .env")
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=build_messages(history, user_message),
        temperature=0.7,
        max_tokens=600,
    )
    return response.choices[0].message.content
