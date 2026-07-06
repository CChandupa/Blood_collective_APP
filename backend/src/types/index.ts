// ===== Database Models =====

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

export interface Admin {
  admin_id: number;
  user_name: string;
  email: string;
  password: string;
}

export interface Donor {
  donor_id: number;
  full_name: string;
  nic: string;
  gender: string | null;
  dob: string | null;
  mobile_no: string | null;
  availability_status: boolean;
  password: string;
  blood_type_id: number | null;
  last_donation_date: string | null;
  location_id: number | null;
  email: string;
}

export interface DonorWithDetails extends Omit<Donor, 'password'> {
  blood_type?: BloodType;
  location?: Location;
}

export interface Notification {
  notification_id: number;
  sent_date: string;
  read_status: boolean;
  message: string;
  donor_id: number | null;
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
}

export interface PatientRequestWithDetails extends PatientRequest {
  blood_type?: BloodType;
  hospital?: Hospital;
}

export interface DonationSchedule {
  schedule_id: number;
  donation_status: string | null;
  donation_date: string | null;
  donor_id: number | null;
  request_id: number | null;
}

export interface DonationScheduleWithDetails extends DonationSchedule {
  donor?: DonorWithDetails;
  patient_request?: PatientRequestWithDetails;
}

// ===== API Request/Response Types =====

export interface RegisterDonorRequest {
  full_name: string;
  nic: string;
  gender?: string;
  dob?: string;
  mobile_no?: string;
  email: string;
  password: string;
  blood_type_id: number;
  location_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: 'donor' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: Omit<Donor, 'password'> | Omit<Admin, 'password'>;
  role: 'donor' | 'admin';
}

export interface CreateRequestPayload {
  blood_type_id: number;
  patient_name: string;
  hospital_id: number;
  urgency_level: string;
  quantity_needed: number;
}

export interface SearchDonorsQuery {
  blood_type_id?: number;
  district?: string;
  available_only?: boolean;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: 'donor' | 'admin';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
