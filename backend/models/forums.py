import uuid
from datetime import datetime
from sqlalchemy import Table, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from pgvector.sqlalchemy import Vector
from base import Base


# Custom now function
def now():
    return str(datetime.now())


# Association table for forum memberships
forum_members: Table = Table(
    "forum_members",
    Base.metadata,
    mapped_column("forum_id", PGUUID(as_uuid=True), primary_key=True, nullable=False),
    mapped_column("user_uuid", PGUUID(as_uuid=True), primary_key=True, nullable=False),
)


class Forum(Base):
    __tablename__ = "forums"

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
    members: Mapped[list["User"]] = relationship(
        secondary=forum_members,
        back_populates="forums",
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    forum_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    author_uuid: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), default=now, nullable=False
    )

    # Relationships
    forum: Mapped[Forum] = relationship(back_populates="posts")
    author: Mapped["User"] = relationship(back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # other event fields...
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))
    # tags as comma-separated text
    tags: Mapped[str | None] = mapped_column(Text)


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    comment: Mapped[str | None] = mapped_column(Text)
    post_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    forum_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    user_uuid: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), default=now, nullable=False
    )

    # Relationships
    post: Mapped[Post] = relationship(back_populates="comments")
    forum: Mapped[Forum]
    user: Mapped["User"] = relationship(back_populates="comments")
