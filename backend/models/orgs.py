from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Text, String, Table, ForeignKey, Column
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import UUID
import uuid
from base import Base


Organization_member = Table(
    "association_table",
    Base.metadata,
    Column("left_id", ForeignKey("left_table.id"), primary_key=True),
    Column("right_id", ForeignKey("right_table.id"), primary_key=True),
)


class Organization(Base):
    __tablename__ = "organization"
    id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(100))
    campus: Mapped[str] = mapped_column(String(100))
    image: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    tags: Mapped[str] = mapped_column(Text)
    members: Mapped[list["users"]] = relationship(
        secondary=Organization_member, back_populates="orgs"
    )
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))
