import uuid
from datetime import date
from sqlalchemy import Text, Date, Table
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from pgvector.sqlalchemy import Vector
from base import Base


class Event(Base):
    __tablename__ = "events"

    # Use native UUID column for ID
    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str | None] = mapped_column(Text)
    image: Mapped[str | None] = mapped_column(
        Text, comment="Local file URL or external URL"
    )
    description: Mapped[str | None] = mapped_column(Text)
    # Tags as comma-separated text
    tags: Mapped[str | None] = mapped_column(Text, comment="Comma-separated tags")
    # Vector embedding
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))
