import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('hospital')
      .select('*')
      .order('hospital_name', { ascending: true });

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch hospitals' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Hospitals GET error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hospital_name, contact_no, address } = body;

    if (!hospital_name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Hospital name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('hospital')
      .insert({ hospital_name, contact_no, address })
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create hospital' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Hospital added successfully',
    }, { status: 201 });
  } catch (err) {
    console.error('Hospitals POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
