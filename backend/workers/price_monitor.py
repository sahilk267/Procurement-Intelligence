from backend.workers.celery_app import celery_app
from backend.models.database import SessionLocal
from backend.models.models import PriceHistory, Vendor
from decimal import Decimal
import random

@celery_app.task(name="workers.price_monitor.monitor_prices_task")
def monitor_prices_task():
    """
    Simulated task to monitor price variations of items and flag drops.
    """
    db = SessionLocal()
    try:
        vendor = db.query(Vendor).first()
        if not vendor:
            return {"status": "skipped", "message": "No vendors found"}

        # Simulate fetching an external market API
        mock_price = Decimal(random.randint(5000, 20000))

        history = PriceHistory(
            product_name="Cisco Router 2900 series",
            brand="Cisco",
            category="Networking",
            price=mock_price,
            vendor_id=vendor.id
        )
        db.add(history)
        db.commit()

        # In a real implementation we would compare against the moving
        # average and generate a Notification/Alert if dropping > 10%
        return {"status": "success", "recorded_price": float(mock_price)}

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
