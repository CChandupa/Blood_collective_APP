import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractToken, verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    const payload = token ? verifyToken(token) : null;

    let query = supabaseAdmin
      .from('donation_schedule')
      .select(`
        *,
        donor:donor_id(donor_id, full_name, email, mobile_no,
          blood_type:blood_type_id(blood_group)
        ),
        patient_request:request_id(
          request_id, patient_name, urgency_level, quantity_needed, status,
          blood_type:blood_type_id(blood_group),
          hospital:hospital_id(hospital_name)
        )
      `)
      .order('donation_date', { ascending: false });

    // If donor, show only their schedules
    if (payload && payload.role === 'donor') {
      query = query.eq('donor_id', payload.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch schedules error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch schedules' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Schedules GET error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donor_id, request_id, donation_date } = body;

    if (!donor_id || !request_id || !donation_date) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'donor_id, request_id, and donation_date are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('donation_schedule')
      .insert({
        donor_id,
        request_id,
        donation_date,
        donation_status: 'Scheduled',
      })
      .select()
      .single();

    if (error) {
      console.error('Create schedule error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create schedule' },
        { status: 500 }
      );
    }

    // Send notification to donor
    await supabaseAdmin.from('notification').insert({
      donor_id,
      message: `You have been scheduled for blood donation on ${donation_date}. Thank you for saving a life!`,
      read_status: false,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Donation scheduled successfully',
    }, { status: 201 });
  } catch (err) {
    console.error('Schedules POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
