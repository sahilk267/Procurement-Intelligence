from backend.workers.celery_app import celery_app
from backend.models.database import SessionLocal
from backend.models.models import Order, Vendor, Notification
import time

@celery_app.task(name="workers.rfq_broadcaster.broadcast_rfq_task")
def broadcast_rfq_task(order_id: int, user_id: int):
    """
    Simulates broadcasting an RFQ to relevant vendors.
    """
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"status": "error", "message": f"Order {order_id} not found."}

        # Find vendors in the same category
        vendors = db.query(Vendor).filter(Vendor.category == order.category).all()
        vendor_count = len(vendors)

        # Simulate network delay for sending emails/messages
        time.sleep(2)

        # Update order status in the real world we'd wait for actual confirmations
        order.status = "RFQ Sent"
        
        # Create a notification for the user
        notification = Notification(
            user_id=user_id,
            message=f"RFQ for Order #{order.id} sent to {vendor_count} vendors in {order.category} category."
        )
        db.add(notification)
        
        db.commit()

        return {
            "status": "success", 
            "message": f"RFQ broadcasted to {vendor_count} vendors.",
            "order_id": order_id
        }

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
