import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

// Fetch matching donors for a blood request (without modifying state)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id);

    // Get the request details
    const { data: bloodRequest, error: reqError } = await supabaseAdmin
      .from('patient_request')
      .select('*, blood_type:blood_type_id(blood_group)')
      .eq('request_id', requestId)
      .maybeSingle();

    if (reqError || !bloodRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Blood request not found' },
        { status: 404 }
      );
    }

    // Find matching available donors (who are NOT blocked)
    const { data: matchingDonors, error: donorError } = await supabaseAdmin
      .from('donor')
      .select(`
        donor_id, full_name, mobile_no, email, availability_status, is_blocked,
        blood_type:blood_type_id(blood_group),
        location:location_id(city, district)
      `)
      .eq('blood_type_id', bloodRequest.blood_type_id)
      .eq('availability_status', true)
      .or('is_blocked.is.null,is_blocked.eq.false');

    if (donorError) {
      console.error(donorError);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to find matching donors' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        matched_count: matchingDonors?.length || 0,
        donors: matchingDonors,
      },
      message: `Found ${matchingDonors?.length || 0} matching donors`,
    });
  } catch (err) {
    console.error('Match GET error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
