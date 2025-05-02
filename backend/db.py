from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.base import Base
import models.events
import models.forums
import models.users
import models.orgs

# Database URL
DATABASE_URL = "postgresql+psycopg2://user:pass@localhost:5432/mydb"

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Ensure required extensions are installed
with engine.connect() as conn:
    conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()

# Create all tables defined on Base.metadata
Base.metadata.create_all(engine)

# Session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
