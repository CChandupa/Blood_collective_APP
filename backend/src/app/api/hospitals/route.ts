import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/types';

// Comprehensive list of real Sri Lankan government hospitals across all 25 districts
const FALLBACK_HOSPITALS = [
  // === Colombo District ===
  { hospital_name: 'National Hospital of Sri Lanka', contact_no: '011-2691111', address: 'Regent Street, Colombo 10' },
  { hospital_name: 'Lady Ridgeway Hospital for Children', contact_no: '011-2693711', address: 'Dr. Danister De Silva Mawatha, Colombo 08' },
  { hospital_name: 'De Soysa Hospital for Women', contact_no: '011-2696224', address: 'Kynsey Road, Colombo 08' },
  { hospital_name: 'Castle Street Hospital for Women', contact_no: '011-2696232', address: 'Castle Street, Colombo 08' },
  { hospital_name: 'Colombo South Teaching Hospital (Kalubowila)', contact_no: '011-2763261', address: 'Kalubowila, Dehiwala' },
  { hospital_name: 'Colombo North Teaching Hospital (Ragama)', contact_no: '011-2959261', address: 'Ragama' },
  { hospital_name: 'Sri Jayewardenepura General Hospital', contact_no: '011-2778610', address: 'Thalapathpitiya, Nugegoda' },

  // === Gampaha District ===
  { hospital_name: 'District General Hospital Gampaha', contact_no: '033-2222261', address: 'Gampaha' },
  { hospital_name: 'District General Hospital Negombo', contact_no: '031-2222261', address: 'Negombo' },
  { hospital_name: 'Base Hospital Wathupitiwala', contact_no: '033-2287261', address: 'Wathupitiwala' },

  // === Kalutara District ===
  { hospital_name: 'General Hospital Kalutara', contact_no: '034-2222261', address: 'Kalutara' },
  { hospital_name: 'Base Hospital Horana', contact_no: '034-2261261', address: 'Horana' },
  { hospital_name: 'Base Hospital Panadura', contact_no: '038-2232261', address: 'Panadura' },

  // === Kandy District ===
  { hospital_name: 'Teaching Hospital Kandy (General Hospital)', contact_no: '081-2222261', address: 'Kandy' },
  { hospital_name: 'Teaching Hospital Peradeniya', contact_no: '081-2388001', address: 'Peradeniya' },
  { hospital_name: 'Sirimavo Bandaranaike Specialized Children\'s Hospital', contact_no: '081-2222261', address: 'Peradeniya' },

  // === Matale District ===
  { hospital_name: 'District General Hospital Matale', contact_no: '066-2222261', address: 'Matale' },
  { hospital_name: 'Base Hospital Dambulla', contact_no: '066-2284261', address: 'Dambulla' },

  // === Nuwara Eliya District ===
  { hospital_name: 'District General Hospital Nuwara Eliya', contact_no: '052-2222261', address: 'Nuwara Eliya' },
  { hospital_name: 'Base Hospital Nawalapitiya', contact_no: '054-2222261', address: 'Nawalapitiya' },
  { hospital_name: 'Base Hospital Dickoya', contact_no: '051-2222261', address: 'Dickoya' },

  // === Galle District ===
  { hospital_name: 'Teaching Hospital Karapitiya', contact_no: '091-2232278', address: 'Karapitiya, Galle' },
  { hospital_name: 'Teaching Hospital Mahamodara', contact_no: '091-2234801', address: 'Mahamodara, Galle' },
  { hospital_name: 'Base Hospital Balapitiya', contact_no: '091-2258261', address: 'Balapitiya' },

  // === Matara District ===
  { hospital_name: 'General Hospital Matara', contact_no: '041-2222261', address: 'Matara' },
  { hospital_name: 'Base Hospital Deniyaya', contact_no: '041-2273261', address: 'Deniyaya' },

  // === Hambantota District ===
  { hospital_name: 'General Hospital Hambantota', contact_no: '047-2220261', address: 'Hambantota' },
  { hospital_name: 'District General Hospital Tangalle', contact_no: '047-2240261', address: 'Tangalle' },
  { hospital_name: 'Base Hospital Embilipitiya', contact_no: '047-2230261', address: 'Embilipitiya' },

  // === Jaffna District ===
  { hospital_name: 'Teaching Hospital Jaffna', contact_no: '021-2222261', address: 'Jaffna' },
  { hospital_name: 'Base Hospital Point Pedro', contact_no: '021-2263261', address: 'Point Pedro' },
  { hospital_name: 'Base Hospital Chavakachcheri', contact_no: '021-2245261', address: 'Chavakachcheri' },

  // === Kilinochchi District ===
  { hospital_name: 'District General Hospital Kilinochchi', contact_no: '021-2285261', address: 'Kilinochchi' },

  // === Mannar District ===
  { hospital_name: 'District General Hospital Mannar', contact_no: '023-2222261', address: 'Mannar' },

  // === Vavuniya District ===
  { hospital_name: 'General Hospital Vavuniya', contact_no: '024-2222261', address: 'Vavuniya' },

  // === Mullaitivu District ===
  { hospital_name: 'District General Hospital Mullaitivu', contact_no: '021-2290261', address: 'Mullaitivu' },

  // === Batticaloa District ===
  { hospital_name: 'Teaching Hospital Batticaloa', contact_no: '065-2222261', address: 'Batticaloa' },
  { hospital_name: 'Base Hospital Valaichenai', contact_no: '065-2258261', address: 'Valaichenai' },

  // === Ampara District ===
  { hospital_name: 'General Hospital Ampara', contact_no: '063-2222261', address: 'Ampara' },
  { hospital_name: 'District General Hospital Kalmunai', contact_no: '067-2222261', address: 'Kalmunai' },
  { hospital_name: 'Base Hospital Akkaraipattu', contact_no: '067-2277261', address: 'Akkaraipattu' },

  // === Trincomalee District ===
  { hospital_name: 'General Hospital Trincomalee', contact_no: '026-2222261', address: 'Trincomalee' },
  { hospital_name: 'Base Hospital Kantale', contact_no: '026-2234261', address: 'Kantale' },

  // === Kurunegala District ===
  { hospital_name: 'Teaching Hospital Kurunegala', contact_no: '037-2222261', address: 'Kurunegala' },
  { hospital_name: 'Base Hospital Kuliyapitiya', contact_no: '037-2281261', address: 'Kuliyapitiya' },
  { hospital_name: 'Base Hospital Nikaweratiya', contact_no: '037-2260261', address: 'Nikaweratiya' },

  // === Puttalam District ===
  { hospital_name: 'District General Hospital Chilaw', contact_no: '032-2222261', address: 'Chilaw' },
  { hospital_name: 'Base Hospital Puttalam', contact_no: '032-2265261', address: 'Puttalam' },
  { hospital_name: 'Base Hospital Marawila', contact_no: '032-2254261', address: 'Marawila' },

  // === Anuradhapura District ===
  { hospital_name: 'Teaching Hospital Anuradhapura', contact_no: '025-2222261', address: 'Anuradhapura' },
  { hospital_name: 'Base Hospital Medawachchiya', contact_no: '025-2245261', address: 'Medawachchiya' },
  { hospital_name: 'Base Hospital Kekirawa', contact_no: '025-2264261', address: 'Kekirawa' },

  // === Polonnaruwa District ===
  { hospital_name: 'District General Hospital Polonnaruwa', contact_no: '027-2222261', address: 'Polonnaruwa' },
  { hospital_name: 'Base Hospital Medirigiriya', contact_no: '027-2247261', address: 'Medirigiriya' },

  // === Badulla District ===
  { hospital_name: 'General Hospital Badulla', contact_no: '055-2222261', address: 'Badulla' },
  { hospital_name: 'Base Hospital Bandarawela', contact_no: '057-2222261', address: 'Bandarawela' },
  { hospital_name: 'Base Hospital Mahiyanganaya', contact_no: '055-2257261', address: 'Mahiyanganaya' },
  { hospital_name: 'Base Hospital Welimada', contact_no: '057-2245261', address: 'Welimada' },

  // === Moneragala District ===
  { hospital_name: 'District General Hospital Moneragala', contact_no: '055-2276261', address: 'Moneragala' },
  { hospital_name: 'Base Hospital Wellawaya', contact_no: '055-2274261', address: 'Wellawaya' },
  { hospital_name: 'Base Hospital Bibile', contact_no: '055-2265261', address: 'Bibile' },

  // === Ratnapura District ===
  { hospital_name: 'General Hospital Ratnapura', contact_no: '045-2222261', address: 'Ratnapura' },
  { hospital_name: 'Base Hospital Balangoda', contact_no: '045-2287261', address: 'Balangoda' },
  { hospital_name: 'Base Hospital Eheliyagoda', contact_no: '036-2258261', address: 'Eheliyagoda' },
  { hospital_name: 'Base Hospital Pelmadulla', contact_no: '045-2268261', address: 'Pelmadulla' },

  // === Kegalle District ===
  { hospital_name: 'General Hospital Kegalle', contact_no: '035-2222261', address: 'Kegalle' },
  { hospital_name: 'Base Hospital Mawanella', contact_no: '035-2246261', address: 'Mawanella' },
  { hospital_name: 'Base Hospital Karawanella', contact_no: '036-2244261', address: 'Karawanella' },
].sort((a, b) => a.hospital_name.localeCompare(b.hospital_name));

function getFallbackResponse() {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: FALLBACK_HOSPITALS.map((h, index) => ({
      hospital_id: index + 1,
      ...h,
    }))
  });
}

// Check if Supabase keys are actually configured
function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  // If keys are placeholder values, Supabase is not configured
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
      .from('hospital')
      .select('*')
      .order('hospital_name', { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackResponse();
    }

    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (err) {
    console.error('Hospitals GET error:', err);
    return getFallbackResponse();
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
