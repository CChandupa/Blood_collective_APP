import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase config");
  process.exit(1);
}

const FALLBACK_HOSPITALS = [
  { hospital_id: 1, hospital_name: 'National Hospital of Sri Lanka', contact_no: '011-2691111', address: 'Regent Street, Colombo 10' },
  { hospital_id: 2, hospital_name: 'Lady Ridgeway Hospital for Children', contact_no: '011-2693711', address: 'Dr. Danister De Silva Mawatha, Colombo 08' },
  { hospital_id: 3, hospital_name: 'De Soysa Hospital for Women', contact_no: '011-2696224', address: 'Kynsey Road, Colombo 08' },
  { hospital_id: 4, hospital_name: 'Castle Street Hospital for Women', contact_no: '011-2696232', address: 'Castle Street, Colombo 08' },
  { hospital_id: 5, hospital_name: 'Colombo South Teaching Hospital (Kalubowila)', contact_no: '011-2763261', address: 'Kalubowila, Dehiwala' },
  { hospital_id: 6, hospital_name: 'Colombo North Teaching Hospital (Ragama)', contact_no: '011-2959261', address: 'Ragama' },
  { hospital_id: 7, hospital_name: 'Sri Jayewardenepura General Hospital', contact_no: '011-2778610', address: 'Thalapathpitiya, Nugegoda' },
  { hospital_id: 8, hospital_name: 'District General Hospital Gampaha', contact_no: '033-2222261', address: 'Gampaha' },
  { hospital_id: 9, hospital_name: 'District General Hospital Negombo', contact_no: '031-2222261', address: 'Negombo' },
  { hospital_id: 10, hospital_name: 'Base Hospital Wathupitiwala', contact_no: '033-2287261', address: 'Wathupitiwala' },
  { hospital_id: 11, hospital_name: 'General Hospital Kalutara', contact_no: '034-2222261', address: 'Kalutara' },
  { hospital_id: 12, hospital_name: 'Base Hospital Horana', contact_no: '034-2261261', address: 'Horana' },
  { hospital_id: 13, hospital_name: 'Base Hospital Panadura', contact_no: '038-2232261', address: 'Panadura' },
  { hospital_id: 14, hospital_name: 'Teaching Hospital Kandy (General Hospital)', contact_no: '081-2222261', address: 'Kandy' },
  { hospital_id: 15, hospital_name: 'Teaching Hospital Peradeniya', contact_no: '081-2388001', address: 'Peradeniya' },
  { hospital_id: 16, hospital_name: 'Sirimavo Bandaranaike Specialized Children\'s Hospital', contact_no: '081-2222261', address: 'Peradeniya' },
  { hospital_id: 17, hospital_name: 'District General Hospital Matale', contact_no: '066-2222261', address: 'Matale' },
  { hospital_id: 18, hospital_name: 'Base Hospital Dambulla', contact_no: '066-2284261', address: 'Dambulla' },
  { hospital_id: 19, hospital_name: 'District General Hospital Nuwara Eliya', contact_no: '052-2222261', address: 'Nuwara Eliya' },
  { hospital_id: 20, hospital_name: 'Base Hospital Nawalapitiya', contact_no: '054-2222261', address: 'Nawalapitiya' },
  { hospital_id: 21, hospital_name: 'Base Hospital Dickoya', contact_no: '051-2222261', address: 'Dickoya' },
  { hospital_id: 22, hospital_name: 'Teaching Hospital Karapitiya', contact_no: '091-2232278', address: 'Karapitiya, Galle' },
  { hospital_id: 23, hospital_name: 'Teaching Hospital Mahamodara', contact_no: '091-2234801', address: 'Mahamodara, Galle' },
  { hospital_id: 24, hospital_name: 'Base Hospital Balapitiya', contact_no: '091-2258261', address: 'Balapitiya' },
  { hospital_id: 25, hospital_name: 'General Hospital Matara', contact_no: '041-2222261', address: 'Matara' },
  { hospital_id: 26, hospital_name: 'Base Hospital Deniyaya', contact_no: '041-2273261', address: 'Deniyaya' },
  { hospital_id: 27, hospital_name: 'General Hospital Hambantota', contact_no: '047-2220261', address: 'Hambantota' },
  { hospital_id: 28, hospital_name: 'District General Hospital Tangalle', contact_no: '047-2240261', address: 'Tangalle' },
  { hospital_id: 29, hospital_name: 'Base Hospital Embilipitiya', contact_no: '047-2230261', address: 'Embilipitiya' },
  { hospital_id: 30, hospital_name: 'Teaching Hospital Jaffna', contact_no: '021-2222261', address: 'Jaffna' },
  { hospital_id: 31, hospital_name: 'Base Hospital Point Pedro', contact_no: '021-2263261', address: 'Point Pedro' },
  { hospital_id: 32, hospital_name: 'Base Hospital Chavakachcheri', contact_no: '021-2245261', address: 'Chavakachcheri' },
  { hospital_id: 33, hospital_name: 'District General Hospital Kilinochchi', contact_no: '021-2285261', address: 'Kilinochchi' },
  { hospital_id: 34, hospital_name: 'District General Hospital Mannar', contact_no: '023-2222261', address: 'Mannar' },
  { hospital_id: 35, hospital_name: 'General Hospital Vavuniya', contact_no: '024-2222261', address: 'Vavuniya' },
  { hospital_id: 36, hospital_name: 'District General Hospital Mullaitivu', contact_no: '021-2290261', address: 'Mullaitivu' },
  { hospital_id: 37, hospital_name: 'Teaching Hospital Batticaloa', contact_no: '065-2222261', address: 'Batticaloa' },
  { hospital_id: 38, hospital_name: 'Base Hospital Valaichenai', contact_no: '065-2258261', address: 'Valaichenai' },
  { hospital_id: 39, hospital_name: 'General Hospital Ampara', contact_no: '063-2222261', address: 'Ampara' },
  { hospital_id: 40, hospital_name: 'District General Hospital Kalmunai', contact_no: '067-2222261', address: 'Kalmunai' },
  { hospital_id: 41, hospital_name: 'Base Hospital Akkaraipattu', contact_no: '067-2277261', address: 'Akkaraipattu' },
  { hospital_id: 42, hospital_name: 'General Hospital Trincomalee', contact_no: '026-2222261', address: 'Trincomalee' },
  { hospital_id: 43, hospital_name: 'Base Hospital Kantale', contact_no: '026-2234261', address: 'Kantale' },
  { hospital_id: 44, hospital_name: 'Teaching Hospital Kurunegala', contact_no: '037-2222261', address: 'Kurunegala' },
  { hospital_id: 45, hospital_name: 'Base Hospital Kuliyapitiya', contact_no: '037-2281261', address: 'Kuliyapitiya' },
  { hospital_id: 46, hospital_name: 'Base Hospital Nikaweratiya', contact_no: '037-2260261', address: 'Nikaweratiya' },
  { hospital_id: 47, hospital_name: 'District General Hospital Chilaw', contact_no: '032-2222261', address: 'Chilaw' },
  { hospital_id: 48, hospital_name: 'Base Hospital Puttalam', contact_no: '032-2265261', address: 'Puttalam' },
  { hospital_id: 49, hospital_name: 'Base Hospital Marawila', contact_no: '032-2254261', address: 'Marawila' },
  { hospital_id: 50, hospital_name: 'Teaching Hospital Anuradhapura', contact_no: '025-2222261', address: 'Anuradhapura' },
  { hospital_id: 51, hospital_name: 'Base Hospital Medawachchiya', contact_no: '025-2245261', address: 'Medawachchiya' },
  { hospital_id: 52, hospital_name: 'Base Hospital Kekirawa', contact_no: '025-2264261', address: 'Kekirawa' },
  { hospital_id: 53, hospital_name: 'District General Hospital Polonnaruwa', contact_no: '027-2222261', address: 'Polonnaruwa' },
  { hospital_id: 54, hospital_name: 'Base Hospital Medirigiriya', contact_no: '027-2247261', address: 'Medirigiriya' },
  { hospital_id: 55, hospital_name: 'General Hospital Badulla', contact_no: '055-2222261', address: 'Badulla' },
  { hospital_id: 56, hospital_name: 'Base Hospital Bandarawela', contact_no: '057-2222261', address: 'Bandarawela' },
  { hospital_id: 57, hospital_name: 'Base Hospital Mahiyanganaya', contact_no: '055-2257261', address: 'Mahiyanganaya' },
  { hospital_id: 58, hospital_name: 'Base Hospital Welimada', contact_no: '057-2245261', address: 'Welimada' },
  { hospital_id: 59, hospital_name: 'District General Hospital Moneragala', contact_no: '055-2276261', address: 'Moneragala' },
  { hospital_id: 60, hospital_name: 'Base Hospital Wellawaya', contact_no: '055-2274261', address: 'Wellawaya' },
  { hospital_id: 61, hospital_name: 'Base Hospital Bibile', contact_no: '055-2265261', address: 'Bibile' },
  { hospital_id: 62, hospital_name: 'General Hospital Ratnapura', contact_no: '045-2222261', address: 'Ratnapura' },
  { hospital_id: 63, hospital_name: 'Base Hospital Balangoda', contact_no: '045-2287261', address: 'Balangoda' },
  { hospital_id: 64, hospital_name: 'Base Hospital Eheliyagoda', contact_no: '036-2258261', address: 'Eheliyagoda' },
  { hospital_id: 65, hospital_name: 'Base Hospital Pelmadulla', contact_no: '045-2268261', address: 'Pelmadulla' },
  { hospital_id: 66, hospital_name: 'General Hospital Kegalle', contact_no: '035-2222261', address: 'Kegalle' },
  { hospital_id: 67, hospital_name: 'Base Hospital Mawanella', contact_no: '035-2246261', address: 'Mawanella' },
  { hospital_id: 68, hospital_name: 'Base Hospital Karawanella', contact_no: '036-2244261', address: 'Karawanella' }
];

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

async function seed() {
  console.log('Seeding Supabase...');
  
  // Seed Hospitals
  const resHospitals = await fetch(`${supabaseUrl}/rest/v1/hospital`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(FALLBACK_HOSPITALS)
  });
  
  if (!resHospitals.ok) {
    const error = await resHospitals.text();
    console.error('Failed to seed hospitals:', error);
  } else {
    console.log('✅ Seeded 68 Hospitals');
  }

  // Seed Locations
  const resLocations = await fetch(`${supabaseUrl}/rest/v1/location`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(FALLBACK_LOCATIONS)
  });

  if (!resLocations.ok) {
    const error = await resLocations.text();
    console.error('Failed to seed locations:', error);
  } else {
    console.log('✅ Seeded 25 Locations');
  }
}

seed();
