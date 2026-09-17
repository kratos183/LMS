import { NextResponse } from 'next/server';
import { getVerifiedUser } from '@/lib/auth';

export async function GET() {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ role: null, email: null, userId: null });
  }
  return NextResponse.json({ role: user.role, email: user.email, userId: user.id });
}
