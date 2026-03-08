from backend.workers.celery_app import celery_app
from backend.models.database import SessionLocal
from backend.models.models import PriceHistory, Vendor, Opportunity, Notification
from backend.ai_engines.opportunity_detector import detect_market_opportunity
from datetime import datetime, timedelta

@celery_app.task(name="workers.price_monitor.monitor_prices_task")
def monitor_prices_task():
    """
    Periodic task to scan the most recent prices (simulated or scraped) and
    identify market opportunities. Generates alerts for procurement teams.
    """
    db = SessionLocal()
    try:
        # In a real system, you'd select the latest PriceHistory entries tracked today
        # For this simulation, we'll pick unique product IDs from PriceHistory
        
        # Get all recent products tracked in the last 24h
        yesterday = datetime.utcnow() - timedelta(hours=24)
        recent_prices = db.query(PriceHistory).filter(PriceHistory.date >= yesterday).all()
        
        # Group by product
        product_prices = {}
        for p in recent_prices:
            if p.product_name not in product_prices:
                product_prices[p.product_name] = []
            product_prices[p.product_name].append(p)
            
        ops_created = 0
            
        for product_name, prices in product_prices.items():
            # Get latest price vs historical
            # Assuming prices are sorted or just take the min as current if scraped simultaneously 
            # In a real app we'd query historical averages explicitly.
            # Let's mock a historical average for demonstration
            historical_avg = 500.0 # Mock standard price
            
            for current_data in prices:
                # Mock high inventory randomly for simulation
                mock_qty = 600 if current_data.price < 400 else 100
                
                opportunity = detect_market_opportunity(
                    current_price=float(current_data.price),
                    historical_prices=[historical_avg, historical_avg*1.05, historical_avg*0.95],
                    inventory_qty=mock_qty
                )
                
                if opportunity and opportunity["score"] > 50:
                    # Avoid duplicate active ops for same product+vendor
                    existing_op = db.query(Opportunity).filter(
                        Opportunity.product_name == product_name,
                        Opportunity.vendor_id == current_data.vendor_id,
                        Opportunity.status == "active"
                    ).first()
                    
                    if not existing_op:
                        new_op = Opportunity(
                            product_name=product_name,
                            vendor_id=current_data.vendor_id,
                            opportunity_type="Price Drop" if "price drop" in opportunity["signals"][0].lower() else "Bulk Overstock",
                            score=opportunity["score"],
                            details=" | ".join(opportunity["signals"]),
                            status="active"
                        )
                        db.add(new_op)
                        db.flush() # get ID
                        
                        # Generate alert
                        admin_users = [1] # Assuming user 1 is admin/buyer
                        for uid in admin_users:
                            alert = Notification(
                                user_id=uid,
                                message=f"MARKET OPPORTUNITY: {product_name} at vendor {current_data.vendor_id}. Score: {opportunity['score']} - {opportunity['recommended_action']}"
                            )
                            db.add(alert)
                            
                        ops_created += 1
                        
        db.commit()
        return {"status": "success", "opportunities_found": ops_created}
        
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
