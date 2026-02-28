from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, Float, DateTime

DATABASE_URL = "sqlite+aiosqlite:///./retail.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class AssociationRule(Base):
    __tablename__ = "association_rules"
    id = Column(Integer, primary_key=True, index=True)
    antecedents = Column(String)
    consequents = Column(String)
    support = Column(Float)
    confidence = Column(Float)
    lift = Column(Float)

class CustomerSegment(Base):
    __tablename__ = "customer_segments"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    segment_name = Column(String)
    recency = Column(Float)
    frequency = Column(Float)
    monetary = Column(Float)
    cluster = Column(Integer)

class KPIStat(Base):
    __tablename__ = "kpi_stats"
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, unique=True, index=True)
    metric_value = Column(Float)
    timestamp = Column(DateTime)

# Dependency to get db session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
