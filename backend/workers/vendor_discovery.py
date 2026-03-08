from backend.workers.celery_app import celery_app
from backend.models.database import SessionLocal
from backend.models.models import Vendor
import random
import time

from backend.services.data_normalization import normalize_vendor_data
from backend.services.duplicate_detection import find_duplicate_vendor

MOCK_VENDORS = [
    {"name": "Elite IT Supplies", "city": "Mumbai", "area": "Lamington Road", "description": "We sell Cisco switches and networking gear", "source": "IndiaMART", "phone": "+91-98765-43210", "email": "contact@eliteit.com"},
    {"name": "Lamington Hardware Hub", "city": "Mumbai", "area": "Lamington Road", "description": "Best servers from Dell and HP", "source": "JustDial", "phone": "99 88 77 66 55"},
    {"name": "TechPro Distributors", "city": "Delhi", "area": "Nehru Place", "description": "Desktops and laptops", "source": "Google Maps", "phone": "11-22334455"},
]

@celery_app.task(name="workers.vendor_discovery.discover_vendors_task")
def discover_vendors_task():
    """
    Simulated task to scrape vendor data from internal/external sources
    and inject into the Vendor database.
    """
    db = SessionLocal()
    found_count = 0
    try:
        # Simulate scraping delay
        time.sleep(1.5)
        
        # In a real scenario, this involves beautifulsoup scraping IndiaMart etc.
        # Randomly pick 1-2 generic mock vendors to "discover"
        samples = random.sample(MOCK_VENDORS, k=random.randint(1, 2))
        
        existing_vendors = db.query(Vendor).all()

        for raw_v_data in samples:
            # Phase 4 Engine Pipeline:
            # 1. Normalize
            normalized_data = normalize_vendor_data(raw_v_data)
            
            # 2. Duplicate Check
            is_dup = find_duplicate_vendor(normalized_data, existing_vendors)
            
            if not is_dup:
                # 3. Add to Database
                vendor = Vendor(
                    name=normalized_data["name"],
                    email=normalized_data.get("email"),
                    phone=normalized_data.get("phone"),
                    discovery_source=normalized_data.get("discovery_source"),
                    city=normalized_data.get("city"),
                    area=normalized_data.get("area"),
                    category=normalized_data.get("category"),
                    website=normalized_data.get("website")
                )
                db.add(vendor)
                existing_vendors.append(vendor) # Update active list to prevent immediate dupes
                found_count += 1
        
        if found_count > 0:
            db.commit()

        return {"status": "success", "vendors_discovered": found_count}

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
