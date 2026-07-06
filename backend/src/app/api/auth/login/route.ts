import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { comparePassword, generateToken } from '@/lib/auth';
import { LoginRequest, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields: email, password, role' },
        { status: 400 }
      );
    }

    if (role === 'admin') {
      // Admin login
      const { data: admin, error } = await supabaseAdmin
        .from('admin')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !admin) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isValid = await comparePassword(password, admin.password);
      if (!isValid) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = generateToken({ id: admin.admin_id, email: admin.email, role: 'admin' });
      const { password: _, ...adminWithoutPassword } = admin;

      return NextResponse.json<ApiResponse<AuthResponse>>({
        success: true,
        data: { token, user: adminWithoutPassword, role: 'admin' },
      });
    } else {
      // Donor login
      const { data: donor, error } = await supabaseAdmin
        .from('donor')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !donor) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isValid = await comparePassword(password, donor.password);
      if (!isValid) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = generateToken({ id: donor.donor_id, email: donor.email, role: 'donor' });
      const { password: _, ...donorWithoutPassword } = donor;

      return NextResponse.json<ApiResponse<AuthResponse>>({
        success: true,
        data: { token, user: donorWithoutPassword, role: 'donor' },
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
