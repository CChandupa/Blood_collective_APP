import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('blood_type')
      .select('*')
      .order('blood_type_id', { ascending: true });

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch blood types' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Blood types GET error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
