from workers.celery_app import celery_app
from models.database import SessionLocal
from models.models import Lead
import random

MOCK_LEADS = [
    {"company_name": "Tech Corp Solutions", "contact_person": "Rahul Sharma", "email": "rahul@techcorpsol.in", "interest_category": "Servers", "source": "LinkedIn"},
    {"company_name": "SME Networks", "contact_person": "Priya Gupta", "email": "priya@smenet.com", "interest_category": "Networking", "source": "TradeIndia"},
]

@celery_app.task(name="workers.lead_scraper.scrape_leads_task")
def scrape_leads_task():
    """
    Simulated task checking LinkedIn/Job boards for procurement leads.
    """
    db = SessionLocal()
    added = 0
    try:
        v_data = random.choice(MOCK_LEADS)
        
        # Ensure distinct by email
        existing = db.query(Lead).filter(Lead.email == v_data['email']).first()
        if not existing:
            lead = Lead(**v_data)
            db.add(lead)
            db.commit()
            added += 1

        return {"status": "success", "leads_added": added}

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
