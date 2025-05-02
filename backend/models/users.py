from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Text, String
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import UUID
import uuid
from orgs import Organization_member
from base import Base


class Users(Base):
    __tablename__ = "users"
    uudi: Mapped[str] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100))
    interest: Mapped[str] = mapped_column(Text)
    campus: Mapped[str] = mapped_column(String(100))
    orgs: Mapped[list["organization"]] = relationship(
        secondary=Organization_member, back_populates="members"
    )

    embedding: Mapped[list[float]] = mapped_column(Vector(1536))
