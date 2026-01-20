import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, newRole } = await request.json();

    // Validate input
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'Missing userId or newRole' },
        { status: 400 }
      );
    }

    if (!['user', 'admin'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Only "user" and "admin" are allowed' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if the requester is authenticated and is a superadmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (requesterProfile?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden: Only superadmin can change roles' },
        { status: 403 }
      );
    }

    // Prevent superadmin from changing their own role
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Get the target user's current role
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, name, email')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing another superadmin's role
    if (targetUser.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot change the role of another superadmin' },
        { status: 403 }
      );
    }

    // Update the user's role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: {
        id: userId,
        name: targetUser.name,
        email: targetUser.email,
        oldRole: targetUser.role,
        newRole: newRole,
      },
    });
  } catch (error) {
    console.error('Error in update-user-role API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
