-- 1. Blood Type Table
CREATE TABLE IF NOT EXISTS public.blood_type (
    blood_type_id SERIAL PRIMARY KEY,
    blood_group VARCHAR(10) NOT NULL UNIQUE
);

-- 2. Location Table
CREATE TABLE IF NOT EXISTS public.location (
    location_id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    district VARCHAR(100) NOT NULL
);

-- 3. Hospital Table
CREATE TABLE IF NOT EXISTS public.hospital (
    hospital_id SERIAL PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    contact_no VARCHAR(50),
    address TEXT
);

-- 4. Admin Table
CREATE TABLE IF NOT EXISTS public.admin (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 5. Donor Table
CREATE TABLE IF NOT EXISTS public.donor (
    donor_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    nic VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(20),
    dob DATE,
    mobile_no VARCHAR(50),
    availability_status BOOLEAN DEFAULT true,
    blood_type_id INTEGER REFERENCES public.blood_type(blood_type_id) ON DELETE SET NULL,
    last_donation_date DATE,
    location_id INTEGER REFERENCES public.location(location_id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 6. Patient Request Table
CREATE TABLE IF NOT EXISTS public.patient_request (
    request_id SERIAL PRIMARY KEY,
    blood_type_id INTEGER REFERENCES public.blood_type(blood_type_id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    hospital_id INTEGER REFERENCES public.hospital(hospital_id) ON DELETE SET NULL,
    urgency_level VARCHAR(50) DEFAULT 'High',
    quantity_needed INTEGER DEFAULT 1,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'
);

-- 7. Notification Table
CREATE TABLE IF NOT EXISTS public.notification (
    notification_id SERIAL PRIMARY KEY,
    sent_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT false,
    message TEXT NOT NULL,
    donor_id INTEGER REFERENCES public.donor(donor_id) ON DELETE CASCADE
);

-- 8. Donation Schedule Table
CREATE TABLE IF NOT EXISTS public.donation_schedule (
    schedule_id SERIAL PRIMARY KEY,
    donation_status VARCHAR(50) DEFAULT 'Scheduled',
    donation_date TIMESTAMP WITH TIME ZONE,
    donor_id INTEGER REFERENCES public.donor(donor_id) ON DELETE CASCADE,
    request_id INTEGER REFERENCES public.patient_request(request_id) ON DELETE CASCADE
);

-- 9. Insert Default Blood Types
INSERT INTO public.blood_type (blood_group) VALUES 
('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')
ON CONFLICT (blood_group) DO NOTHING;

-- 10. Insert default admin account (password is 'admin123' hashed using standard bcrypt)
-- You can log in using admin@bloodcollective.com and admin123
INSERT INTO public.admin (email, password) VALUES 
('admin@bloodcollective.com', '$2b$10$wO4qQ5Vn0/y2V3.H4A.M/OWtA/8U3x0v6R3C.5HjR9m2P5zJ5q9G6')
ON CONFLICT (email) DO NOTHING;
