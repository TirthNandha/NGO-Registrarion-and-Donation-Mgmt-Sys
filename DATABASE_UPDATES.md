# Database Updates for Super Admin Feature

## 1. Update Role Column (if needed)

The `profiles` table's `role` column should allow three values: `user`, `admin`, and `superadmin`.

If you're using Supabase, run this SQL query in the SQL Editor:

```sql
-- First, check if there's a constraint on the role column
-- If there is a check constraint, we need to drop and recreate it

-- Add superadmin as a valid role (if there's a constraint)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'superadmin'));
```

## 2. Create Your First Super Admin

After updating the schema, you need to manually set one user as superadmin:

```sql
-- Replace 'your-email@example.com' with the email of the user you want to make superadmin
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'your-email@example.com';

-- OR if you know the user ID:
UPDATE profiles 
SET role = 'superadmin' 
WHERE id = 'your-user-id-here';
```

## 3. Verify the Update

```sql
-- Check all superadmins
SELECT id, name, email, role, created_at 
FROM profiles 
WHERE role = 'superadmin';
```

## 4. Optional: Create an Index for Role Queries

For better performance when querying by role:

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

## 5. Update Row Level Security (RLS) Policies

**IMPORTANT**: If you're experiencing issues where superadmin can't see any data, you need to update your RLS policies.

### Update Profiles Table Policies

```sql
-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;

-- Create new policy for both admin and superadmin
CREATE POLICY "Admins and superadmins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Allow superadmins to update profiles (for role changes)
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

### Update Donations Table Policies

```sql
-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;
DROP POLICY IF EXISTS "Admin users can view all donations" ON donations;

-- Create new policy for both admin and superadmin
CREATE POLICY "Admins and superadmins can view all donations"
ON donations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);
```

### Verify Policies

```sql
-- Check that policies are correctly applied
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'donations');
```

## Notes

- **Security**: Only manually assign superadmin role via database queries, never through the application UI
- The superadmin role should be restricted to 1-2 trusted users maximum
- Superadmin users will have access to change other users' roles between 'user' and 'admin'
- Superadmin cannot change their own role (this is enforced in the application code)
- **RLS Policies**: Make sure to update RLS policies to include 'superadmin' role, not just 'admin'
- After updating policies, logout and clear browser cache before logging back in
