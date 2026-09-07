import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value || null;
  const email = cookieStore.get('user_email')?.value || null;
  const userId = cookieStore.get('user_id')?.value || null;
  return NextResponse.json({ role, email, userId });
}
