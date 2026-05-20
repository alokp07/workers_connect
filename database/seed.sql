-- WorkersConnect Seed Data
-- Run after schema.sql

-- Admin user (password: admin123 - bcrypt hash)
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@gmail.com', '$2b$10$/e/WPVfPr7TUjDYvWoW2We/HdvR1DMsEQnvKeXlgzIvYOIGNDlGKS', 'Platform Admin', '9999999999', 'admin');

-- Service Categories
INSERT INTO service_categories (name, slug, icon) VALUES
('Plumbing', 'plumbing', '🔧'),
('Electrical', 'electrical', '⚡'),
('Carpentry', 'carpentry', '🪚'),
('Painting', 'painting', '🎨'),
('Cleaning', 'cleaning', '🧹'),
('Gardening', 'gardening', '🌱'),
('AC Repair', 'ac-repair', '❄️'),
('Appliance Repair', 'appliance-repair', '🔌'),
('Pest Control', 'pest-control', '🐛'),
('Moving & Packing', 'moving-packing', '📦');

-- Log the seeding
INSERT INTO activity_logs (action_type, description, metadata) VALUES
('system_seed', 'Database seeded with admin user and service categories', '{"categories_count": 10}');
