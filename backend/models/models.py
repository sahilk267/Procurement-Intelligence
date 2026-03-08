from models.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, DECIMAL, ARRAY, Date, Float, ForeignKey, TypeDecorator
import json
from datetime import datetime
from sqlalchemy.orm import relationship

class StringArray(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import ARRAY
            return dialect.type_descriptor(ARRAY(String))
        else:
            return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if dialect.name == 'postgresql':
            return value
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if dialect.name == 'postgresql':
            return value
        if value is not None:
            return json.loads(value)
        return value

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="operator")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    city = Column(String(100), index=True)
    area = Column(String(100))
    category = Column(String(100), index=True)
    brands = Column(StringArray)  # Array of brands
    product_condition = Column(String(50))  # new, used, both
    email = Column(String(255))
    phone = Column(String(20))
    website = Column(String(255))
    gst_number = Column(String(50))
    verification_status = Column(Boolean, default=False)
    fraud_score = Column(DECIMAL(5,2), default=0.0)
    discovery_source = Column(String(100), default="manual")
    years_in_business = Column(Integer, nullable=True)
    employee_count = Column(Integer, nullable=True)
    google_rating = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), nullable=False)
    brand = Column(String(100))
    category = Column(String(100))
    quantity = Column(Integer, nullable=False)
    target_price = Column(DECIMAL(10,2))
    condition = Column(String(50))
    location = Column(String(255))
    deadline = Column(Date)
    status = Column(String(50), default="open", index=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    quoted_price = Column(DECIMAL(10,2), nullable=False)
    quantity_available = Column(Integer)
    delivery_time = Column(Integer)  # days
    created_at = Column(DateTime, default=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    interest_category = Column(String(100), index=True)
    source = Column(String(100))
    status = Column(String(50), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255))
    brand = Column(String(100))
    category = Column(String(100), index=True)
    price = Column(DECIMAL(10,2))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), nullable=False)
    brand = Column(String(100))
    category = Column(String(100))
    estimated_margin = Column(DECIMAL(10,2))
    inventory_size = Column(Integer)
    source = Column(String(100))  # vendor_quote, marketplace, social_media
    location = Column(String(255))
    score = Column(Float, default=0.0)
    signal_type = Column(String(50), index=True)  # price_drop, bulk_inventory, demand_spike
    status = Column(String(50), default="detected")  # detected, actioned, expired
    created_at = Column(DateTime, default=datetime.utcnow)

class AIVendorScore(Base):
    __tablename__ = "ai_vendor_scores"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    reliability_score = Column(Float, default=0.0)
    response_score = Column(Float, default=0.0)
    delivery_score = Column(Float, default=0.0)
    composite_score = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=datetime.utcnow)

class AIDealPrediction(Base):
    __tablename__ = "ai_deal_predictions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    success_probability = Column(Float, default=0.0)
    predicted_margin = Column(DECIMAL(10,2))
    recommendation = Column(Text)
    predicted_at = Column(DateTime, default=datetime.utcnow)

class AIPricePrediction(Base):
    __tablename__ = "ai_price_predictions"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255))
    category = Column(String(100))
    current_price = Column(DECIMAL(10,2))
    predicted_price = Column(DECIMAL(10,2))
    prediction_date = Column(Date)
    confidence = Column(Float, default=0.0)
    predicted_at = Column(DateTime, default=datetime.utcnow)

class AIAlert(Base):
    __tablename__ = "ai_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)  # high_margin, high_risk, slow_response, price_drop
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info")  # info, warning, critical
    related_vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    related_order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NegotiationLog(Base):
    __tablename__ = "negotiation_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    quote_id = Column(Integer, ForeignKey("quotes.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    round_number = Column(Integer, default=1)
    previous_price = Column(DECIMAL(10,2))
    offered_price = Column(DECIMAL(10,2))
    status = Column(String(50), default="sent")  # sent, accepted, rejected, counter_offered
    message_content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)