import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractToken, verifyToken } from '@/lib/auth';
import { ApiResponse, DonorWithDetails } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blood_type_id = searchParams.get('blood_type_id');
    const district = searchParams.get('district');
    const available_only = searchParams.get('available_only');

    let query = supabaseAdmin
      .from('donor')
      .select(`
        donor_id, full_name, gender, dob, mobile_no, availability_status,
        blood_type_id, last_donation_date, location_id, email,
        blood_type:blood_type_id(blood_type_id, blood_group),
        location:location_id(location_id, city, postal_code, district)
      `)
      .order('donor_id', { ascending: false });

    if (blood_type_id) {
      query = query.eq('blood_type_id', parseInt(blood_type_id));
    }

    if (available_only === 'true') {
      query = query.eq('availability_status', true);
    }

    const { data: donors, error } = await query;

    if (error) {
      console.error('Fetch donors error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch donors' },
        { status: 500 }
      );
    }

    // Filter by district if specified (requires join filtering)
    let filteredDonors = donors || [];
    if (district) {
      filteredDonors = filteredDonors.filter(
        (d: DonorWithDetails) => d.location && (d.location as unknown as { district: string }).district?.toLowerCase() === district.toLowerCase()
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: filteredDonors,
    });
  } catch (err) {
    console.error('Donors GET error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'donor') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const allowedFields = ['full_name', 'gender', 'dob', 'mobile_no', 'availability_status', 'blood_type_id', 'location_id'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('donor')
      .update(updates)
      .eq('donor_id', payload.id)
      .select('donor_id, full_name, nic, gender, dob, mobile_no, email, availability_status, blood_type_id, location_id, last_donation_date')
      .single();

    if (error) {
      console.error('Update donor error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update donor' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    console.error('Donors PUT error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
