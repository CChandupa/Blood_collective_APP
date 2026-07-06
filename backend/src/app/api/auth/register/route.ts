import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/auth';
import { RegisterDonorRequest, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterDonorRequest = await request.json();
    const { full_name, nic, gender, dob, mobile_no, email, password, blood_type_id, location_id } = body;

    // Validate required fields
    if (!full_name || !nic || !email || !password || !blood_type_id || !location_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields: full_name, nic, email, password, blood_type_id, location_id' },
        { status: 400 }
      );
    }

    // Check if donor already exists
    const { data: existingDonor } = await supabaseAdmin
      .from('donor')
      .select('donor_id')
      .or(`email.eq.${email},nic.eq.${nic}`)
      .maybeSingle();

    if (existingDonor) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A donor with this email or NIC already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert donor
    const { data: donor, error } = await supabaseAdmin
      .from('donor')
      .insert({
        full_name,
        nic,
        gender: gender || null,
        dob: dob || null,
        mobile_no: mobile_no || null,
        email,
        password: hashedPassword,
        blood_type_id,
        location_id,
        availability_status: true,
      })
      .select('donor_id, full_name, nic, gender, dob, mobile_no, email, availability_status, blood_type_id, location_id, last_donation_date')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to register donor' },
        { status: 500 }
      );
    }

    // Generate JWT
    const token = generateToken({ id: donor.donor_id, email: donor.email, role: 'donor' });

    return NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: { token, user: donor, role: 'donor' },
        message: 'Donor registered successfully',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
