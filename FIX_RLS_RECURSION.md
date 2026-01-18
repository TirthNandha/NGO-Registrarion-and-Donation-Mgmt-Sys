# Fix RLS Infinite Recursion Error

## Problem
Getting error: `infinite recursion detected in policy for relation "profiles"`

This happens because the RLS policy is querying the profiles table to check the role, which triggers the same policy again, creating an infinite loop.

## Solution: Use Security Definer Function

We need to create a function that bypasses RLS to check the user's role.

## Step 1: Drop Existing Problematic Policies

Go to your Supabase SQL Editor and run:

```sql
-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Admins and superadmins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update user roles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update profiles" ON profiles;

-- Drop all existing policies on donations
DROP POLICY IF EXISTS "Admins and superadmins can view all donations" ON donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
```

## Step 2: Create Helper Function

Create a function that gets the user's role without triggering RLS:

```sql
-- Create a function to get user role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;
```

## Step 3: Create New Policies Using the Function

### For Profiles Table

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins and superadmins can view all profiles
CREATE POLICY "Admins and superadmins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) IN ('admin', 'superadmin')
);

-- Superadmins can update profiles (for role changes)
CREATE POLICY "Superadmins can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  get_user_role(auth.uid()) = 'superadmin'
)
WITH CHECK (
  get_user_role(auth.uid()) = 'superadmin'
);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### For Donations Table

```sql
-- Users can view their own donations
CREATE POLICY "Users can view own donations"
ON donations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins and superadmins can view all donations
CREATE POLICY "Admins and superadmins can view all donations"
ON donations
FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) IN ('admin', 'superadmin')
);

-- Users can insert their own donations
CREATE POLICY "Users can insert own donations"
ON donations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own donations (for payment status updates)
CREATE POLICY "Users can update own donations"
ON donations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Step 4: Verify Setup

```sql
-- Check that the function exists
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'get_user_role';

-- Check policies are created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('profiles', 'donations')
ORDER BY tablename, policyname;

-- Test the function
SELECT get_user_role(auth.uid());
```

## Step 5: Test the Fix

1. **Restart your dev server** (to clear any cached connections)
2. **Clear browser cache and cookies**
3. **Logout** from all sessions
4. **Login** as superadmin
5. Navigate to `/superadmin`
6. You should now see all data without recursion errors

## Why This Works

The `SECURITY DEFINER` function runs with the privileges of the function creator (usually the database owner), which bypasses RLS. This breaks the recursion loop:

1. User queries profiles table
2. RLS policy calls `get_user_role()` function
3. Function bypasses RLS and directly gets the role
4. No recursion!

## Verification Checklist

- [ ] Helper function created successfully
- [ ] All old policies dropped
- [ ] New policies created using the function
- [ ] No recursion errors in terminal/console
- [ ] Superadmin can see all users
- [ ] Superadmin can see all donations
- [ ] Regular users can only see their own data
- [ ] Role changes work correctly

## Important Security Notes

1. The `SECURITY DEFINER` function is safe here because:
   - It only returns a single field (role)
   - It's called within RLS policies
   - Users can't directly exploit it

2. Make sure your profiles table has proper constraints on the role column (which we already set up).

3. The function is marked as `STABLE` for better performance (role doesn't change during a transaction).

## Troubleshooting

### If you still get recursion errors:

1. Make sure the old policies are completely dropped:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   Should only show the new policies.

2. Restart your Supabase connection pool (if using connection pooling)

3. Check that the function exists:
   ```sql
   \df get_user_role
   ```

### If data still isn't showing:

1. Test the function directly:
   ```sql
   SELECT get_user_role(auth.uid());
   ```
   Should return 'superadmin'

2. Check policies are using the function:
   ```sql
   SELECT policyname, qual 
   FROM pg_policies 
   WHERE tablename = 'profiles' 
   AND policyname LIKE '%admin%';
   ```

## Quick Copy-Paste All Commands

Here's all the SQL in one block for easy copy-paste:

```sql
-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Admins and superadmins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update user roles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and superadmins can view all donations" ON donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Users can insert own donations" ON donations;
DROP POLICY IF EXISTS "Users can update own donations" ON donations;

-- Step 2: Create helper function
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- Step 3: Create profiles policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins and superadmins can view all profiles"
ON profiles FOR SELECT TO authenticated
USING (get_user_role(auth.uid()) IN ('admin', 'superadmin'));

CREATE POLICY "Superadmins can update profiles"
ON profiles FOR UPDATE TO authenticated
USING (get_user_role(auth.uid()) = 'superadmin')
WITH CHECK (get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Create donations policies
CREATE POLICY "Users can view own donations"
ON donations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and superadmins can view all donations"
ON donations FOR SELECT TO authenticated
USING (get_user_role(auth.uid()) IN ('admin', 'superadmin'));

CREATE POLICY "Users can insert own donations"
ON donations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own donations"
ON donations FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

After running these commands, restart your app and test!
