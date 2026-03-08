import pytest
from backend.services.data_normalization import normalize_vendor_data
from backend.services.duplicate_detection import find_duplicate_vendor

class MockVendor:
    def __init__(self, name, email, phone, city):
        self.name = name
        self.email = email
        self.phone = phone
        self.city = city

def test_normalization():
    raw = {
        "name": "  TECH DISTRIBUTORS  ",
        "email": " INFO@TECH.COM ",
        "phone": "+91 99-88-77-66 55",
        "description": "We specialize in Dell and HP Servers",
        "city": "mumbai",
        "area": " andheri "
    }
    
    clean = normalize_vendor_data(raw)
    
    assert clean["name"] == "Tech Distributors"
    assert clean["email"] == "info@tech.com"
    assert clean["phone"] == "+919988776655"
    assert clean["category"] == "Servers"
    assert clean["city"] == "Mumbai"
    assert clean["area"] == "Andheri"

def test_duplicate_detection_exact():
    v1 = MockVendor("Acme", "contact@acme.com", "123", "Delhi")
    
    normalized = {"email": "contact@acme.com", "name": "Fake", "phone": "000"}
    
    dup = find_duplicate_vendor(normalized, [v1])
    assert dup is not None
    assert dup.name == "Acme"

def test_duplicate_detection_fuzzy():
    v1 = MockVendor("Acme Corporation India", "info@acme.com", "123", "Mumbai")
    
    normalized = {"name": "Acme Corporation", "city": "Mumbai", "email": "different@acme.com", "phone": "999"}
    
    dup = find_duplicate_vendor(normalized, [v1])
    assert dup is not None  # "Acme" and "Corporation" intersect + same City
    
def test_duplicate_detection_no_match():
    v1 = MockVendor("Acme Corporation", "info@acme.com", "123", "Mumbai")
    
    normalized = {"name": "Tech Corp", "city": "Delhi", "email": "test@test.com", "phone": "999"}
    
    dup = find_duplicate_vendor(normalized, [v1])
    assert dup is None
