import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractToken, verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id);

    const { data, error } = await supabaseAdmin
      .from('patient_request')
      .select(`
        *,
        blood_type:blood_type_id(blood_type_id, blood_group),
        hospital:hospital_id(hospital_id, hospital_name, contact_no, address)
      `)
      .eq('request_id', requestId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Get request error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const requestId = parseInt(id);
    const body = await request.json();

    const allowedFields = ['status', 'urgency_level', 'quantity_needed'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('patient_request')
      .update(updates)
      .eq('request_id', requestId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update request' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Request updated successfully',
    });
  } catch (err) {
    console.error('Update request error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
