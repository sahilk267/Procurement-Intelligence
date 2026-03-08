import pytest
from services.data_normalization import normalize_vendor_data
from services.duplicate_detection import find_duplicate_vendor
from schemas.vendor_schema import VendorCreate

class MockVendor:
    def __init__(self, name, email, phone, city):
        self.name = name
        self.email = email
        self.phone = phone
        self.city = city

def test_normalization():
    raw = {
        "name": " TECH distributors ",
        "email": " INFO@TECH.COM ",
        "phone": " +91-9988-7766-55 (ext 123) ",
        "website": "www.tech-distributors.com ",
        "description": "We sell hp servers and racks",
        "city": "mumbai",
        "area": " andheri  "
    }
    
    clean_dict = normalize_vendor_data(raw)
    clean_schema = VendorCreate(**clean_dict).model_dump()
    
    assert clean_schema["name"] == "Tech Distributors"
    assert clean_schema["email"] == "info@tech.com"
    assert clean_schema["phone"] == "+91998877665512"
    assert clean_schema["category"] == "Servers"
    assert clean_schema["city"] == "Mumbai"
    assert clean_schema["area"] == "Andheri"
    assert clean_schema["website"] == "https://www.tech-distributors.com"

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
