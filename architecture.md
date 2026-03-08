# Procurement Intelligence Platform

## System Architecture

## 1. Overview

The Procurement Intelligence Platform is designed to automate vendor discovery, procurement workflows, RFQ broadcasting, vendor risk analysis, market intelligence, and lead generation.

The system integrates:

Vendor Intelligence
Procurement Automation
Market Intelligence
Lead Generation
Business Intelligence Analytics
AI Advisory

Primary starting region: Mumbai (Lamington Road electronics market).



## 2. Architecture Layers

The platform follows a layered architecture.

Frontend Layer
API Gateway Layer
Core Microservices Layer
Schemas / DTO Layer (Validation)
Configuration & Environment Layer
Automation & Worker Layer
AI Intelligence Layer
Data Layer
Infrastructure Layer



## 3. Frontend Layer

Technology:

Next.js
React
TailwindCSS
React Query

Responsibilities:

User dashboard
Vendor management UI
Order creation UI
Quote comparison screens
Analytics dashboards
Automation monitoring

Main UI modules:

Dashboard
Vendors
Orders
Quotes
Leads
Market Intelligence
Automation
Analytics
Reports
Settings



## 4. API Gateway Layer

Purpose:

Central entry point for all API requests.

Responsibilities:

Authentication validation
Request routing
Rate limiting
Logging
Load balancing

Suggested technologies:

Nginx
Kong API Gateway



## 5. Core Microservices

### Authentication Service

Handles:

User login
User registration
Role-based access control
JWT token management

Roles supported:

Admin
Manager
Operator
Viewer



### Vendor Service

Responsible for:

Vendor database
Vendor categories
Vendor brands
Vendor verification
Vendor ratings
Vendor fraud scores

Vendor attributes include:

Location
Brands
Product condition (new/used/both)
Verification status



### Order Service

Handles procurement workflows.

Responsibilities:

Order creation
Order lifecycle tracking
Vendor filtering
RFQ triggering

Order statuses:

Open
RFQ Sent
Quotes Received
Deal Closed
Cancelled



### Quote Service

Handles vendor quotes.

Capabilities:

Vendor quote submission
Quote comparison
Best deal identification
Vendor ranking



### Schemas Layer (Validation)

Acts as the absolute payload validator isolating Routes from Models.

Responsibilities:

Pydantic V2 Request Validation
DTO Response Serialization
Regex field sanitization (Phone, URL, Email)
Enum bounded constraints



### Lead Service

Manages buyer leads.

Features:

Lead capture
Lead CRM pipeline
Lead status management

Lead lifecycle:

New
Contacted
Qualified
Converted
Lost



### Notification Service

Handles platform communication.

Channels:

Email
System notifications
Future integrations (SMS, WhatsApp)



## 6. Automation Workers

Automation tasks run in background workers.

Workers include:

Vendor discovery worker
Price monitoring worker
Lead scraping worker
RFQ follow-up worker
Social media automation worker
Analytics reporting worker

Technology stack:

Python
Celery
Redis queues



## 7. AI Intelligence Layer

AI engines provide insights and automation.

### Fraud Detection Engine

Evaluates vendors based on signals:

GST verification
Website presence
Domain email validation
Price anomaly detection
Vendor history

Risk scoring:

0-20 trusted
20-40 moderate risk
40+ high risk



### Opportunity Detection Engine

Detects market opportunities such as:

Bulk liquidation
Price drops
Demand spikes



### Vendor Ranking Engine

Ranks vendors using:

Reliability
Response time
Deal success rate
Fraud score



### AI Advisor

Generates insights:

Deal success trends
Vendor reliability
Lost deal analysis
Strategic recommendations



## 8. Data Layer

Primary database:

PostgreSQL

Search engine:

Elasticsearch

Cache and queue:

Redis

Data stored includes:

Vendors
Orders
Quotes
Leads
Fraud signals
Price history
Analytics data

Optimizations:

- **Database Indexing**: High-traffic columns (Vendor name, Category, Order status, Signal type) are indexed for sub-millisecond lookups.
- **Bulk Aggregations**: Analytics routes utilize `GROUP BY` and `JOIN` aggregations to eliminate N+1 query bottlenecks.



## 9. Infrastructure Layer

Containerization:

Docker

Orchestration:

Kubernetes

Monitoring:

Prometheus
Grafana

Logging:

Centralized log aggregation



## 10. Security Architecture

Security measures:

JWT authentication
Role-based access control
API rate limiting
Audit logging
Audit logging
Encrypted credentials
**Environment Isolation**: Sensitive keys are removed from source code and managed via `.env` files.
**Database Exception Shielding**: Global error handlers prevent schema leaks during failures.

Vendor fraud monitoring is integrated into the procurement workflow.



## 11. System Workflow

Vendor discovery
Vendor verification
Order creation
RFQ broadcast
Quote collection
Deal selection
Analytics updates
AI insights generation



## 12. Scalability

The microservices architecture allows scaling:

Vendor services
Automation workers
AI engines
API gateway

Geographic expansion:

Mumbai
Delhi
Bangalore
Dubai
Singapore


