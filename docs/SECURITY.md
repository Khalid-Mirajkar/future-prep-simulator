# Security Documentation

## Database Security Model

This application uses Supabase with Row Level Security (RLS) as the primary security mechanism for protecting user data.

### Critical Security Requirements

⚠️ **RLS is MANDATORY for security** - The application's security model depends on RLS being enabled on all user data tables.

### How It Works

1. **Client-Supplied User IDs**: The application code supplies `user_id` values when inserting records into the database (e.g., in `useCVAnalysis.ts`, `useMCQTest.ts`, `StartPractice.tsx`).

2. **RLS Policy Protection**: All database operations are protected by RLS policies that use `auth.uid()` to verify the authenticated user matches the operation being performed.

3. **Security Layers**:
   - **Layer 1**: Supabase client automatically includes JWT token with auth context
   - **Layer 2**: RLS policies validate `auth.uid()` matches the row's `user_id`
   - **Layer 3**: Database enforces policies regardless of client-supplied values

### Protected Tables

All the following tables have RLS enabled with owner-scoped policies:

- `profiles` - User profile information
- `cv_analyses` - CV analysis results
- `interview_results` - Interview scores and data
- `mcq_test_results` - MCQ test results
- `insights` - Platform insights and content

### RLS Policy Pattern

All policies follow this secure pattern:

```sql
-- SELECT policy
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can create their own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update their own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

### Monitoring Requirements

To maintain security:

1. **Never disable RLS** on user data tables
2. **Regular audits**: Verify all policies use `auth.uid()` correctly
3. **Deployment validation**: Check RLS is enabled before deploying migrations
4. **Monitoring**: Set up alerts if RLS is disabled on any table

### Database Migrations

When creating new tables with user data:

```sql
-- 1. Create table
CREATE TABLE public.new_table (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  -- other columns...
);

-- 2. Enable RLS (CRITICAL)
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. Add policies using auth.uid()
CREATE POLICY "Users can view their own records"
ON public.new_table FOR SELECT
USING (auth.uid() = user_id);

-- Security Note: This pattern is mandatory for all user data tables
-- The client supplies user_id, but RLS policies using auth.uid() provide the actual security
```

### Why This Pattern Is Safe

Even though the client code supplies `user_id` values:

- **Users cannot forge JWTs**: Authentication tokens are cryptographically signed
- **RLS validates the JWT**: Policies check `auth.uid()` from the verified token
- **Client values are ignored**: If a user tries to supply a different `user_id`, the RLS policy using `auth.uid()` will reject the operation

### If RLS Were Disabled

⚠️ **Without RLS, this would be vulnerable**: Users could insert records with any `user_id`, leading to immediate privilege escalation. RLS is the critical security control that makes this architecture safe.

### Verification Checklist

Before deploying database changes:

- [ ] RLS enabled on all new user data tables
- [ ] All policies use `auth.uid()` (not client-supplied values)
- [ ] Policies cover all operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] No policies with overly permissive conditions (e.g., `USING (true)`)
- [ ] Test with multiple user accounts to verify isolation

## Edge Functions Security

### Authentication

Most edge functions require authentication by default. To make a function public:

```toml
[functions.function-name]
verify_jwt = false
```

### Input Validation

All edge functions validate inputs with these limits:

- Company names: max 100 characters
- Job titles: max 100 characters
- CV text: max 50KB
- Avatar/voice text: max 500-1000 characters
- All inputs validated for type and format

### Secrets Management

API keys are stored in Supabase secrets, never in code:

- `OPENAI_API_KEY` - OpenAI API access
- `DID_API_KEY` - D-ID API access
- `N8N_WEBHOOK_URL` - N8N webhook endpoint

## Testing

Test security with:

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Should return no rows for user data tables
```
