-- Procurement Intelligence Platform Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    area VARCHAR(100),
    category VARCHAR(100),
    brands TEXT[], -- Array of brands
    product_condition VARCHAR(50), -- new, used, both
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    gst_number VARCHAR(50),
    verification_status BOOLEAN DEFAULT FALSE,
    fraud_score DECIMAL(5,2) DEFAULT 0.0,
    discovery_source VARCHAR(100) DEFAULT 'manual',
    years_in_business INTEGER,
    employee_count INTEGER,
    google_rating FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    quantity INTEGER NOT NULL,
    target_price DECIMAL(10,2),
    condition VARCHAR(50),
    location VARCHAR(255),
    deadline DATE,
    status VARCHAR(50) DEFAULT 'open',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    order_id INTEGER REFERENCES orders(id),
    quoted_price DECIMAL(10,2) NOT NULL,
    quantity_available INTEGER,
    delivery_time INTEGER, -- days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    interest_category VARCHAR(100),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history table
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    brand VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(10,2),
    vendor_id INTEGER REFERENCES vendors(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities table (Market Opportunity Detection)
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    estimated_margin DECIMAL(10,2),
    inventory_size INTEGER,
    source VARCHAR(100),
    location VARCHAR(255),
    score FLOAT DEFAULT 0.0,
    signal_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'detected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Vendor Scores table
CREATE TABLE ai_vendor_scores (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    reliability_score FLOAT DEFAULT 0.0,
    response_score FLOAT DEFAULT 0.0,
    delivery_score FLOAT DEFAULT 0.0,
    composite_score FLOAT DEFAULT 0.0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Deal Predictions table
CREATE TABLE ai_deal_predictions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    vendor_id INTEGER REFERENCES vendors(id),
    success_probability FLOAT DEFAULT 0.0,
    predicted_margin DECIMAL(10,2),
    recommendation TEXT,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Price Predictions table
CREATE TABLE ai_price_predictions (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(100),
    current_price DECIMAL(10,2),
    predicted_price DECIMAL(10,2),
    prediction_date DATE,
    confidence FLOAT DEFAULT 0.0,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Alerts table
CREATE TABLE ai_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    related_vendor_id INTEGER REFERENCES vendors(id),
    related_order_id INTEGER REFERENCES orders(id),
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_verification ON vendors(verification_status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_quotes_order_id ON quotes(order_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_ai_vendor_scores_vendor ON ai_vendor_scores(vendor_id);
CREATE INDEX idx_ai_alerts_type ON ai_alerts(alert_type);
CREATE INDEX idx_ai_alerts_dismissed ON ai_alerts(is_dismissed);