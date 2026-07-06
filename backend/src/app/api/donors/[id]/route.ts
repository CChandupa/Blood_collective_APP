import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const donorId = parseInt(id);

    const { data: donor, error } = await supabaseAdmin
      .from('donor')
      .select(`
        donor_id, full_name, gender, dob, mobile_no, availability_status,
        blood_type_id, last_donation_date, location_id, email, nic,
        blood_type:blood_type_id(blood_type_id, blood_group),
        location:location_id(location_id, city, postal_code, district)
      `)
      .eq('donor_id', donorId)
      .maybeSingle();

    if (error || !donor) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Donor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: donor,
    });
  } catch (err) {
    console.error('Get donor error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
