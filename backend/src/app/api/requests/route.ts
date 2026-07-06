import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, CreateRequestPayload } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blood_type_id = searchParams.get('blood_type_id');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');

    let query = supabaseAdmin
      .from('patient_request')
      .select(`
        *,
        blood_type:blood_type_id(blood_type_id, blood_group),
        hospital:hospital_id(hospital_id, hospital_name, contact_no, address)
      `)
      .order('request_date', { ascending: false });

    if (blood_type_id) {
      query = query.eq('blood_type_id', parseInt(blood_type_id));
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (urgency) {
      query = query.eq('urgency_level', urgency);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch requests error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    });
  } catch (err) {
    console.error('Requests GET error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRequestPayload = await request.json();
    const { blood_type_id, patient_name, hospital_id, urgency_level, quantity_needed } = body;

    if (!blood_type_id || !patient_name || !hospital_id || !urgency_level || !quantity_needed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('patient_request')
      .insert({
        blood_type_id,
        patient_name,
        hospital_id,
        urgency_level,
        quantity_needed,
        status: 'Pending',
      })
      .select(`
        *,
        blood_type:blood_type_id(blood_type_id, blood_group),
        hospital:hospital_id(hospital_id, hospital_name, contact_no, address)
      `)
      .single();

    if (error) {
      console.error('Create request error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create request' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Blood request created successfully',
    }, { status: 201 });
  } catch (err) {
    console.error('Requests POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
