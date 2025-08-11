-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customer Groups table
CREATE TABLE customer_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duffel_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Users table
CREATE TABLE customer_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duffel_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  given_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  phone_number TEXT,
  group_id UUID REFERENCES customer_groups(id),
  auth_user_id UUID, -- Links to Supabase auth.users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flight Orders table
CREATE TABLE flight_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duffel_order_id TEXT UNIQUE NOT NULL,
  booking_reference TEXT UNIQUE,
  user_id UUID REFERENCES customer_users(id),
  auth_user_id UUID, -- Links to Supabase auth.users
  total_amount DECIMAL(10,2) NOT NULL,
  total_currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  live_mode BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  passenger_data JSONB DEFAULT '{}',
  offer_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Programs table
CREATE TABLE loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES customer_users(id),
  auth_user_id UUID, -- Links to Supabase auth.users
  airline_iata_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, airline_iata_code)
);

-- Search History table (for analytics and caching)
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID,
  search_params JSONB NOT NULL,
  results_count INTEGER,
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Services table (for ancillary services)
CREATE TABLE order_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES flight_orders(id),
  duffel_service_id TEXT,
  service_type TEXT NOT NULL, -- 'seat', 'baggage', 'meal', etc.
  passenger_id TEXT,
  total_amount DECIMAL(10,2),
  total_currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customer_users_email ON customer_users(email);
CREATE INDEX idx_customer_users_auth_user_id ON customer_users(auth_user_id);
CREATE INDEX idx_flight_orders_user_id ON flight_orders(user_id);
CREATE INDEX idx_flight_orders_auth_user_id ON flight_orders(auth_user_id);
CREATE INDEX idx_flight_orders_booking_reference ON flight_orders(booking_reference);
CREATE INDEX idx_loyalty_accounts_user_id ON loyalty_accounts(user_id);
CREATE INDEX idx_loyalty_accounts_auth_user_id ON loyalty_accounts(auth_user_id);
CREATE INDEX idx_search_history_auth_user_id ON search_history(auth_user_id);
CREATE INDEX idx_order_services_order_id ON order_services(order_id);

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_customer_groups_updated_at BEFORE UPDATE ON customer_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_users_updated_at BEFORE UPDATE ON customer_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flight_orders_updated_at BEFORE UPDATE ON flight_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_accounts_updated_at BEFORE UPDATE ON loyalty_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_services ENABLE ROW LEVEL SECURITY;

-- Policies for customer_users
CREATE POLICY "Users can view their own customer profile" ON customer_users
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own customer profile" ON customer_users
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Policies for flight_orders
CREATE POLICY "Users can view their own orders" ON flight_orders
  FOR SELECT USING (auth_user_id = auth.uid());

-- Policies for loyalty_accounts
CREATE POLICY "Users can manage their own loyalty accounts" ON loyalty_accounts
  FOR ALL USING (auth_user_id = auth.uid());

-- Policies for search_history
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Policies for order_services
CREATE POLICY "Users can view services for their own orders" ON order_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flight_orders 
      WHERE flight_orders.id = order_services.order_id 
      AND flight_orders.auth_user_id = auth.uid()
    )
  ); 