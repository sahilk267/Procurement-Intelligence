import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app
from models.database import get_db
from models.models import Base, User, Vendor, Order, Quote, Lead

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function")
def test_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables
    Base.metadata.drop_all(bind=engine)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Procurement Intelligence Platform API"}

def test_create_user():
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"

def test_login():
    # First create a user
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )

    # Then login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_create_vendor():
    # Create user and login first
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]

    # Create vendor
    response = client.post(
        "/api/v1/vendors",
        json={
            "name": "Test Vendor",
            "city": "Mumbai",
            "category": "Networking",
            "email": "vendor@test.com"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Vendor"
    assert data["city"] == "Mumbai"

def test_get_vendors():
    # Create user and login
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]

    # Create vendor
    client.post(
        "/api/v1/vendors",
        json={
            "name": "Test Vendor",
            "city": "Mumbai",
            "category": "Networking"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Get vendors
    response = client.get("/api/v1/vendors")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Vendor"

def test_create_order():
    # Create user and login
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]

    # Create order
    response = client.post(
        "/api/v1/orders",
        json={
            "product_name": "Cisco Switch",
            "category": "Networking",
            "quantity": 10,
            "target_price": 50000.00
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["product_name"] == "Cisco Switch"
    assert data["quantity"] == 10

def test_create_quote():
    # Create user and login
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]

    # Create vendor
    vendor_response = client.post(
        "/api/v1/vendors",
        json={
            "name": "Test Vendor",
            "city": "Mumbai",
            "category": "Networking"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    vendor_id = vendor_response.json()["id"]

    # Create order
    order_response = client.post(
        "/api/v1/orders",
        json={
            "product_name": "Cisco Switch",
            "category": "Networking",
            "quantity": 10
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    order_id = order_response.json()["id"]

    # Create quote
    response = client.post(
        "/api/v1/quotes",
        json={
            "vendor_id": vendor_id,
            "order_id": order_id,
            "quoted_price": 45000.00,
            "quantity_available": 10
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quoted_price"] == 45000.00
    assert data["vendor_id"] == vendor_id

def test_analytics():
    # Create user and login
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]

    # Test vendor analytics
    response = client.get(
        "/api/v1/analytics/vendors",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_vendors" in data

    # Test deal analytics
    response = client.get(
        "/api/v1/analytics/deals",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_orders" in data

def test_create_lead():
    # Create user and login
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]

    # Create lead
    response = client.post(
        "/api/v1/leads",
        json={
            "company_name": "Test Company",
            "contact_person": "John Doe",
            "email": "john@testcompany.com",
            "interest_category": "Networking"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Test Company"
    assert data["contact_person"] == "John Doe"

def test_unauthorized_access():
    # Try to access protected endpoint without token
    response = client.post(
        "/api/v1/vendors",
        json={"name": "Test Vendor"}
    )
    assert response.status_code == 401

def test_invalid_login():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "invalid@example.com", "password": "wrongpass"}
    )
    assert response.status_code == 401