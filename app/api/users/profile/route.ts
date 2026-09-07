import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * Get current authenticated user profile
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value?.toLowerCase().trim();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value || 'student';

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    let profile = {
      id: userId || '',
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
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value?.toLowerCase().trim();
    let userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value || 'student';

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { username, fullName, bio, avatarUrl, currentPassword, newPassword, socialLinks } = body;

    const adminClient = createSupabaseAdminClient();
    const serverClient = createSupabaseServerClient();

    // If userId not in cookie, attempt to locate user in Supabase by email
    if (!userId && adminClient) {
      try {
        const { data: usersList } = await adminClient.auth.admin.listUsers();
        const found = usersList?.users?.find((u) => u.email?.toLowerCase() === userEmail);
        if (found) userId = found.id;
      } catch {}
    }

    // =========================================================================
    // 1. PASSWORD UPDATE
    // =========================================================================
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      // If current password provided, verify it first
      if (currentPassword) {
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
        // Direct client session update fallback
        const { error: directErr } = await serverClient.auth.updateUser({
          password: newPassword,
        });
        if (directErr && !adminClient) {
          return NextResponse.json({ error: directErr.message }, { status: 400 });
        }
      }
    }

    // =========================================================================
    // 2. PROFILE METADATA UPDATE (Username, Full Name, Bio, Avatar)
    // =========================================================================
    const cleanUsername = (username || userEmail.split('@')[0]).trim();
    const cleanFullName = (fullName || cleanUsername).trim();
    const cleanBio = (bio || '').trim();
    const cleanAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`;

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
              userId: userId || null,
              username: cleanUsername,
              fullName: cleanFullName,
              bio: cleanBio,
              avatarUrl: cleanAvatar,
              socialLinks: socialLinks || {},
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
        socialLinks: socialLinks || {},
      },
    });
  } catch (error: any) {
    console.error('[Profile PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
