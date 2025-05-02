from datetime import date
from datetime import datetime
from sqlalchemy import (
    Table,
    Text,
    DateTime,
    ForeignKey,
    Column,
    String,
    Date,
    text,
    create_engine,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from pgvector.sqlalchemy import Vector

import uuid


class Base(DeclarativeBase):
    """Shared base class for all models"""

    pass


organization_member = Table(
    "organization_member",
    Base.metadata,
    Column("Organization_id", ForeignKey("organization.id"), primary_key=True),
    Column("User_id", ForeignKey("user.id"), primary_key=True),
)

forum_users = Table(
    "form_users",
    Base.metadata,
    Column("forum_id", ForeignKey("forum.id"), primary_key=True),
    Column("user_id", ForeignKey("user.id"), primary_key=True),
)


class Organization(Base):
    __tablename__ = "organization"
    id: Mapped[str] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(100))
    campus: Mapped[str] = mapped_column(String(100))
    image: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    tags: Mapped[str] = mapped_column(Text)
    members: Mapped[list["User"]] = relationship(
        secondary=organization_member, back_populates="orgs"
    )
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))


class User(Base):
    __tablename__ = "user"
    id: Mapped[str] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100))
    interest: Mapped[str] = mapped_column(Text)
    campus: Mapped[str] = mapped_column(String(100))
    orgs: Mapped[list["Organization"]] = relationship(
        secondary=organization_member, back_populates="members"
    )
    forums: Mapped[list["Forum"]] = relationship(
        secondary=forum_users,
        back_populates="user",
    )
    posts: Mapped[list["Post"]] = relationship(back_populates="author")
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, default=func.now())
    location: Mapped[str | None] = mapped_column(Text)
    image: Mapped[str | None] = mapped_column(
        Text, comment="Local file URL or external URL"
    )
    description: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[str | None] = mapped_column(Text, comment="Comma-separated tags")
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))


class Forum(Base):
    __tablename__ = "forum"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    image: Mapped[str | None] = mapped_column(Text)

    # Relationships
    posts: Mapped[list["Post"]] = relationship(
        back_populates="forum",
        cascade="all, delete-orphan",
    )
    user: Mapped[list["User"]] = relationship(
        secondary=forum_users,
        back_populates="forums",
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    forum_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("forum.id"), nullable=False
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )

    # Relationships
    forum: Mapped[Forum] = relationship(back_populates="posts")
    author: Mapped["User"] = relationship(back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("posts.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    content: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )

    # Relationships
    post: Mapped["Post"] = relationship(back_populates="comments")
    user: Mapped["User"] = relationship(back_populates="comments")


from dotenv import load_dotenv
import os

load_dotenv()
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}"
# Create engine
engine = create_engine(DATABASE_URL)

# Create all tables defined on Base.metadata
Base.metadata.create_all(engine)

# Session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
