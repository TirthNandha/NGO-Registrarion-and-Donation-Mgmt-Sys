# Testing Super Admin Functionality

This guide will help you test the super admin feature in your NGO system.

## Prerequisites

Before testing, you need to:
1. Update your database to support the `superadmin` role
2. Create at least one super admin user

## Step 1: Database Setup

### 1.1 Update the Database Schema

Go to your Supabase project and open the SQL Editor. Run these queries:

```sql
-- Update role constraint to include superadmin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'superadmin'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

### 1.2 Create Your First Super Admin

**Option A: Using an existing user's email**
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'your-email@example.com';
```

**Option B: Using user ID**
```sql
-- First, find your user ID
SELECT id, name, email, role FROM profiles WHERE email = 'your-email@example.com';

-- Then update using the ID
UPDATE profiles 
SET role = 'superadmin' 
WHERE id = 'your-user-id-here';
```

### 1.3 Verify the Update

```sql
-- Check all superadmins
SELECT id, name, email, role, created_at 
FROM profiles 
WHERE role = 'superadmin';
```

You should see your user with role = 'superadmin'.

## Step 2: Testing Super Admin Access

### 2.1 Login as Super Admin

1. Go to your application: `http://localhost:3000`
2. Click "Login"
3. Enter the email and password of the user you made superadmin
4. You should be automatically redirected to `/superadmin`

### 2.2 Verify Super Admin Dashboard

You should see:
- ✅ A header that says "Super Admin Dashboard" with a "SUPERADMIN" badge
- ✅ Statistics cards showing:
  - Total Registrations
  - Total Donations (in ₹)
  - Successful donations count
  - Pending / Failed donations count
- ✅ User Management section with all users listed

### 2.3 Test User Search and Filtering

1. **Search functionality:**
   - Type a name or email in the search box
   - Verify that the user list filters correctly

2. **Role filtering:**
   - Select "All Roles" - should show all users
   - Select "Users" - should show only regular users
   - Select "Admins" - should show only admin users
   - Select "Super Admins" - should show only superadmin users

## Step 3: Testing Role Changes

### 3.1 Create Test Users

First, create some test users to work with:

1. Sign up 2-3 test accounts using the signup form:
   - test-user1@example.com (will be a regular user)
   - test-user2@example.com (will be promoted to admin)
   - test-admin1@example.com (will be admin, then demoted)

### 3.2 Test Promoting User to Admin

1. In the Super Admin dashboard, find a user with role "user"
2. Click the "Make Admin" button
3. **Verify the confirmation modal appears:**
   - ✅ Shows user's name
   - ✅ Shows current role as "user"
   - ✅ Shows new role as "admin"
   - ✅ Shows warning message about admin access
   - ✅ Has "Cancel" and "Confirm" buttons

4. Click "Confirm"
5. **Verify success:**
   - ✅ Success alert appears: "Successfully changed [name]'s role to admin"
   - ✅ User's role badge updates to "admin" (purple)
   - ✅ Button changes to "Remove Admin"

### 3.3 Test Demoting Admin to User

1. Find the user you just promoted (now showing as admin)
2. Click the "Remove Admin" button
3. **Verify the confirmation modal:**
   - ✅ Shows current role as "admin"
   - ✅ Shows new role as "user"
   - ✅ Shows info message about losing admin access
   - ✅ Has "Cancel" and "Confirm" buttons

4. Click "Confirm"
5. **Verify success:**
   - ✅ Success alert appears
   - ✅ User's role badge updates to "user" (blue)
   - ✅ Button changes to "Make Admin"

### 3.4 Test Modal Cancellation

1. Click "Make Admin" or "Remove Admin" on any user
2. Click "Cancel" in the modal
3. **Verify:**
   - ✅ Modal closes
   - ✅ No role change occurs
   - ✅ User's role remains the same

## Step 4: Test Access Control

### 4.1 Verify Super Admin Cannot Change Their Own Role

1. Look for your own user in the user list
2. **Verify:** The action button shows "Protected" (not clickable)

### 4.2 Verify Super Admin Cannot Change Another Super Admin's Role

If you have multiple superadmins:
1. Look for another superadmin in the list
2. **Verify:** The action button shows "Protected"

### 4.3 Test Admin User Access

1. Logout from superadmin
2. Login as an admin user
3. **Verify:**
   - ✅ Redirected to `/admin` (not `/superadmin`)
   - ✅ Can see admin dashboard with registrations and donations
   - ✅ Cannot access `/superadmin` (will be redirected to `/admin`)

### 4.4 Test Regular User Access

1. Logout from admin
2. Login as a regular user
3. **Verify:**
   - ✅ Redirected to `/dashboard` (not `/admin` or `/superadmin`)
   - ✅ Can see their own profile and donation history
   - ✅ Cannot access `/admin` or `/superadmin` (will be redirected to `/dashboard`)

## Step 5: Test API Security

### 5.1 Test Unauthorized Access

Open your browser's Developer Tools (F12), go to Console, and try:

```javascript
// Try to change role as a non-superadmin user (should fail)
fetch('/api/update-user-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'some-user-id',
    newRole: 'admin'
  })
}).then(r => r.json()).then(console.log);
```

**Expected result:** Error 403 - "Forbidden: Only superadmin can change roles"

### 5.2 Test Changing Own Role (Should Fail)

As superadmin, try to change your own role:

```javascript
// Get your user ID from the network tab or database
fetch('/api/update-user-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-own-user-id',
    newRole: 'user'
  })
}).then(r => r.json()).then(console.log);
```

**Expected result:** Error 400 - "Cannot change your own role"

### 5.3 Test Invalid Role (Should Fail)

```javascript
fetch('/api/update-user-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'some-user-id',
    newRole: 'superadmin'  // Only 'user' and 'admin' allowed
  })
}).then(r => r.json()).then(console.log);
```

**Expected result:** Error 400 - "Invalid role. Only 'user' and 'admin' are allowed"

## Step 6: Test Edge Cases

### 6.1 Test with No Users

1. In the Super Admin dashboard, apply filters that result in no matches
2. **Verify:** "No users found." message appears

### 6.2 Test Rapid Role Changes

1. Click "Make Admin" on a user
2. Quickly confirm
3. Immediately click "Remove Admin"
4. Confirm again
5. **Verify:** Both changes complete successfully without errors

### 6.3 Test During Network Issues

1. Open DevTools > Network tab
2. Set throttling to "Slow 3G" or "Offline"
3. Try to change a user's role
4. **Verify:** 
   - Loading state shows ("Updating..." in modal)
   - Appropriate error message if request fails

## Step 7: Visual Testing

### 7.1 Verify Role Badge Colors

- **User:** Blue background (bg-blue-500/10 text-blue-200)
- **Admin:** Purple background (bg-purple-500/10 text-purple-200)
- **Superadmin:** Rose/Red background (bg-rose-500/10 text-rose-200)

### 7.2 Test Responsive Design

1. Resize browser window or use DevTools device emulation
2. Test on:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

3. **Verify:**
   - User management table adapts to screen size
   - Modal is centered and readable
   - Buttons remain accessible

## Troubleshooting

### Issue: Can't access /superadmin, redirected to /dashboard

**Solution:** 
1. Check database: `SELECT role FROM profiles WHERE email = 'your-email@example.com';`
2. If role is not 'superadmin', run the UPDATE query again
3. Clear browser cache and cookies
4. Logout and login again

### Issue: "Failed to update role" error

**Possible causes:**
1. Check browser console for detailed error
2. Verify Supabase RLS (Row Level Security) policies allow role updates
3. Check that the API route is accessible

### Issue: Modal doesn't appear

**Solution:**
1. Check browser console for JavaScript errors
2. Verify the RoleChangeModal component is imported correctly
3. Clear browser cache

## Success Criteria Checklist

✅ Database updated with superadmin role support  
✅ At least one superadmin user created  
✅ Super admin can login and access `/superadmin`  
✅ Super admin can view all users  
✅ Super admin can search and filter users  
✅ Super admin can promote users to admin  
✅ Super admin can demote admins to user  
✅ Confirmation modal works correctly  
✅ Super admin cannot change own role  
✅ Super admin cannot change other superadmin roles  
✅ Regular admins cannot access superadmin features  
✅ Regular users cannot access admin or superadmin features  
✅ API security prevents unauthorized role changes  
✅ All visual elements display correctly  
✅ Responsive design works on all devices  

## Next Steps

After successful testing:

1. **Document your super admin credentials** in a secure location
2. **Never share super admin access** - keep it restricted to 1-2 trusted individuals
3. **Monitor role changes** - consider adding audit logging in the future
4. **Regular backups** - ensure database backups include the profiles table

## Support

If you encounter any issues during testing, check:
1. Browser console for errors
2. Supabase logs in the dashboard
3. Network tab for failed API requests
4. Database directly for role values
