import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

// Match donors for a blood request — finds available donors with matching blood type
export async function POST(
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

    // Find matching available donors
    const { data: matchingDonors, error: donorError } = await supabaseAdmin
      .from('donor')
      .select(`
        donor_id, full_name, mobile_no, email, availability_status,
        blood_type:blood_type_id(blood_group),
        location:location_id(city, district)
      `)
      .eq('blood_type_id', bloodRequest.blood_type_id)
      .eq('availability_status', true);

    if (donorError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to find matching donors' },
        { status: 500 }
      );
    }

    // Send notifications to matched donors
    if (matchingDonors && matchingDonors.length > 0) {
      const bloodGroup = (bloodRequest.blood_type as { blood_group: string })?.blood_group || 'Unknown';
      const notifications = matchingDonors.map((donor) => ({
        donor_id: donor.donor_id,
        message: `Urgent: A patient needs ${bloodGroup} blood! Request #${requestId}. Please check your dashboard for details.`,
        read_status: false,
      }));

      await supabaseAdmin.from('notification').insert(notifications);

      // Update request status to Matched
      await supabaseAdmin
        .from('patient_request')
        .update({ status: 'Matched' })
        .eq('request_id', requestId);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        matched_count: matchingDonors?.length || 0,
        donors: matchingDonors,
      },
      message: `Found ${matchingDonors?.length || 0} matching donors and sent notifications`,
    });
  } catch (err) {
    console.error('Match donors error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
