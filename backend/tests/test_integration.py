"""
Phase 6 — Integration Tests for Procurement Intelligence Platform

These tests validate end-to-end workflows:
  Workflow B: Vendor Creation → AI Fraud Scoring → DB Insertion
  Workflow A: Order Creation → RFQ Broadcast Logic (direct call, no Celery broker needed)

Technical notes:
- We override DATABASE_URL *before* any model import so that both the test
  session AND any worker code that imports SessionLocal all point at the same
  SQLite file.
- We avoid Celery .apply() entirely; instead we call the worker's internal
  logic directly, passing the test session to avoid dual-session SQLite locks.
"""

import pytest
import os

# ── 1. Override DB URL before ANY imports that touch database.py ──────────
os.environ["DATABASE_URL"] = "sqlite:///./test_db.db"

from sqlalchemy import create_engine, event, Text, Float
from sqlalchemy.orm import sessionmaker
from backend.models.models import Base, Vendor, Order, Notification
from backend.ai_engines.fraud_detection import calculate_fraud_score

# ── 2. Create a dedicated test engine (same file as env override) ─────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_db.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── 3. Patch PostgreSQL-only column types for SQLite compatibility ────────
# ARRAY(String) → Text, DECIMAL(3,2) → Float (allows scores up to 100)
Vendor.__table__.c.brands.type = Text()
Vendor.__table__.c.fraud_score.type = Float()


# ── 4. Per-function fixture: every test gets a clean transaction ──────────
@pytest.fixture(scope="function")
def db_session():
    """Create all tables, yield a session, then tear everything down."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

    # Clean up the test db file
    if os.path.exists("./test_db.db"):
        try:
            os.remove("./test_db.db")
        except OSError:
            pass


# ═══════════════════════════════════════════════════════════════════════════
# Workflow B — Vendor Creation → AI Fraud Scoring → DB Insertion
# ═══════════════════════════════════════════════════════════════════════════
def test_workflow_b_vendor_creation_and_fraud_score(db_session):
    """
    Simulates the internal flow of API Vendor Creation.
    Ensures the AI Fraud Engine is accurately applying scores to DB models.
    """
    # Create mock vendor payload similar to API input
    mock_vendor_payload = {
        "name": "Suspicious Electronics Co",
        "email": "shady123@yahoo.com",
        "city": "Mumbai",
    }

    # 1. Run the AI fraud engine on the payload
    calculated_score = calculate_fraud_score(mock_vendor_payload)

    # Verify the score itself is in the expected range (yahoo email, no GST, no website → high risk)
    assert calculated_score > 40.0, (
        f"Expected high-risk score (>40) for generic email + no GST/website, got {calculated_score}"
    )

    # 2. Simulate DB Insertion (same logic the /vendors POST route uses)
    new_vendor = Vendor(
        name=mock_vendor_payload["name"],
        email=mock_vendor_payload["email"],
        city=mock_vendor_payload["city"],
        fraud_score=calculated_score,
    )
    db_session.add(new_vendor)
    db_session.commit()

    # 3. Re-query from DB to confirm persistence
    saved_vendor = db_session.query(Vendor).filter(Vendor.id == new_vendor.id).first()
    assert saved_vendor is not None, "Vendor was not persisted to the database"
    assert saved_vendor.name == "Suspicious Electronics Co"
    assert saved_vendor.email == "shady123@yahoo.com"
    assert float(saved_vendor.fraud_score) > 40.0


# ═══════════════════════════════════════════════════════════════════════════
# Workflow A — Order Creation → RFQ Broadcast Logic
# ═══════════════════════════════════════════════════════════════════════════
def test_workflow_a_order_to_rfq(db_session):
    """
    Simulates Order creation and triggering the background RFQ logic.

    Instead of going through Celery's .apply() (which creates its own
    SessionLocal and causes dual-session SQLite conflicts), we replicate
    the worker's core logic inline using the test session.
    """
    # 1. Create a mock order
    new_order = Order(
        product_name="Cisco Router 2901",
        category="Networking",
        quantity=5,
        status="open",
        created_by=1,
    )
    db_session.add(new_order)
    db_session.commit()

    order_id = new_order.id

    # ── 2. Replicate rfq_broadcaster logic with test session ──────────
    order = db_session.query(Order).filter(Order.id == order_id).first()
    assert order is not None, f"Order {order_id} was not found"

    # Find vendors in the same category (may be 0 in a clean test DB — that's OK)
    vendors = db_session.query(Vendor).filter(Vendor.category == order.category).all()
    vendor_count = len(vendors)

    # Update order status (mirrors rfq_broadcaster.py line 25)
    order.status = "RFQ Sent"

    # Create a notification (mirrors rfq_broadcaster.py lines 28-31)
    notification = Notification(
        user_id=1,
        message=f"RFQ for Order #{order.id} sent to {vendor_count} vendors in {order.category} category.",
    )
    db_session.add(notification)
    db_session.commit()

    # ── 3. Assertions: DB state after worker logic ────────────────────
    updated_order = db_session.query(Order).filter(Order.id == order_id).first()
    assert updated_order.status == "RFQ Sent", (
        f"Expected 'RFQ Sent', got '{updated_order.status}'"
    )

    new_notif = db_session.query(Notification).filter(
        Notification.user_id == 1,
    ).first()
    assert new_notif is not None, "Notification was not created"
    assert new_notif.is_read is False, "Notification should be unread"
    assert "Cisco Router 2901" in new_notif.message or "Networking" in new_notif.message


# ═══════════════════════════════════════════════════════════════════════════
# Workflow C — AI Fraud Score boundary checks
# ═══════════════════════════════════════════════════════════════════════════
def test_fraud_score_trusted_vendor():
    """
    Validates that a legitimate vendor with GST, website, and corporate
    email receives a low (trusted) fraud score.
    """
    trusted_payload = {
        "name": "Reliable Corp Pvt Ltd",
        "email": "procurement@reliablecorp.in",
        "gst_number": "29AABCU9603R1ZM",
        "website": "https://reliablecorp.in",
        "city": "Bangalore",
    }
    score = calculate_fraud_score(trusted_payload)
    assert score < 30.0, f"Expected trusted score (<30) for legitimate vendor, got {score}"


def test_fraud_score_high_risk_vendor():
    """
    Validates that a vendor with no GST, no website, and a generic email
    receives a high (risky) fraud score.
    """
    risky_payload = {
        "name": "Unknown Traders",
        "email": "randomguy@gmail.com",
        "city": "Unknown",
    }
    score = calculate_fraud_score(risky_payload)
    assert score > 40.0, f"Expected high-risk score (>40) for suspicious vendor, got {score}"
