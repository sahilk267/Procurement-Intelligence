from workers.celery_app import celery_app
from models.database import SessionLocal
from models.models import Order, Vendor, Notification
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

        from services.vendor_filter import filter_vendors_for_rfq
        
        # Get all vendors
        all_vendors = db.query(Vendor).all()
        # Filter best vendors
        selected_vendors = filter_vendors_for_rfq(order, all_vendors)
        vendor_count = len(selected_vendors)
        
        if vendor_count == 0:
            return {"status": "error", "message": f"No suitable vendors found for order {order_id}."}

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
