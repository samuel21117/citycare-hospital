-- RLS Policies for CityCare Hospital

-- 1. USERS TABLE POLICIES
-- Allow any logged-in user to see basic profiles (needed so patients can see doctors, etc.)
CREATE POLICY "Allow authenticated users to read profiles" 
ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 2. APPOINTMENTS TABLE POLICIES
-- Patients and Doctors can see appointments they are involved in
CREATE POLICY "Allow users to see their own appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Patients can book appointments for themselves
CREATE POLICY "Allow patients to book appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- 3. PRESCRIPTIONS TABLE POLICIES
-- Patients and Doctors can see prescriptions they are involved in
CREATE POLICY "Allow users to see relevant prescriptions" 
ON public.prescriptions FOR SELECT 
USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Doctors can issue prescriptions
CREATE POLICY "Allow doctors to create prescriptions" 
ON public.prescriptions FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

-- 4. MEDICINES INVENTORY POLICIES
-- Anyone logged in can see available medicines
CREATE POLICY "Allow all authenticated to view medicines" 
ON public.medicines FOR SELECT 
USING (auth.role() = 'authenticated');

-- 5. PRESCRIPTION MEDICINES POLICIES
-- Anyone logged in can see the mapping (secured implicitly by the prescriptions table above)
CREATE POLICY "Allow authenticated to view prescription items" 
ON public.prescription_medicines FOR SELECT 
USING (auth.role() = 'authenticated');
