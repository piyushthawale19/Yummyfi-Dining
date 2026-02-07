# Authentication Flow Diagram

## Regular User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        REGULAR USER FLOW                         │
└─────────────────────────────────────────────────────────────────┘

    User visits homepage (/)
            │
            ▼
    Browses menu (no auth required)
            │
            ▼
    Clicks "Add to Cart"
            │
            ▼
    ┌───────────────┐
    │ Authenticated?│
    └───────┬───────┘
            │
    ┌───────┴───────┐
    │               │
   NO              YES
    │               │
    ▼               ▼
Show dialog          Add to cart
"Sign in to place"   immediately
    │               │
    ▼               │
User confirms       │
    │               │
    ▼               │
signInWithGoogle(false)
    │               │
    ▼               │
Google Sign-In      │
Popup appears       │
    │               │
    ▼               │
User signs in       │
    │               │
    ▼               │
User MUST enter     │
"Your Name"         │
(Mandatory)         │
    │               │
    ▼               │
Session marked:     │
isAdminSession=false│
    │               │
    ▼               │
Add to cart ────────┘
    │
    ▼
Continue shopping
(stays signed in)
    │
    ▼
Place order
(order linked to user)
```

---

## Admin Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN FLOW                              │
└─────────────────────────────────────────────────────────────────┘

    User visits /admin
            │
            ▼
    Admin Login Page
    "Staff Login"
            │
            ▼
    Clicks "Continue with Google"
            │
            ▼
    signInWithGoogle(true) ← Admin flag
            │
            ▼
    Google Sign-In Popup
            │
            ▼
    User signs in with Google
            │
            ▼
    ┌─────────────────────┐
    │ Email in admin list?│
    └──────────┬──────────┘
               │
    ┌──────────┴──────────┐
    │                     │
   YES                   NO
    │                     │
    ▼                     ▼
Session marked:      Sign out immediately
isAdminSession=true       │
    │                     ▼
    ▼              Show error:
Navigate to        "Not authorized
/admin/dashboard   for admin access"
    │                     │
    ▼                     ▼
Admin Dashboard    Redirect to /admin
- View orders           (login page)
- Manage products
- Analytics
    │
    ▼
Clicks "Sign Out"
    │
    ▼
signOut(true) ← Admin-only flag
    │
    ▼
┌────────────────────┐
│ isAdminSession?    │
└─────────┬──────────┘
          │
    ┌─────┴─────┐
    │           │
  TRUE        FALSE
    │           │
    ▼           ▼
Sign out    Do nothing
Firebase    (preserve user
Auth        session)
    │
    ▼
Clear admin
session flags
    │
    ▼
Redirect to /admin
```

---

## Session Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      SESSION MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         localStorage                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Regular User Session:                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ isAdminSession: "false"                                    │ │
│  │ userEmail: "customer@gmail.com"                            │ │
│  │ userName: "John Doe"                                       │ │
│  │ tableNumber: "5"                                           │ │
│  │ customerName: "John Doe" (Stored but fresh on reload)      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Admin Session:                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ isAdminSession: "true"                                     │ │
│  │ userEmail: "admin@gmail.com"                               │ │
│  │ userName: "Admin User"                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sign-Out Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                        SIGN-OUT LOGIC                            │
└─────────────────────────────────────────────────────────────────┘

signOut(adminOnly: boolean)
        │
        ▼
┌──────────────────┐
│ adminOnly=true?  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
Check       Sign out
isAdminSession  immediately
    │         │
    ▼         │
┌──────────┐  │
│ Is admin │  │
│ session? │  │
└────┬─────┘  │
     │        │
  ┌──┴──┐     │
  │     │     │
 YES   NO     │
  │     │     │
  ▼     ▼     ▼
Sign  Skip  Sign out
out   (keep  Firebase
      user   Auth
      logged │
      in)    │
  │          │
  └──────┬───┘
         │
         ▼
    Clear session
    markers
         │
         ▼
    Redirect/Refresh
```

---

## Protected Route Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROTECTED ROUTE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User navigates to /admin/dashboard
            │
            ▼
    ProtectedAdminRoute
    component executes
            │
            ▼
    ┌──────────────┐
    │ Auth loading?│
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
     YES       NO
      │         │
      ▼         ▼
   Show      Check if
   loading   user is admin
   screen        │
      │          ▼
      │    ┌──────────┐
      │    │ isAdmin? │
      │    └────┬─────┘
      │         │
      │    ┌────┴────┐
      │    │         │
      │   YES       NO
      │    │         │
      │    ▼         ▼
      │  Render   Redirect
      │  Admin    to /admin
      │  Dashboard (login page)
      │    │
      └────┘
           │
           ▼
    User sees appropriate
    page based on auth status
```

---

## Email Verification Process

```
┌─────────────────────────────────────────────────────────────────┐
│                  EMAIL VERIFICATION PROCESS                      │
└─────────────────────────────────────────────────────────────────┘

signInWithGoogle(forAdmin=true)
            │
            ▼
    User signs in with Google
            │
            ▼
    Get user email from
    Firebase Auth result
            │
            ▼
    isAdminEmail(email)
            │
            ▼
    Load admin emails from .env:
    - VITE_ADMIN_EMAIL_1
    - VITE_ADMIN_EMAIL_2
    - VITE_ADMIN_EMAIL_3
            │
            ▼
    ┌──────────────────────┐
    │ Email in admin list? │
    └──────────┬───────────┘
               │
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        ▼             ▼
    Return true   Return false
        │             │
        ▼             ▼
    Continue      Throw error
    to dashboard  "NOT_ADMIN"
        │             │
        │             ▼
        │         Sign out user
        │         immediately
        │             │
        │             ▼
        │         Show error
        │         message
        │             │
        └─────────────┘
```

---

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   SYSTEM ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌──────────────────┐                │
│  │  User Routes   │         │   Admin Routes   │                │
│  ├────────────────┤         ├──────────────────┤                │
│  │ / (Home)       │         │ /admin (Login)   │                │
│  │ /cart          │         │ /admin/dashboard │                │
│  │ /track-order   │         │   (Protected)    │                │
│  └────────┬───────┘         └────────┬─────────┘                │
│           │                          │                           │
│           └──────────┬───────────────┘                           │
│                      │                                           │
│              ┌───────▼────────┐                                  │
│              │  AuthContext   │                                  │
│              ├────────────────┤                                  │
│              │ - user         │                                  │
│              │ - isAdmin      │                                  │
│              │ - signIn()     │                                  │
│              │ - signOut()    │                                  │
│              └───────┬────────┘                                  │
│                      │                                           │
└──────────────────────┼───────────────────────────────────────────┘
                       │
                       │ Firebase SDK
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                    Firebase Services                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Firebase Auth│  │  Firestore   │  │  Cloudinary  │          │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤          │
│  │ Google OAuth │  │ Products     │  │ Image CDN    │          │
│  │ User sessions│  │ Orders       │  │ Upload API   │          │
│  │ Email verify │  │ Security     │  │ Transforms   │          │
│  └──────────────┘  │ Rules        │  └──────────────┘          │
│                    └──────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Decision Points

### When to Require Authentication?

```
Action                    | Authentication Required | Type
─────────────────────────┼────────────────────────┼──────────
Browse menu              | ❌ No                   | N/A
View product details     | ❌ No                   | N/A
Add to cart              | ✅ Yes                  | User
Place order              | ✅ Yes (already authed) | User
Track order              | ✅ Yes                  | User
Access /admin            | ❌ No (login page)      | N/A
Access /admin/dashboard  | ✅ Yes                  | Admin
Manage products          | ✅ Yes                  | Admin
Update order status      | ✅ Yes                  | Admin
```

### Session Persistence

```
Scenario                          | Session Persists?
─────────────────────────────────┼──────────────────
User adds to cart                 | ✅ Yes
User closes browser               | ✅ Yes (localStorage)
User refreshes page               | ✅ Yes
Admin signs out                   | ❌ No (admin only)
User signs out                    | ❌ No
Admin signs out (user has cart)   | ✅ Yes (user session kept)
```

---

This diagram provides a visual representation of the authentication flows implemented in the application.
