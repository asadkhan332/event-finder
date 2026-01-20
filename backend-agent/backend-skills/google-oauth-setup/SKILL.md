# Google OAuth 2.0 Setup

Configure and implement Google Login with OAuth 2.0 Client ID and Secret.

## Trigger Phrases

- "setup google oauth"
- "google login implementation"
- "configure google client id"
- "google oauth 2.0 setup"
- "/google-oauth"

## Instructions

Guide the user through complete Google OAuth 2.0 implementation for Google Login functionality.

### Context Gathering

1. Identify the project framework (Next.js, React, Node.js, etc.)
2. Determine if using Supabase, Firebase, or custom OAuth implementation
3. Check for existing auth configuration files
4. Identify environment variable patterns in the project

### Execution Steps

#### Step 1: Google Cloud Console Setup

Guide the user to configure Google Cloud Console:

1. **Create/Access Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note the Project ID

2. **Enable APIs**
   - Navigate to "APIs & Services" > "Library"
   - Enable "Google+ API" or "Google Identity Services"
   - Enable "Google People API" (for profile info)

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select User Type (External for public apps)
   - Fill required fields:
     - App name
     - User support email
     - Developer contact email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode

4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Add Authorized redirect URIs:
     - `http://localhost:3000/auth/callback/google`
     - `https://yourdomain.com/auth/callback/google`
   - Copy the generated **Client ID** and **Client Secret**

#### Step 2: Environment Configuration

Create or update environment variables:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# OAuth URLs
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback/google
NEXTAUTH_URL=http://localhost:3000
```

#### Step 3: Implementation by Platform

**For Supabase:**
```typescript
// Configure in Supabase Dashboard > Authentication > Providers > Google
// Add Client ID and Client Secret

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Initiate Google Login
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  return { data, error }
}
```

**For NextAuth.js:**
```typescript
// pages/api/auth/[...nextauth].ts or app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}

export default NextAuth(authOptions)
```

**For Custom Node.js Implementation:**
```typescript
import { OAuth2Client } from 'google-auth-library'

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
)

// Generate Auth URL
function getGoogleAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  })
}

// Handle Callback
async function handleGoogleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  // Get user info
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  return {
    email: payload?.email,
    name: payload?.name,
    picture: payload?.picture,
    googleId: payload?.sub,
  }
}
```

#### Step 4: Security Best Practices

1. **Never expose Client Secret in frontend code**
2. **Use HTTPS in production**
3. **Validate state parameter to prevent CSRF**
4. **Store tokens securely (httpOnly cookies or secure storage)**
5. **Implement token refresh logic for long sessions**
6. **Add proper error handling for auth failures**

### Output Format

Provide clear guidance with:
- Step-by-step configuration checklist
- Code snippets tailored to user's framework
- Environment variable template
- Security recommendations
- Troubleshooting tips for common errors:
  - `redirect_uri_mismatch`: Check authorized redirect URIs
  - `invalid_client`: Verify Client ID and Secret
  - `access_denied`: Check OAuth consent screen configuration

## Notes

- Client ID is safe for frontend, Client Secret must stay server-side
- Redirect URIs must exactly match (including trailing slashes)
- Test users must be added for apps in testing mode
- Production apps need Google verification for sensitive scopes
