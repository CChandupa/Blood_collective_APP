import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, donor_id } = body;

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    let insertData: any = [];

    if (donor_id) {
      // Send to specific donor
      insertData = [{ donor_id, message, read_status: false }];
    } else {
      // Send to ALL donors
      const { data: donors, error: fetchError } = await supabaseAdmin
        .from('donor')
        .select('donor_id');

      if (fetchError || !donors) {
        throw new Error('Failed to fetch donors for broadcast');
      }

      insertData = donors.map(d => ({
        donor_id: d.donor_id,
        message,
        read_status: false
      }));
    }

    const { error } = await supabaseAdmin
      .from('notification')
      .insert(insertData);

    if (error) {
      console.error('Send notification error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to send notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Successfully sent notification to ${insertData.length} donor(s)`,
    });
  } catch (err) {
    console.error('Notifications POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
