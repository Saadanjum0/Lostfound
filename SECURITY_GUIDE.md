# Lost & Found Security Guide

## 🔒 Current Security Status

**⚠️ CRITICAL: Your database currently has NO Row Level Security (RLS) policies!**

Your `Schemacurrent.sql` shows tables without RLS enabled. This means:
- **Anyone with your anon key can read/write ALL data**
- **Your API key is exposed in the browser (normal for Supabase)**
- **Security relies entirely on RLS policies (which you don't have)**

## 🚨 Immediate Actions Required

### 1. Enable RLS on All Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
```

### 2. Create Essential RLS Policies

```sql
-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Items: Public read, authenticated users can create, owners can edit
CREATE POLICY "Anyone can view approved items" ON public.items
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create items" ON public.items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all items" ON public.items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Messages: Users can only see messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Conversations: Users can only see conversations they participate in
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Conversation Participants: Users can see participants in their conversations
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add themselves to conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports: Users can create reports, admins can view all
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Other tables: Add similar policies as needed
```

## 🔐 Understanding Supabase Security

### Why the Anon Key is "Safe" to Expose

1. **It's designed to be public** - Supabase anon keys are meant to be in browser code
2. **RLS is the security layer** - The key only works with proper RLS policies
3. **No RLS = No security** - Without RLS, anyone can access everything

### What RLS Policies Do

- **Filter data at the database level** before it reaches your app
- **Use `auth.uid()`** to identify the current user
- **Block unauthorized access** even if someone has your anon key

### Current Risk Level: **🔴 CRITICAL**

Without RLS policies:
- Anyone can read all user profiles, messages, items
- Anyone can create/modify/delete data
- Your app is essentially a public database

## 🛡️ Additional Security Measures

### 1. Environment Variables
```bash
# Never commit these to git
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Supabase Auth Settings
- **Site URL**: Set to your production domain
- **Redirect URLs**: Only allow your domains
- **Email confirmations**: Enable for production

### 3. Rate Limiting
Consider adding rate limiting for:
- Message sending
- Item creation
- Report submissions

### 4. Input Validation
Your forms should validate:
- Email formats
- Phone numbers
- File uploads (size, type)
- Text length limits

## 🚀 Deployment Security Checklist

- [ ] RLS enabled on all tables
- [ ] RLS policies created and tested
- [ ] Environment variables set correctly
- [ ] Supabase auth URLs configured
- [ ] File upload restrictions in place
- [ ] Admin role properly protected
- [ ] Test with different user accounts

## 📞 Emergency Response

If you suspect a security breach:

1. **Immediately disable the anon key** in Supabase Dashboard → Settings → API
2. **Generate a new anon key**
3. **Update environment variables** on all platforms
4. **Review audit logs** in Supabase Dashboard
5. **Check for unauthorized data changes**

## 🔄 Next Steps

1. **Run the RLS SQL commands above** in your Supabase SQL Editor
2. **Test your app** to ensure everything still works
3. **Deploy with proper environment variables**
4. **Monitor Supabase logs** for any errors

**Remember: Security is not optional - it's essential for any production app!**
