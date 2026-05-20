-- 30 Pre-approved Workers (password: worker123 for all)
-- Run in Supabase SQL Editor after schema.sql and seed.sql

DO $$
DECLARE
  pw TEXT := '$2b$10$v/0l1zOje0UW0uET7gd.oeYbymAyXHnJx2zXSKXtsoZtHtboAqEu.';
  cat_plumbing UUID := 'a9414c31-406c-4d6e-9954-fd9f0e25dc29';
  cat_electrical UUID := '6d949528-d0c0-4c02-b327-1439f5d2c7d5';
  cat_carpentry UUID := '1070fe91-f510-4d25-a5c2-20883b65afc9';
  cat_painting UUID := '72297034-931a-45fa-a260-eb414fb1587c';
  cat_cleaning UUID := 'eec4154e-57fa-4493-8c15-cd6573774a23';
  cat_gardening UUID := '9651167e-f909-4d5b-a521-39ee214db5b0';
  cat_ac UUID := 'd5b7e964-d6ef-4ea9-8d64-672267696075';
  cat_appliance UUID := '2261fbbd-ad82-49f7-b757-dee3eb80823d';
  cat_pest UUID := '8af6c233-89c1-465c-97ab-e66ba4924c27';
  cat_moving UUID := '84033b0f-5d1a-44c1-ab99-750b0cd8cc46';
  uid UUID;
BEGIN

  -- Worker 1: Plumbing
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('rajesh.kumar@gmail.com', pw, 'Rajesh Kumar', '9876543201', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_plumbing, 'Expert plumber with 10 years of experience in residential and commercial plumbing.', ARRAY['Pipe Fitting', 'Leak Repair', 'Drain Cleaning', 'Water Heater'], 10, 'Mumbai, Maharashtra', true, 4.80, 25);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 2: Plumbing
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('suresh.patel@gmail.com', pw, 'Suresh Patel', '9876543202', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_plumbing, 'Certified plumber specializing in bathroom and kitchen installations.', ARRAY['Bathroom Fitting', 'Kitchen Plumbing', 'Valve Repair'], 7, 'Delhi, Delhi', true, 4.50, 18);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 3: Plumbing
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('mohan.singh@gmail.com', pw, 'Mohan Singh', '9876543203', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_plumbing, 'Affordable plumbing solutions for all your home needs.', ARRAY['Emergency Repair', 'Pipe Installation', 'Sewage'], 5, 'Pune, Maharashtra', true, 4.20, 12);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 4: Electrical
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('amit.sharma@gmail.com', pw, 'Amit Sharma', '9876543204', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_electrical, 'Licensed electrician with expertise in home wiring and industrial setups.', ARRAY['Home Wiring', 'Switchboard', 'MCB Installation', 'Fan Repair'], 12, 'Bangalore, Karnataka', true, 4.90, 30);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 5: Electrical
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('vikram.reddy@gmail.com', pw, 'Vikram Reddy', '9876543205', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_electrical, 'Specialist in smart home electrical systems and automation.', ARRAY['Smart Home', 'LED Installation', 'Inverter Setup'], 8, 'Hyderabad, Telangana', true, 4.70, 22);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 6: Electrical
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('dinesh.gupta@gmail.com', pw, 'Dinesh Gupta', '9876543206', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_electrical, 'Quick and reliable electrical repair services at your doorstep.', ARRAY['Wiring Repair', 'Short Circuit Fix', 'Earthing'], 6, 'Chennai, Tamil Nadu', true, 4.30, 15);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 7: Carpentry
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('ramesh.verma@gmail.com', pw, 'Ramesh Verma', '9876543207', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_carpentry, 'Master carpenter creating custom furniture and woodwork for over 15 years.', ARRAY['Custom Furniture', 'Wood Carving', 'Cabinet Making', 'Door Fitting'], 15, 'Jaipur, Rajasthan', true, 4.95, 35);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 8: Carpentry
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('prakash.joshi@gmail.com', pw, 'Prakash Joshi', '9876543208', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_carpentry, 'Specializing in modular kitchen and wardrobe installations.', ARRAY['Modular Kitchen', 'Wardrobe', 'Shelving', 'Bed Frame'], 9, 'Ahmedabad, Gujarat', true, 4.60, 20);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 9: Carpentry
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('gopal.nair@gmail.com', pw, 'Gopal Nair', '9876543209', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_carpentry, 'Experienced in wooden flooring and ceiling work.', ARRAY['Flooring', 'False Ceiling', 'Window Frame'], 11, 'Kochi, Kerala', true, 4.40, 16);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 10: Painting
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('sanjay.mishra@gmail.com', pw, 'Sanjay Mishra', '9876543210', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_painting, 'Professional painter offering interior and exterior painting with premium finishes.', ARRAY['Interior Painting', 'Exterior Painting', 'Texture Finish', 'Waterproofing'], 13, 'Mumbai, Maharashtra', true, 4.85, 28);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 11: Painting
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('arjun.das@gmail.com', pw, 'Arjun Das', '9876543211', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_painting, 'Creative wall art and mural painter for homes and offices.', ARRAY['Wall Art', 'Murals', 'Stencil Work', 'POP Finish'], 6, 'Kolkata, West Bengal', true, 4.55, 14);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 12: Painting
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('manoj.yadav@gmail.com', pw, 'Manoj Yadav', '9876543212', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_painting, 'Budget-friendly painting services with quality materials.', ARRAY['Whitewashing', 'Distemper', 'Enamel Paint'], 4, 'Lucknow, Uttar Pradesh', true, 4.10, 10);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 13: Cleaning
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('priya.menon@gmail.com', pw, 'Priya Menon', '9876543213', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_cleaning, 'Professional deep cleaning expert for homes, offices, and commercial spaces.', ARRAY['Deep Cleaning', 'Sofa Cleaning', 'Carpet Cleaning', 'Sanitization'], 8, 'Bangalore, Karnataka', true, 4.75, 24);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 14: Cleaning
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('anita.devi@gmail.com', pw, 'Anita Devi', '9876543214', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_cleaning, 'Reliable daily and weekly house cleaning services.', ARRAY['House Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'], 5, 'Delhi, Delhi', true, 4.35, 19);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 15: Cleaning
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('kavita.sharma@gmail.com', pw, 'Kavita Sharma', '9876543215', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_cleaning, 'Post-construction and move-in cleaning specialist.', ARRAY['Post-Construction Cleaning', 'Window Cleaning', 'Floor Polishing'], 6, 'Pune, Maharashtra', true, 4.50, 17);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 16: Gardening
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('ravi.tiwari@gmail.com', pw, 'Ravi Tiwari', '9876543216', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_gardening, 'Landscape designer and garden maintenance expert.', ARRAY['Landscaping', 'Lawn Care', 'Tree Trimming', 'Plant Installation'], 14, 'Chandigarh, Punjab', true, 4.88, 26);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 17: Gardening
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('sunita.bai@gmail.com', pw, 'Sunita Bai', '9876543217', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_gardening, 'Terrace and balcony garden specialist with organic farming experience.', ARRAY['Terrace Garden', 'Organic Farming', 'Composting', 'Drip Irrigation'], 7, 'Hyderabad, Telangana', true, 4.45, 13);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 18: Gardening
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('kiran.mali@gmail.com', pw, 'Kiran Mali', '9876543218', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_gardening, 'Garden maintenance and pest-free plant care services.', ARRAY['Garden Maintenance', 'Pruning', 'Pest-Free Care'], 4, 'Nagpur, Maharashtra', true, 4.15, 8);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 19: AC Repair
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('anil.kashyap@gmail.com', pw, 'Anil Kashyap', '9876543219', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_ac, 'Certified AC technician for all brands - split, window, and central AC.', ARRAY['AC Installation', 'AC Repair', 'Gas Refilling', 'Compressor Repair'], 11, 'Delhi, Delhi', true, 4.82, 27);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 20: AC Repair
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('venkat.rao@gmail.com', pw, 'Venkat Rao', '9876543220', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_ac, 'AC servicing and annual maintenance contracts at best rates.', ARRAY['AC Servicing', 'AMC', 'Duct Cleaning', 'Thermostat Repair'], 8, 'Chennai, Tamil Nadu', true, 4.55, 21);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 21: AC Repair
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('rohit.mehra@gmail.com', pw, 'Rohit Mehra', '9876543221', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_ac, 'Quick AC repair and installation with same-day service.', ARRAY['Split AC', 'Window AC', 'Installation', 'PCB Repair'], 5, 'Mumbai, Maharashtra', true, 4.25, 11);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 22: Appliance Repair
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('deepak.pandey@gmail.com', pw, 'Deepak Pandey', '9876543222', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_appliance, 'Multi-brand appliance repair expert - washing machines, fridges, microwaves.', ARRAY['Washing Machine', 'Refrigerator', 'Microwave', 'Dishwasher'], 10, 'Bangalore, Karnataka', true, 4.78, 23);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 23: Appliance Repair
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('sachin.dubey@gmail.com', pw, 'Sachin Dubey', '9876543223', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_appliance, 'Specializing in water purifier and geyser repair and installation.', ARRAY['Water Purifier', 'Geyser', 'Chimney Repair', 'Mixer Grinder'], 7, 'Pune, Maharashtra', true, 4.40, 16);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 24: Appliance Repair
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('naveen.pillai@gmail.com', pw, 'Naveen Pillai', '9876543224', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_appliance, 'Television and home entertainment system repair specialist.', ARRAY['TV Repair', 'Home Theatre', 'Set-Top Box', 'Speaker Repair'], 6, 'Kochi, Kerala', true, 4.30, 9);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 25: Pest Control
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('ashok.chauhan@gmail.com', pw, 'Ashok Chauhan', '9876543225', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_pest, 'Licensed pest control professional offering eco-friendly solutions.', ARRAY['Termite Control', 'Cockroach Control', 'Bed Bug Treatment', 'Rodent Control'], 12, 'Mumbai, Maharashtra', true, 4.85, 29);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 26: Pest Control
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('meena.kumari@gmail.com', pw, 'Meena Kumari', '9876543226', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_pest, 'Residential and commercial pest management with warranty.', ARRAY['Mosquito Control', 'Ant Treatment', 'Fumigation', 'Herbal Pest Control'], 9, 'Hyderabad, Telangana', true, 4.60, 20);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 27: Pest Control
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('tarun.saxena@gmail.com', pw, 'Tarun Saxena', '9876543227', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_pest, 'Pre and post-construction anti-termite treatment expert.', ARRAY['Anti-Termite', 'Wood Treatment', 'Soil Treatment'], 6, 'Jaipur, Rajasthan', true, 4.20, 11);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 28: Moving & Packing
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('bharat.thakur@gmail.com', pw, 'Bharat Thakur', '9876543228', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_moving, 'Full-service packers and movers with safe and timely delivery.', ARRAY['Home Shifting', 'Office Relocation', 'Packing', 'Loading/Unloading'], 10, 'Delhi, Delhi', true, 4.72, 24);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 29: Moving & Packing
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('ganesh.iyer@gmail.com', pw, 'Ganesh Iyer', '9876543229', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_moving, 'Local and interstate moving services with vehicle transport.', ARRAY['Interstate Moving', 'Vehicle Transport', 'Furniture Disassembly', 'Insurance'], 8, 'Chennai, Tamil Nadu', true, 4.50, 18);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

  -- Worker 30: Moving & Packing
  INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ('farhan.khan@gmail.com', pw, 'Farhan Khan', '9876543230', 'worker') RETURNING id INTO uid;
  INSERT INTO worker_profiles (user_id, category_id, bio, skills, years_experience, location, availability, avg_rating, total_reviews) VALUES (uid, cat_moving, 'Affordable mini truck and tempo services for small moves.', ARRAY['Mini Truck', 'Tempo Service', 'Single Item Moving', 'Storage'], 5, 'Bangalore, Karnataka', true, 4.35, 14);
  INSERT INTO worker_approval_requests (user_id, status) VALUES (uid, 'approved');

END $$;
