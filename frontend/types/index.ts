export interface BloodType {
  blood_type_id: number;
  blood_group: string;
}

export interface Location {
  location_id: number;
  city: string;
  postal_code: string;
  district: string;
}

export interface Hospital {
  hospital_id: number;
  hospital_name: string;
  contact_no: string | null;
  address: string | null;
}

export interface Donor {
  donor_id: number;
  full_name: string;
  nic: string;
  gender: string | null;
  dob: string | null;
  mobile_no: string | null;
  availability_status: boolean;
  blood_type_id: number | null;
  last_donation_date: string | null;
  location_id: number | null;
  email: string;
  blood_type?: { blood_type_id: number; blood_group: string };
  location?: { location_id: number; city: string; postal_code: string; district: string };
}

export interface User {
  id: number;
  email: string;
  name?: string; // mapped from full_name or user_name
  role: 'donor' | 'admin';
}

export interface PatientRequest {
  request_id: number;
  blood_type_id: number | null;
  patient_name: string;
  hospital_id: number | null;
  urgency_level: string | null;
  quantity_needed: number | null;
  request_date: string;
  status: string;
  blood_type?: { blood_type_id: number; blood_group: string };
  hospital?: { hospital_id: number; hospital_name: string; contact_no: string; address: string };
}

export interface Notification {
  notification_id: number;
  sent_date: string;
  read_status: boolean;
  message: string;
  donor_id: number | null;
}

export interface DonationSchedule {
  schedule_id: number;
  donation_status: string | null;
  donation_date: string | null;
  donor_id: number | null;
  request_id: number | null;
  donor?: { donor_id: number; full_name: string; email: string; mobile_no: string; blood_type: { blood_group: string } };
  patient_request?: { request_id: number; patient_name: string; urgency_level: string; quantity_needed: number; status: string; blood_type: { blood_group: string }; hospital: { hospital_name: string } };
}
