#!/usr/bin/env python3
"""
MindMate — Database Creation Script
Run this once before starting the backend for the first time.
Usage: python create_db.py
"""

import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/mindmate")

# Parse connection string
# Format: postgresql://user:password@host/dbname
try:
    without_scheme = DATABASE_URL.replace("postgresql://", "")
    user_pass, rest = without_scheme.split("@")
    host_db = rest.split("/")
    host = host_db[0]
    db_name = host_db[1] if len(host_db) > 1 else "mindmate"

    if ":" in user_pass:
        user, password = user_pass.split(":", 1)
    else:
        user = user_pass
        password = ""
except Exception:
    print("❌  Could not parse DATABASE_URL from .env")
    print("    Expected format: postgresql://user:password@host/dbname")
    sys.exit(1)


def create_database():
    print(f"\n  Connecting to PostgreSQL as '{user}' on '{host}'...")
    try:
        # Connect to the default 'postgres' database first
        conn = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()

        # Check if DB already exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        exists = cur.fetchone()

        if exists:
            print(f"  ↷  Database '{db_name}' already exists — skipping creation")
        else:
            cur.execute(f'CREATE DATABASE "{db_name}"')
            print(f"  ✔  Database '{db_name}' created successfully")

        cur.close()
        conn.close()

    except psycopg2.OperationalError as e:
        print(f"\n❌  Could not connect to PostgreSQL:\n    {e}")
        print("\n  Check that:")
        print("  - PostgreSQL is running")
        print("  - Your DATABASE_URL in .env has the correct password")
        print("  - The user has permission to create databases")
        sys.exit(1)


def create_tables():
    print(f"\n  Creating tables in '{db_name}'...")
    try:
        # Now import and run init_db from database.py
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from database import init_db
        init_db()
        print("  ✔  Tables created (users, chat_sessions, messages)")
    except Exception as e:
        print(f"  ✗  Failed to create tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("─" * 50)
    print("  MindMate — Database Setup")
    print("─" * 50)

    create_database()
    create_tables()

    print("\n  ✅  All done! You can now start the backend:")
    print("      uvicorn main:app --reload --port 8000\n")