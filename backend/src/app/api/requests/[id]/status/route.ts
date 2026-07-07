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
    const { status } = body;

    if (!['Pending', 'Rejected', 'Matched', 'Completed'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('patient_request')
      .update({ status })
      .eq('request_id', requestId);

    if (error) {
      console.error('Update request status error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update request status' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Request status updated to ${status}`,
    });
  } catch (err) {
    console.error('Status POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
