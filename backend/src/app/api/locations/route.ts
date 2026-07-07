import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

const FALLBACK_LOCATIONS = [
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
}));

function getFallbackResponse() {
  return NextResponse.json<ApiResponse>({ success: true, data: FALLBACK_LOCATIONS });
}

// Check if Supabase keys are actually configured
function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key || key.includes('YOUR_') || key.length < 20) {
    return false;
  }
  return true;
}

export async function GET() {
  // If Supabase isn't configured, return fallback immediately (no hanging!)
  if (!isSupabaseConfigured()) {
    return getFallbackResponse();
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('location')
      .select('*')
      .order('district', { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackResponse();
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Locations GET error:', err);
    return getFallbackResponse();
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
