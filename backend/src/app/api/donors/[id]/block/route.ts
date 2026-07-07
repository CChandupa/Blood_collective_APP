import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const donorId = parseInt(id);
    const body = await request.json();
    const is_blocked = body.is_blocked;

    if (typeof is_blocked !== 'boolean') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'is_blocked must be a boolean' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('donor')
      .update({ is_blocked })
      .eq('donor_id', donorId);

    if (error) {
      console.error('Block donor error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update donor status' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Donor successfully ${is_blocked ? 'blocked' : 'unblocked'}`,
    });
  } catch (err) {
    console.error('Block POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
