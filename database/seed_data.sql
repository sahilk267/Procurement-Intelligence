-- Seed Data for Procurement Intelligence Platform

-- User roles
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@procure.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGW6zH.', 'admin'),
('Operator User', 'operator@procure.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGW6zH.', 'operator');
-- (Passwords are 'password')

-- Predefined Vendor Discovery Categories + AI Seeding
INSERT INTO vendors (name, city, area, category, brands, verification_status, fraud_score, discovery_source, years_in_business, google_rating) VALUES
('Network Alpha', 'Mumbai', 'Lamington Road', 'Networking', '{"Cisco", "Juniper"}', True, 0.0, 'IndiaMART', 15, 4.8),
('Server Pros', 'Mumbai', 'Andheri', 'Servers', '{"Dell", "HP"}', True, 2.5, 'Google Map', 8, 4.2),
('Global Tech Supplies', 'Delhi', 'Nehru Place', 'Laptops', '{"Lenovo", "Dell", "HP"}', False, 45.0, 'LinkedIn', 3, 3.5),
('SysNet Solutions', 'Mumbai', 'Lamington Road', 'Storage', '{"Western Digital", "Seagate"}', True, 0.0, 'Website Search', 22, 4.9);
