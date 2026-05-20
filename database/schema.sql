-- WorkersConnect Platform Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- ENUM TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('client', 'worker', 'admin');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'completed', 'declined', 'cancelled');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'client',
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- SERVICE CATEGORIES
-- ============================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(10) DEFAULT '🔧',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON service_categories(slug);

-- ============================================
-- WORKER PROFILES
-- ============================================
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  location VARCHAR(200),
  portfolio_urls TEXT[] DEFAULT '{}',
  availability BOOLEAN NOT NULL DEFAULT true,
  avg_rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worker_profiles_user ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_category ON worker_profiles(category_id);
CREATE INDEX idx_worker_profiles_location ON worker_profiles(location);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(avg_rating DESC);

-- ============================================
-- WORKER APPROVAL REQUESTS
-- ============================================
CREATE TABLE worker_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status approval_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_requests_user ON worker_approval_requests(user_id);
CREATE INDEX idx_approval_requests_status ON worker_approval_requests(status);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  location VARCHAR(300),
  preferred_date DATE,
  preferred_time TIME,
  status booking_status NOT NULL DEFAULT 'pending',
  decline_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  worker_reply TEXT,
  worker_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_worker ON reviews(worker_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);

-- ============================================
-- ACTIVITY LOGS
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_worker_profiles_updated_at
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_approval_requests_updated_at
  BEFORE UPDATE ON worker_approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update worker avg_rating on review insert/update/delete
CREATE OR REPLACE FUNCTION update_worker_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_worker_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_worker_id := OLD.worker_id;
  ELSE
    target_worker_id := NEW.worker_id;
  END IF;

  UPDATE worker_profiles
  SET avg_rating = COALESCE((
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE worker_id = target_worker_id
  ), 0),
  total_reviews = (
    SELECT COUNT(*)
    FROM reviews
    WHERE worker_id = target_worker_id
  )
  WHERE user_id = target_worker_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_worker_avg_rating();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by backend)
-- These policies are a safety net / documentation

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view active categories" ON service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Workers can view own profile" ON worker_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clients can view approved worker profiles" ON worker_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM worker_approval_requests
      WHERE user_id = worker_profiles.user_id AND status = 'approved'
    )
  );

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = worker_id);

CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = worker_id);

CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
