import os
from celery import Celery

# Setup redis URL
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "procurement_workers",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "workers.vendor_discovery",
        "workers.price_monitor",
        "workers.lead_scraper",
        "workers.rfq_broadcaster",
        "workers.rfq_followup"
    ]
)

# Optional configuration, see Celery docs
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

from celery.schedules import crontab

# Schedule periodic tasks (Celery Beat)
celery_app.conf.beat_schedule = {
    'discover-vendors-every-hour': {
        'task': 'workers.vendor_discovery.discover_vendors_task',
        'schedule': crontab(minute=0, hour='*/1'),
    },
    'monitor-prices-every-2-hours': {
        'task': 'workers.price_monitor.monitor_prices_task',
        'schedule': crontab(minute=0, hour='*/2'),
    },
    'scrape-leads-every-day': {
        'task': 'workers.lead_scraper.scrape_leads_task',
        'schedule': crontab(minute=0, hour=2),  # 2 AM daily
    },
    'check-stale-rfqs-hourly': {
        'task': 'workers.rfq_followup.check_stale_rfqs_task',
        'schedule': crontab(minute=30, hour='*'), # Every hour on the half hour
    }
}
