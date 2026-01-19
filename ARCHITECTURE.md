# System Architecture

This document provides a detailed overview of the **Sahaay** NGO Registration and Donation Management System architecture.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Landing     │  │  Auth Page   │  │  Dashboard   │         │
│  │  Page (/)    │  │  (/auth)     │  │  Pages       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NEXT.JS 16 APP ROUTER                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     MIDDLEWARE LAYER                     │  │
│  │  • Session Management (Supabase SSR)                     │  │
│  │  • Route Protection (Auth Check)                         │  │
│  │  • Role-Based Redirects                                  │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │              SERVER COMPONENTS (RSC)                     │  │
│  │  • app/page.tsx (Landing)                                │  │
│  │  • app/dashboard/page.tsx (User Dashboard)               │  │
│  │  • app/admin/page.tsx (Admin Dashboard)                  │  │
│  │  • app/superadmin/page.tsx (Super Admin)                 │  │
│  │                                                           │  │
│  │  Benefits:                                                │  │
│  │  ✓ Direct database access (no API needed)                │  │
│  │  ✓ Secure (server-only code)                             │  │
│  │  ✓ Better SEO                                             │  │
│  │  ✓ Faster initial load                                    │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │              CLIENT COMPONENTS                           │  │
│  │  • AuthForm.tsx (Login/Signup)                           │  │
│  │  • DonateForm.tsx (Payment)                              │  │
│  │  • RegistrationManagementClient.tsx (Filters)            │  │
│  │  • DonationManagementClient.tsx (Filters)                │  │
│  │                                                           │  │
│  │  Benefits:                                                │  │
│  │  ✓ Interactive UI (useState, useEffect)                  │  │
│  │  ✓ Real-time updates                                      │  │
│  │  ✓ Form handling                                          │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │                   API ROUTES                             │  │
│  │  • POST /api/payu-initiate (Payment Init)                │  │
│  │  • POST /api/payment-callback (PayU Callback)            │  │
│  │  • GET  /api/payment-callback (Cancellation)             │  │
│  │  • POST /api/update-user-role (Role Management)          │  │
│  └────────────────┬─────────────────────────────────────────┘  │
└────────────────────┼─────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│   SUPABASE    │         │    PAYU      │
│  (PostgreSQL) │         │   PAYMENT    │
│               │         │   GATEWAY    │
│ • Auth        │         │              │
│ • Database    │         │ • Test Mode  │
│ • RLS         │         │ • Callbacks  │
└───────────────┘         └──────────────┘
```

---

## Technology Stack

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |

**Why Next.js 16?**
- ✅ Server Components for better performance
- ✅ Built-in API routes
- ✅ Middleware for auth
- ✅ Optimized builds with Turbopack

### Backend Layer

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | Relational database (via Supabase) |
| **Supabase Auth** | User authentication |
| **Row Level Security** | Database-level authorization |

**Why Supabase?**
- ✅ Built-in auth system
- ✅ Real-time capabilities (future use)
- ✅ Row Level Security (RLS) for data protection
- ✅ Auto-generated REST API
- ✅ Free tier available

### Payment Integration

| Technology | Purpose |
|------------|---------|
| **PayU** | Payment gateway (Test mode) |
| **crypto (Node.js)** | SHA-512 hash generation |

---

## Component Architecture

### 1. Server Components (No `'use client'`)

**Purpose**: Fetch data securely on the server, reduce client-side JavaScript.

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function Dashboard() {
  const supabase = await createClient(); // Server-side client
  
  // Direct database query (secure, no API needed)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // Pass data to client components as props
  return <UserProfileCard profile={profile} />;
}
```

**Benefits:**
- ✅ No API routes needed for data fetching
- ✅ Secure (server-only code, env vars accessible)
- ✅ Better SEO (fully rendered HTML)
- ✅ Smaller JavaScript bundle

**Files:**
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/admin/page.tsx`
- `app/superadmin/page.tsx`
- `app/auth/page.tsx`

---

### 2. Client Components (`'use client'`)

**Purpose**: Handle user interactions, form state, browser APIs.

```typescript
// app/donate/page.tsx (Client Component)
'use client';

export default function DonatePage() {
  const [amount, setAmount] = useState('');
  
  const handleSubmit = async (e) => {
    // Handle form submission
    // Call API route
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Benefits:**
- ✅ Interactive UI (useState, useEffect)
- ✅ Form handling
- ✅ Browser APIs (localStorage, window)
- ✅ Real-time updates

**Files:**
- `app/auth/AuthForm.tsx`
- `app/donate/page.tsx`
- `components/admin/RegistrationManagementClient.tsx`
- `components/admin/DonationManagementClient.tsx`
- `components/superadmin/UserManagementClient.tsx`
- `components/LogoutButton.tsx`

---

### 3. Hybrid Approach

**Pattern**: Server Component fetches data → passes to Client Component

```typescript
// app/admin/page.tsx (Server Component)
export default async function AdminPage() {
  const supabase = await createClient();
  
  // Fetch data on server
  const { data: registrations } = await supabase
    .from('profiles')
    .select('*');
  
  // Pass to client component
  return <RegistrationManagementClient registrations={registrations} />;
}
```

```typescript
// components/admin/RegistrationManagementClient.tsx (Client Component)
'use client';

export default function RegistrationManagementClient({ registrations }) {
  const [filtered, setFiltered] = useState(registrations);
  
  // Client-side filtering, search, etc.
  return <div>...</div>;
}
```

**Benefits:**
- ✅ Server: Secure data fetching
- ✅ Client: Interactive filtering/search
- ✅ Best of both worlds

---

## Data Flow

### 1. User Registration Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User fills signup form
       │
       ▼
┌─────────────────┐
│  AuthForm.tsx   │ (Client Component)
│  'use client'   │
└──────┬──────────┘
       │
       │ 2. Call supabase.auth.signUp()
       │
       ▼
┌─────────────────┐
│ Supabase Auth   │
└──────┬──────────┘
       │
       │ 3. Create user in auth.users
       │
       ▼
┌─────────────────┐
│ Database Trigger│ (handle_new_user)
└──────┬──────────┘
       │
       │ 4. Auto-create profile in profiles table
       │    (id, name, email, role='user')
       │
       ▼
┌─────────────────┐
│ profiles table  │
└──────┬──────────┘
       │
       │ 5. Session created
       │
       ▼
┌─────────────────┐
│ Redirect to     │
│ /dashboard      │
└─────────────────┘
```

---

### 2. Donation Flow (Detailed)

```
┌─────────────┐
│ User clicks │
│ "Donate"    │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ /donate page loads   │ (Client Component)
└──────┬───────────────┘
       │
       │ 1. User enters amount
       │
       ▼
┌──────────────────────┐
│ Submit form          │
└──────┬───────────────┘
       │
       │ 2. Create donation record
       │
       ▼
┌──────────────────────┐
│ INSERT INTO          │
│ donations            │
│ (user_id, amount,    │
│  status='pending')   │
└──────┬───────────────┘
       │
       │ 3. Call API route
       │
       ▼
┌──────────────────────┐
│ POST /api/payu-      │
│ initiate             │
└──────┬───────────────┘
       │
       │ 4. Generate hash
       │    hash = SHA512(key|txnid|amount|...|salt)
       │
       ▼
┌──────────────────────┐
│ Return PayU params   │
│ {payuUrl, payuParams}│
└──────┬───────────────┘
       │
       │ 5. Redirect to PayU
       │
       ▼
┌──────────────────────┐
│ PayU Payment Page    │ (External)
│ User enters card     │
│ details, OTP         │
└──────┬───────────────┘
       │
       │ 6. Payment processed
       │
       ▼
    ┌──────┐
    │Status│
    └──┬───┘
       │
       ├─── Success ────► POST /api/payment-callback
       │                  • Verify hash
       │                  • UPDATE donations
       │                    SET status='success',
       │                        transaction_id='mihpayid'
       │                  • Redirect to /dashboard?payment=success
       │
       ├─── Failed ─────► POST /api/payment-callback
       │                  • UPDATE donations SET status='failed'
       │                  • Redirect to /dashboard?payment=failed
       │
       └─── Cancel ─────► GET /api/payment-callback
                          • UPDATE donations SET status='failed'
                          • Redirect to /dashboard?payment=failed
```

---

### 3. Admin Data Fetching Flow

```
┌─────────────┐
│ Admin logs  │
│ in          │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Middleware checks    │
│ role = 'admin'       │
└──────┬───────────────┘
       │
       │ ✅ Authorized
       │
       ▼
┌──────────────────────┐
│ /admin page.tsx      │ (Server Component)
│ loads                │
└──────┬───────────────┘
       │
       │ Fetch data (server-side)
       │
       ├──► SELECT * FROM profiles
       │    (RLS allows: admin can view all)
       │
       ├──► SELECT * FROM donations
       │    JOIN profiles ON user_id
       │    (RLS allows: admin can view all)
       │
       │ Calculate stats
       │
       ▼
┌──────────────────────┐
│ Render dashboard     │
│ with data            │
└──────┬───────────────┘
       │
       │ Pass data to client components
       │
       ▼
┌──────────────────────┐
│ Client components    │
│ handle filtering,    │
│ search, export       │
└──────────────────────┘
```

---

## Security Architecture

### 1. Authentication Layer

**Supabase Auth** handles:
- User registration (email/password)
- Login/logout
- Session management (HTTP-only cookies)
- Password reset (future)

**Session Storage:**
- Cookies (HTTP-only, secure)
- Managed by `@supabase/ssr`

---

### 2. Authorization Layer

#### Middleware-Level Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Check if route is protected
  const protectedRoutes = ['/dashboard', '/admin', '/superadmin'];
  
  // 2. Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/auth');
  
  // 3. Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // 4. Role-based redirect
  if (pathname === '/admin' && profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  // 5. Allow access
  return NextResponse.next();
}
```

#### Database-Level Protection (RLS)

**Row Level Security Policies:**

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);
```

**Benefits:**
- ✅ Defense in depth (multiple layers)
- ✅ Database enforces rules (even if app has bugs)
- ✅ Automatic filtering (no manual WHERE clauses)

---

### 3. Payment Security

**Hash Verification:**

```typescript
// Generate hash for PayU request
const requestHash = SHA512(
  `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|...|${salt}`
);

// Verify hash from PayU response
const responseHash = SHA512(
  `${salt}|${status}|...|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
);

if (receivedHash !== calculatedHash) {
  throw new Error('Invalid hash - possible tampering');
}
```

**Benefits:**
- ✅ Prevents payment tampering
- ✅ Verifies request came from PayU
- ✅ Ensures data integrity

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────┐
│    auth.users       │ (Supabase managed)
│  ─────────────────  │
│  id (PK)            │
│  email              │
│  encrypted_password │
│  created_at         │
└──────────┬──────────┘
           │
           │ 1:1 (Foreign Key)
           │
           ▼
┌─────────────────────┐
│     profiles        │
│  ─────────────────  │
│  id (PK, FK)        │───┐
│  name               │   │
│  email              │   │
│  phone_number       │   │
│  role               │   │
│  created_at         │   │
└─────────────────────┘   │
                          │
                          │ 1:N
                          │
                          ▼
                ┌─────────────────────┐
                │     donations       │
                │  ─────────────────  │
                │  id (PK)            │
                │  user_id (FK)       │
                │  amount             │
                │  status             │
                │  timestamp          │
                │  transaction_id     │
                └─────────────────────┘
```

### Table Details

#### profiles
- **Purpose**: Extends Supabase auth.users with custom fields
- **Key Constraint**: `id` references `auth.users(id)` ON DELETE CASCADE
- **Check Constraint**: `role IN ('user', 'admin', 'superadmin')`
- **Index**: `idx_profiles_role` on `role` column

#### donations
- **Purpose**: Tracks all donation attempts
- **Foreign Key**: `user_id` references `profiles(id)` ON DELETE CASCADE
- **Check Constraint**: `status IN ('pending', 'success', 'failed')`
- **Indexes**: 
  - `idx_donations_user_id` on `user_id`
  - `idx_donations_status` on `status`

---

## API Design

### RESTful Endpoints

| Method | Endpoint | Purpose | Auth Required | Role Required |
|--------|----------|---------|---------------|---------------|
| POST | `/api/payu-initiate` | Initiate payment | ✅ Yes | User |
| POST | `/api/payment-callback` | PayU success callback | ❌ No | - |
| GET | `/api/payment-callback` | PayU cancel callback | ❌ No | - |
| POST | `/api/update-user-role` | Change user role | ✅ Yes | Superadmin |

### API Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Deployment Architecture

### Recommended Stack

```
┌─────────────────────────────────────────────┐
│              VERCEL (Frontend)              │
│  • Next.js hosting                          │
│  • Automatic deployments from Git           │
│  • Edge functions for API routes            │
│  • Environment variables management         │
└────────────────┬────────────────────────────┘
                 │
                 │ HTTPS
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌───────────┐         ┌──────────────┐
│ SUPABASE  │         │    PAYU      │
│ (Backend) │         │  (Payment)   │
│           │         │              │
│ • Free    │         │ • Test/Prod  │
│   tier    │         │              │
└───────────┘         └──────────────┘
```

### Environment Configuration

**Development:**
- `npm run dev` (localhost:3000)
- Test PayU credentials
- Supabase development project

**Production:**
- Vercel deployment
- Production PayU credentials
- Supabase production project
- Environment variables in Vercel dashboard

---

## Performance Considerations

### 1. Server Components
- ✅ Reduced client-side JavaScript
- ✅ Faster initial page load
- ✅ Better SEO

### 2. Database Indexing
- ✅ Indexes on frequently queried columns
- ✅ Foreign key indexes for joins

### 3. Caching Strategy
- Next.js automatic caching for static pages
- Dynamic routes marked with `export const dynamic = 'force-dynamic'`

### 4. Code Splitting
- Automatic with Next.js App Router
- Client components loaded only when needed

---

## Scalability

### Current Capacity
- **Users**: 10,000+ (Supabase free tier)
- **Donations**: Unlimited (database storage)
- **Concurrent Users**: 500+ (Vercel free tier)

### Future Improvements
1. **Caching**: Redis for session storage
2. **CDN**: Cloudflare for static assets
3. **Database**: Read replicas for analytics
4. **Queue**: Background job processing for exports

---

**Last Updated**: January 2026
