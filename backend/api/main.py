from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, vendors, orders, quotes, leads, analytics, notifications, discovery, ai_brain
from backend.config import settings
from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging

app = FastAPI(title="Procurement Intelligence Platform", version="1.0.0")

# Global Database Error Handler
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logging.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Internal security prevented schema exposure."},
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(vendors, prefix="/api/v1/vendors", tags=["Vendors"])
app.include_router(orders, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(quotes, prefix="/api/v1/quotes", tags=["Quotes"])
app.include_router(leads, prefix="/api/v1/leads", tags=["Leads"])
app.include_router(analytics, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(notifications, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(discovery.router, prefix="/api/v1/discovery", tags=["Discovery"])
app.include_router(ai_brain.router, prefix="/api/v1/ai", tags=["AI Brain"])

@app.get("/")
async def root():
    return {"message": "Procurement Intelligence Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)