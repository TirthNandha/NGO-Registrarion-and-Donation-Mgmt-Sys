# Fix Super Admin Data Access Issue

## Problem
Super admin can see the page but cannot view any data (only sees themselves). This is due to Row Level Security (RLS) policies in Supabase that need to be updated to include the `superadmin` role.

## Solution
Update your Supabase RLS policies to allow superadmin access to all data.

## Step 1: Check Current RLS Policies

Go to your Supabase Dashboard:
1. Navigate to **Authentication** → **Policies**
2. Look at the policies for the `profiles` and `donations` tables
3. You'll likely see policies that only allow `admin` role

## Step 2: Update RLS Policies

Open your Supabase SQL Editor and run these queries:

### For Profiles Table

```sql
-- Drop existing policies (if any) that restrict admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;

-- Create new policy that allows both admin and superadmin to view all profiles
CREATE POLICY "Admins and superadmins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own profile
  auth.uid() = id
  OR
  -- Allow admin and superadmin to see all profiles
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Create policy for admins and superadmins to update profiles (for role changes)
CREATE POLICY "Superadmins can update user roles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);
```

### For Donations Table

```sql
-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;
DROP POLICY IF EXISTS "Admin users can view all donations" ON donations;

-- Create new policy for admins and superadmins to view all donations
CREATE POLICY "Admins and superadmins can view all donations"
ON donations
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own donations
  auth.uid() = user_id
  OR
  -- Allow admin and superadmin to see all donations
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);
```

## Step 3: Verify Policies Are Active

```sql
-- Check profiles policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check donations policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'donations';
```

You should see policies that include both 'admin' and 'superadmin' roles.

## Step 4: Test the Fix

1. **Logout** from your superadmin account
2. **Clear browser cache and cookies** (important!)
3. **Login again** as superadmin
4. Navigate to `/superadmin`
5. You should now see:
   - ✅ All users in User Management
   - ✅ Correct total registrations count
   - ✅ All donation statistics
   - ✅ Ability to change user roles

## Alternative: If Using Custom RLS Setup

If your RLS policies are set up differently, you can use this more general approach:

```sql
-- Enable RLS on tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies and recreate
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update roles" ON profiles;

-- Users can see their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins and superadmins can see all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Only superadmins can update profiles (for role changes)
CREATE POLICY "Superadmins can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  )
);

-- Donations policies
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;

CREATE POLICY "Users can view own donations"
ON donations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations"
ON donations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Users can insert their own donations
CREATE POLICY "Users can insert own donations"
ON donations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow system to update donation status (for payment callbacks)
CREATE POLICY "Users can update own donations"
ON donations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

## Troubleshooting

### Issue: Still not seeing data after updating policies

**Solution:**
1. Clear browser cache completely
2. Logout and login again
3. Check if policies are actually applied:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'donations');
   ```

### Issue: "permission denied" errors in console

**Solution:**
1. Check Supabase logs for specific RLS errors
2. Verify the superadmin user exists:
   ```sql
   SELECT id, email, role FROM profiles WHERE role = 'superadmin';
   ```
3. Ensure RLS is enabled but policies allow the query

### Issue: Can see data but can't update roles

**Solution:**
Make sure the UPDATE policy for profiles table includes superadmin:
```sql
CREATE POLICY "Superadmins can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  )
);
```

## Verification Checklist

After running the SQL queries:

- [ ] Logged out and cleared browser cache
- [ ] Logged back in as superadmin
- [ ] Can see all users in User Management section
- [ ] Total Registrations shows correct count (not just 1)
- [ ] Donation statistics show correct numbers
- [ ] Can click "Make Admin" button on users
- [ ] Role change confirmation modal appears
- [ ] Role changes are saved successfully

## Important Notes

1. **RLS vs Service Role**: The issue is with RLS policies for authenticated users. The service role bypasses RLS, which is why backend operations work.

2. **Policy Order**: Policies are combined with OR logic. If any policy returns true, access is granted.

3. **Performance**: The subquery in the policies (`EXISTS (SELECT 1 FROM profiles...)`) is efficient because of the index on the role column we created earlier.

4. **Security**: These policies ensure:
   - Regular users can only see their own data
   - Admins can see all data but can't modify roles
   - Superadmins can see all data and modify roles

## Next Steps

After fixing:
1. Test all super admin functionality
2. Test that regular users still have restricted access
3. Test that admins can still view but not change roles
4. Document your final RLS policy configuration

If you continue to have issues, check your Supabase project logs for specific RLS denial messages, which will help identify which policy is blocking access.
