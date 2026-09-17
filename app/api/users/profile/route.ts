import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Get current authenticated user profile
 */
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const userEmail = user!.email;
    const userId = user!.id;
    const userRole = user!.role;

    let profile = {
      id: userId,
      email: userEmail,
      username: userEmail.split('@')[0],
      fullName: userEmail.split('@')[0].replace(/[._-]/g, ' '),
      bio: '',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`,
      role: userRole,
      socialLinks: { twitter: '', linkedin: '', github: '' },
    };

    // 1. Check MongoDB Atlas user_profiles
    try {
      const db = await getDatabase();
      if (db) {
        const mongoDoc = await db.collection('user_profiles').findOne({ email: userEmail });
        if (mongoDoc) {
          profile = {
            ...profile,
            username: mongoDoc.username || profile.username,
            fullName: mongoDoc.fullName || profile.fullName,
            bio: mongoDoc.bio || '',
            avatarUrl: mongoDoc.avatarUrl || profile.avatarUrl,
            socialLinks: mongoDoc.socialLinks || profile.socialLinks,
          };
        }
      }
    } catch (err: any) {
      console.warn('[MongoDB Profile GET Warn]:', err.message);
    }

    // 2. Check Supabase User Metadata if admin client available
    const adminClient = createSupabaseAdminClient();
    if (adminClient && userId) {
      try {
        const { data: authUser } = await adminClient.auth.admin.getUserById(userId);
        if (authUser?.user) {
          const meta = authUser.user.user_metadata || {};
          profile.username = meta.username || profile.username;
          profile.fullName = meta.full_name || meta.name || profile.fullName;
          if (meta.bio) profile.bio = meta.bio;
          if (meta.avatar_url) profile.avatarUrl = meta.avatar_url;
        }
      } catch (err: any) {
        console.warn('[Supabase Profile GET Warn]:', err.message);
      }
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('[Profile GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Update current authenticated user profile & password
 */
export async function PUT(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const userEmail = user!.email;
    const userId = user!.id;
    const userRole = user!.role;

    const body = await request.json();
    const { username, fullName, bio, avatarUrl, currentPassword, newPassword, socialLinks } = body;

    const adminClient = createSupabaseAdminClient();
    const serverClient = createSupabaseServerClient();

    // =========================================================================
    // 1. PASSWORD UPDATE
    // =========================================================================
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      // Strictly require and verify current password
      if (!currentPassword || typeof currentPassword !== 'string') {
        return NextResponse.json(
          { error: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }

      const { error: verifyErr } = await serverClient.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (verifyErr) {
        return NextResponse.json(
          { error: 'Current password is incorrect. Please verify and try again.' },
          { status: 400 }
        );
      }

      // Update password via Supabase Admin API
      if (adminClient && userId) {
        const { error: updatePassErr } = await adminClient.auth.admin.updateUserById(userId, {
          password: newPassword,
        });

        if (updatePassErr) {
          return NextResponse.json({ error: updatePassErr.message }, { status: 400 });
        }
      } else {
        const { error: directErr } = await serverClient.auth.updateUser({
          password: newPassword,
        });
        if (directErr) {
          return NextResponse.json({ error: directErr.message }, { status: 400 });
        }
      }
    }

    // =========================================================================
    // 2. PROFILE METADATA UPDATE (Username, Full Name, Bio, Avatar)
    // =========================================================================
    const cleanUsername = String(username || userEmail.split('@')[0]).trim().slice(0, 50);
    const cleanFullName = String(fullName || cleanUsername).trim().slice(0, 100);
    const cleanBio = String(bio || '').trim().slice(0, 500);
    const cleanAvatar = avatarUrl ? String(avatarUrl).trim() : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`;

    // Update in Supabase Auth user_metadata
    if (adminClient && userId) {
      try {
        await adminClient.auth.admin.updateUserById(userId, {
          user_metadata: {
            username: cleanUsername,
            full_name: cleanFullName,
            name: cleanFullName,
            bio: cleanBio,
            avatar_url: cleanAvatar,
            role: userRole,
          },
        });
      } catch (err: any) {
        console.warn('[Supabase Metadata Update Warn]:', err.message);
      }
    }

    // Persist to MongoDB Atlas user_profiles collection
    try {
      const db = await getDatabase();
      if (db) {
        await db.collection('user_profiles').updateOne(
          { email: userEmail },
          {
            $set: {
              email: userEmail,
              userId: userId,
              username: cleanUsername,
              fullName: cleanFullName,
              bio: cleanBio,
              avatarUrl: cleanAvatar,
              socialLinks: typeof socialLinks === 'object' && socialLinks !== null ? socialLinks : {},
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch (err: any) {
      console.warn('[MongoDB Profile Update Warn]:', err.message);
    }

    // Also update Supabase profiles table if it exists
    try {
      if (userId) {
        await serverClient
          .from('profiles')
          .upsert({
            id: userId,
            email: userEmail,
            full_name: cleanFullName,
            avatar_url: cleanAvatar,
            updated_at: new Date().toISOString(),
          });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: newPassword
        ? 'Profile and password updated successfully!'
        : 'Profile details saved successfully!',
      profile: {
        id: userId,
        email: userEmail,
        username: cleanUsername,
        fullName: cleanFullName,
        bio: cleanBio,
        avatarUrl: cleanAvatar,
        role: userRole,
        socialLinks: typeof socialLinks === 'object' && socialLinks !== null ? socialLinks : {},
      },
    });
  } catch (error: any) {
    console.error('[Profile PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
