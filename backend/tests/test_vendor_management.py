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
from models.models import Base, User, Vendor

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def auth_token(test_db):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpass"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    return login_response.json()["access_token"]

def test_vendor_enrichment_fields(auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "name": "Enriched Vendor",
        "city": "Mumbai",
        "area": "Lamington Road",
        "category": "Networking",
        "discovery_source": "IndiaMART",
        "years_in_business": 10,
        "employee_count": 50,
        "google_rating": 4.5
    }
    
    # Create vendor
    response = client.post("/api/v1/vendors", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["discovery_source"] == "IndiaMART"
    assert data["years_in_business"] == 10
    assert data["google_rating"] == 4.5
    
    vendor_id = data["id"]
    
    # Test scoring endpoint
    score_response = client.get(f"/api/v1/vendors/{vendor_id}/score", headers=headers)
    assert score_response.status_code == 200
    score_data = score_response.json()
    
    assert "total_score" in score_data
    assert score_data["breakdown"]["location_score"] == 30.0  # Lamington Road priority
    assert score_data["breakdown"]["rating_score"] == 36.0    # 4.5 / 5.0 * 40.0

def test_vendor_search(auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Create three vendors
    client.post("/api/v1/vendors", json={"name": "Cisco Systems India", "category": "Networking", "city": "Bangalore"}, headers=headers)
    client.post("/api/v1/vendors", json={"name": "Dell Technologies", "category": "Servers", "city": "Mumbai"}, headers=headers)
    client.post("/api/v1/vendors", json={"name": "Apex Networking Solutions", "category": "Accessories", "city": "Pune"}, headers=headers)
    
    # Search by part of name
    res1 = client.get("/api/v1/vendors/search?q=cisco", headers=headers)
    assert len(res1.json()) == 1
    assert res1.json()[0]["name"] == "Cisco Systems India"
    
    # Search by part of category
    res2 = client.get("/api/v1/vendors/search?q=Network", headers=headers)
    assert len(res2.json()) == 2  # Cisco Systems India and Apex Networking Solutions
    
    # Search by city
    res3 = client.get("/api/v1/vendors/search?q=Mumb", headers=headers)
    assert len(res3.json()) == 1
    assert res3.json()[0]["city"] == "Mumbai"
