from backend.workers.celery_app import celery_app
from backend.models.database import SessionLocal
from backend.models.models import Order, Notification
from datetime import datetime, timedelta

@celery_app.task(name="workers.rfq_followup.check_stale_rfqs_task")
def check_stale_rfqs_task():
    """
    Periodic task to check for RFQs sent over 24 hours ago that haven't received
    any quotes, and notify the user to take manual action or re-broadcast.
    """
    db = SessionLocal()
    try:
        # Find orders in 'RFQ Sent' status older than 24 hours
        yesterday = datetime.utcnow() - timedelta(hours=24)
        
        stale_orders = db.query(Order).filter(
            Order.status == "RFQ Sent",
            Order.updated_at <= yesterday
        ).all()
        
        from backend.models.models import Quote
        for order in stale_orders:
            # Check if there are quotes via direct query
            has_quotes = db.query(Quote).filter(Quote.order_id == order.id).first()
            if not has_quotes:
                notification = Notification(
                    user_id=order.created_by,
                    message=f"Alert: RFQ for '{order.product_name}' (Order RM-{order.id}) was sent over 24 hours ago but no quotes have been received. Consider adjusting the target price or re-broadcasting."
                )
                db.add(notification)
                
                # Update status to avoid spamming
                order.status = "RFQ Stalled"
                
        db.commit()
        
        return {"status": "success", "processed_orders": len(stale_orders)}
        
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
