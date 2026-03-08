from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, vendors, orders, quotes, leads, analytics, notifications, discovery, ai_brain

app = FastAPI(title="Procurement Intelligence Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
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