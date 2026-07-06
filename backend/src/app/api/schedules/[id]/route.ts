import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractToken, verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const scheduleId = parseInt(id);
    const body = await request.json();
    const { donation_status } = body;

    if (!donation_status) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'donation_status is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('donation_schedule')
      .update({ donation_status })
      .eq('schedule_id', scheduleId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update schedule' },
        { status: 500 }
      );
    }

    // If completed, update donor's last donation date
    if (donation_status === 'Completed' && data.donor_id) {
      await supabaseAdmin
        .from('donor')
        .update({ last_donation_date: data.donation_date })
        .eq('donor_id', data.donor_id);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Schedule updated successfully',
    });
  } catch (err) {
    console.error('Update schedule error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
