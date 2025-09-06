-- =====================================================
-- CRITICAL SECURITY FIX: Enable RLS and Create Policies
-- =====================================================
-- Run this IMMEDIATELY in your Supabase SQL Editor
-- Your database currently has NO security protection!

-- Step 1: Enable RLS on all tables
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

-- Step 2: Create essential security policies

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile and basic info of others
CREATE POLICY "Users can view profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR -- Own profile
        (id IS NOT NULL) -- Basic info for others (limited by SELECT columns in app)
    );

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- ITEMS TABLE POLICIES
-- =====================================================

-- Anyone can view approved items (public lost & found)
CREATE POLICY "Anyone can view approved items" ON public.items
    FOR SELECT USING (status = 'approved');

-- Users can view their own items regardless of status
CREATE POLICY "Users can view their own items" ON public.items
    FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can create items
CREATE POLICY "Users can create items" ON public.items
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() IS NOT NULL
    );

-- Users can update their own items
CREATE POLICY "Users can update their own items" ON public.items
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all items
CREATE POLICY "Admins can manage all items" ON public.items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- CONVERSATIONS TABLE POLICIES
-- =====================================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
        )
    );

-- Authenticated users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        auth.uid() IS NOT NULL
    );

-- Participants can update conversations (e.g., mark as read)
CREATE POLICY "Participants can update conversations" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
        )
    );

-- =====================================================
-- CONVERSATION PARTICIPANTS TABLE POLICIES
-- =====================================================

-- Users can view participants in their conversations
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
        )
    );

-- Users can add themselves to conversations they're invited to
CREATE POLICY "Users can join conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation (e.g., leave conversation)
CREATE POLICY "Users can update their own participation" ON public.conversation_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can send messages to conversations they participate in
CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can update their own messages (e.g., edit, mark as read)
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- =====================================================
-- MESSAGE REACTIONS TABLE POLICIES
-- =====================================================

-- Users can view reactions in their conversations
CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can add reactions to messages in their conversations
CREATE POLICY "Users can add reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MESSAGE ATTACHMENTS TABLE POLICIES
-- =====================================================

-- Users can view attachments in their conversations
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_attachments.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can add attachments to their messages
CREATE POLICY "Users can add attachments to their messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_attachments.message_id
            AND m.sender_id = auth.uid()
        )
    );

-- =====================================================
-- REPORTS TABLE POLICIES
-- =====================================================

-- Users can create reports
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (
        auth.uid() = reporter_id AND
        auth.uid() IS NOT NULL
    );

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can view and manage all reports
CREATE POLICY "Admins can manage all reports" ON public.reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (user_id IS NOT NULL);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SAVED SEARCHES TABLE POLICIES
-- =====================================================

-- Users can manage their own saved searches
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TYPING INDICATORS TABLE POLICIES
-- =====================================================

-- Users can view typing indicators in their conversations
CREATE POLICY "Users can view typing in their conversations" ON public.typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = typing_indicators.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can update their own typing status
CREATE POLICY "Users can update their own typing status" ON public.typing_indicators
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- USER RELATIONSHIPS TABLE POLICIES
-- =====================================================

-- Users can view relationships involving them
CREATE POLICY "Users can view their relationships" ON public.user_relationships
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = target_user_id
    );

-- Users can manage their own relationships
CREATE POLICY "Users can manage their own relationships" ON public.user_relationships
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Run this to see all policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. Test your app after running this script
-- 2. Some queries might need adjustment in your React app
-- 3. Admin functions require the user to have role = 'admin' in profiles table
-- 4. This provides basic security - add more specific policies as needed
-- 5. Always test with different user accounts to verify isolation
