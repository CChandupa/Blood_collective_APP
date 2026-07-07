import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Testing connection to Supabase...');
  
  // Try to query the blood_type table which should have been created by schema.sql
  const { data, error } = await supabase.from('blood_type').select('*').limit(1);
  
  if (error) {
    console.error('Database connection failed or tables not created yet.');
    console.error('Error Details:', error.message);
  } else {
    console.log('✅ Database is successfully connected!');
    console.log('Tables exist. Current data in blood_type:', data);
  }
}

checkDatabase();
