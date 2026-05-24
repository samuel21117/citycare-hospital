-- Supabase Schema for Hospital Appointment and E-Prescription System

-- Users table extending the default auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacy', 'admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Medicines inventory
CREATE TABLE public.medicines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  stock_level INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 10,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.users(id) NOT NULL,
  doctor_id UUID REFERENCES public.users(id) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('online', 'in-person')),
  symptoms TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
  doctor_id UUID REFERENCES public.users(id) NOT NULL,
  patient_id UUID REFERENCES public.users(id) NOT NULL,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prescription Medicines mapping table
CREATE TABLE public.prescription_medicines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prescription_id UUID REFERENCES public.prescriptions(id) NOT NULL,
  medicine_id UUID REFERENCES public.medicines(id) NOT NULL,
  dosage TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;

-- Note: In a production environment, you should add specific RLS policies 
-- to restrict access based on the user's role (e.g., patients can only see their own appointments).
-- For development purposes and ease of setup from the backend, you can temporarily disable RLS or create permissive policies.

-- Create a function to automatically create a user profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'patient'), coalesce(new.raw_user_meta_data->>'name', 'Unknown'), new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
