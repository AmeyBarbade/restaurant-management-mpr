-- Create the 'tables' table
CREATE TABLE public.tables (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  currentOrder TEXT
);

-- Insert initial dummy tables
INSERT INTO public.tables (id, status, capacity, currentOrder)
VALUES 
  ('T-01', 'free', 2, NULL),
  ('T-02', 'free', 4, NULL),
  ('T-03', 'free', 4, NULL),
  ('T-04', 'free', 6, NULL),
  ('T-05', 'free', 2, NULL),
  ('T-06', 'free', 4, NULL),
  ('T-07', 'free', 8, NULL),
  ('T-08', 'free', 2, NULL);

-- Create the 'orders' table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  tableId TEXT NOT NULL REFERENCES public.tables(id),
  status TEXT NOT NULL,
  buffer_ends_at BIGINT,
  cooking_ends_at BIGINT,
  time TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the 'messages' table for the new feature
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Realtime for tables, orders, and messages
alter publication supabase_realtime add table public.tables;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.messages;
