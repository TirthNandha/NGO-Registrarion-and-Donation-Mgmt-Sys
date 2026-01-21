# Testing Email Verification Notification

## Overview
When users click the email verification link sent to their email, they are redirected to the homepage with a success notification and then automatically redirected to the login page.

## How It Works

1. **User Signs Up**: User fills in the signup form with name, phone, email, and password
2. **Email Sent**: Supabase sends a confirmation email with a verification link
3. **User Clicks Link**: User clicks the confirmation link in their email
4. **Redirect to Homepage**: User is redirected to `http://localhost:3000/?code=xxx&verified=true`
   - Supabase adds the `code` parameter automatically
   - Our app adds the `verified=true` parameter via `emailRedirectTo`
5. **Notification Shown**: A green toast notification appears saying "Email verified successfully!"
6. **Alert Displayed**: Browser alert confirms verification
7. **URL Cleaned**: Both `code` and `verified` parameters are removed from the URL
8. **Auto-redirect**: After 2 seconds, user is redirected to `/auth` to login

## Testing Steps

### 1. Sign Up Flow

1. Go to `http://localhost:3000/auth`
2. Click "Sign Up" 
3. Fill in the form:
   - Name: Test User
   - Phone: +911234567890
   - Email: your-test-email@example.com
   - Password: TestPass123!
4. Click "Create Account"
5. You should see: "Signup successful! Check your email for confirmation."

### 2. Email Verification

**Option A: Using Real Email**
1. Check your email inbox
2. Open the email from Supabase
3. Click the "Confirm your email" button
4. You'll be redirected to the homepage
5. ✅ Green notification appears at the top
6. ✅ Browser alert shows "Email verified successfully! Please login to continue."
7. ✅ After 1.5s, automatically redirected to `/auth`

**Option B: Using Supabase Dashboard (for testing)**
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Find the newly created user
4. Click on the user
5. Manually set `email_confirmed_at` to the current timestamp
6. Visit `http://localhost:3000/?verified=true`
7. ✅ Notification should appear

### 3. Login After Verification

1. After redirect to `/auth`, login with your credentials
2. You should be able to login successfully
3. Based on your role, you'll be redirected to:
   - Regular user → `/dashboard`
   - Admin → `/admin`
   - Super admin → `/superadmin`

## Visual Verification Checklist

- [ ] Toast notification appears at the top center of the page
- [ ] Notification has a green checkmark icon
- [ ] Text says "Email verified successfully!"
- [ ] Sub-text says "Redirecting to login..."
- [ ] Browser alert appears
- [ ] Alert says "Email verified successfully! Please login to continue."
- [ ] URL is cleaned (no `?code=xxx&verified=true` visible after notification)
- [ ] Automatic redirect to `/auth` happens after 2 seconds

## Configuration

### Environment Variable Required

Make sure `.env.local` has:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, update to your actual domain:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Supabase Email Settings

1. Go to Supabase Dashboard
2. Navigate to Authentication > Email Templates
3. Verify that "Confirm signup" template is enabled
4. The redirect URL is set automatically via the `emailRedirectTo` option in the signup code

## Files Modified

- `app/auth/AuthForm.tsx` - Added `emailRedirectTo` with `?verified=true` parameter
- `app/page.tsx` - Added `EmailVerificationNotification` component
- `components/home/EmailVerificationNotification.tsx` - New component for handling verification notification

## Troubleshooting

### Issue: No email received
**Solution:**
- Check your Supabase email settings
- Verify email provider is configured
- Check spam/junk folder
- For development, use Supabase Inbucket (if enabled)

### Issue: Notification doesn't appear
**Solution:**
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly in `.env.local`
- Check that the URL includes `?verified=true` parameter
- Clear browser cache and try again
- Check browser console for any errors

### Issue: Redirect doesn't work
**Solution:**
- Verify that Next.js router is properly initialized
- Check that no middleware is blocking the redirect
- Ensure `/auth` route is accessible

## Security Notes

1. ✅ Email verification is required before login
2. ✅ Unverified users cannot access protected routes
3. ✅ Verification link is single-use (handled by Supabase)
4. ✅ Expired links are handled by Supabase (default 24h expiry)

## Next Steps After Verification

Once email is verified:
1. User logs in with their credentials
2. Profile is loaded from `profiles` table
3. User role determines which dashboard they see
4. User can start making donations
5. All donations are tracked in their dashboard
