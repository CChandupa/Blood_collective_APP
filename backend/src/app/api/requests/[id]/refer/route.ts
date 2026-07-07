import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id);
    const body = await request.json();
    const { donor_id } = body;

    if (!donor_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Donor ID is required' },
        { status: 400 }
      );
    }

    // Get request details for the notification
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

    const bloodGroup = (bloodRequest.blood_type as any)?.blood_group || 'Unknown';
    
    // Send Notification to the specific donor
    await supabaseAdmin.from('notification').insert({
      donor_id,
      message: `Urgent: You have been selected to help! A patient needs ${bloodGroup} blood for Request #${requestId}. Please check your dashboard for details.`,
      read_status: false,
    });

    // Update request status to Matched
    const { error: updateError } = await supabaseAdmin
      .from('patient_request')
      .update({ status: 'Matched' })
      .eq('request_id', requestId);

    if (updateError) {
      console.error('Failed to update request status:', updateError);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Successfully referred patient to donor',
    });
  } catch (err) {
    console.error('Refer POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
