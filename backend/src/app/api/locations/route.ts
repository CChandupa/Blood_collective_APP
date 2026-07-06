import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('location')
      .select('*')
      .order('district', { ascending: true });

    if (error) {
      // Fallback to hardcoded list if database is not set up
      return NextResponse.json<ApiResponse>({
        success: true,
        data: [
          'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
          'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
          'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
          'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam',
          'Ratnapura', 'Trincomalee', 'Vavuniya'
        ].map((district, index) => ({
          location_id: index + 1,
          city: district,
          district: district,
          postal_code: '00000'
        }))
      });
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Locations GET error:', err);
    // Fallback to hardcoded list on exception
    return NextResponse.json<ApiResponse>({
      success: true,
      data: [
          'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
          'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
          'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
          'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam',
          'Ratnapura', 'Trincomalee', 'Vavuniya'
      ].map((district, index) => ({
        location_id: index + 1,
        city: district,
        district: district,
        postal_code: '00000'
      }))
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, postal_code, district } = body;

    if (!city || !postal_code || !district) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'city, postal_code, and district are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('location')
      .insert({ city, postal_code, district })
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create location' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Location added successfully',
    }, { status: 201 });
  } catch (err) {
    console.error('Locations POST error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
