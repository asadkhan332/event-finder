# Supabase Auth Manager

Handle user signup, login, and session management with Supabase.

## Trigger Phrases

- "supabase auth management"
- "manage supabase authentication"
- "handle user auth with supabase"
- "/supabase-auth"

## Instructions

Manage Supabase authentication including user signup, login, and session handling.

### Context Gathering

1. Identify the Supabase project URL and API key
2. Determine which auth operation is needed (signup, login, session management)
3. Collect required parameters (email, password, provider, etc.)

### Execution Steps

1. Import Supabase client and initialize connection
2. For signup:
   - Validate email and password inputs
   - Call Supabase auth.signUp() method
   - Handle response and potential errors
3. For login:
   - Validate email and password inputs
   - Call Supabase auth.signInWithPassword() method
   - Handle response and potential errors
4. For session management:
   - Use Supabase auth.getSession() to get current session
   - Use Supabase auth.signOut() to end session
   - Handle token refresh if needed
5. For OAuth flows:
   - Call Supabase auth.signInWithOAuth() with appropriate provider
   - Handle redirect flows appropriately
6. For password reset:
   - Call Supabase auth.resetPasswordForEmail() method
   - Handle response and potential errors

### Output Format

Provide clear feedback about the authentication operation:
- Confirm successful operations with relevant details (user ID, session info)
- Report errors with specific error messages
- Include code examples when showing implementation patterns
- Suggest next steps based on the operation outcome