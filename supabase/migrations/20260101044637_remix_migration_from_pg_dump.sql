CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: test_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.test_category AS ENUM (
    'math',
    'science',
    'history',
    'english',
    'geography',
    'languages',
    'computer_science',
    'arts',
    'music',
    'sports',
    'other'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', ''));
  RETURN new;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ai_master_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_master_chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title text DEFAULT 'New Chat'::text
);


--
-- Name: daily_ai_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_ai_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid NOT NULL,
    generated_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text DEFAULT ''::text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    test_id uuid NOT NULL,
    rating integer NOT NULL,
    feedback text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: saved_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    test_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: test_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    test_id uuid NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    total_questions integer DEFAULT 0 NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    description text,
    questions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category public.test_category DEFAULT 'other'::public.test_category NOT NULL,
    timer_seconds integer,
    class_standard integer,
    is_ai_generated boolean DEFAULT false,
    topic text,
    subject text,
    difficulty text,
    CONSTRAINT tests_class_standard_check CHECK (((class_standard >= 6) AND (class_standard <= 12))),
    CONSTRAINT tests_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])))
);


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    sound_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_master_chats ai_master_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_master_chats
    ADD CONSTRAINT ai_master_chats_pkey PRIMARY KEY (id);


--
-- Name: daily_ai_tests daily_ai_tests_generated_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_ai_tests
    ADD CONSTRAINT daily_ai_tests_generated_date_key UNIQUE (generated_date);


--
-- Name: daily_ai_tests daily_ai_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_ai_tests
    ADD CONSTRAINT daily_ai_tests_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_user_id_test_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_test_id_key UNIQUE (user_id, test_id);


--
-- Name: saved_tests saved_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_tests
    ADD CONSTRAINT saved_tests_pkey PRIMARY KEY (id);


--
-- Name: saved_tests saved_tests_user_id_test_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_tests
    ADD CONSTRAINT saved_tests_user_id_test_id_key UNIQUE (user_id, test_id);


--
-- Name: test_attempts test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);


--
-- Name: idx_ai_master_chats_user_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_master_chats_user_updated ON public.ai_master_chats USING btree (user_id, updated_at DESC);


--
-- Name: idx_daily_ai_tests_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_ai_tests_date ON public.daily_ai_tests USING btree (generated_date DESC);


--
-- Name: ai_master_chats update_ai_master_chats_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_master_chats_updated_at BEFORE UPDATE ON public.ai_master_chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tests update_tests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_settings update_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: daily_ai_tests daily_ai_tests_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_ai_tests
    ADD CONSTRAINT daily_ai_tests_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_tests saved_tests_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_tests
    ADD CONSTRAINT saved_tests_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: saved_tests saved_tests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_tests
    ADD CONSTRAINT saved_tests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_ai_tests Daily AI tests are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Daily AI tests are viewable by everyone" ON public.daily_ai_tests FOR SELECT USING (true);


--
-- Name: profiles Profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: ratings Ratings are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT USING (true);


--
-- Name: test_attempts Test owners can view attempts on their tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Test owners can view attempts on their tests" ON public.test_attempts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.tests
  WHERE ((tests.id = test_attempts.test_id) AND (tests.user_id = auth.uid())))));


--
-- Name: tests Tests are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tests are viewable by everyone" ON public.tests FOR SELECT USING (true);


--
-- Name: test_attempts Users can create attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create attempts" ON public.test_attempts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_master_chats Users can create their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own chat history" ON public.ai_master_chats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_settings Users can create their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: tests Users can create their own tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own tests" ON public.tests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_master_chats Users can delete their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own chat history" ON public.ai_master_chats FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: tests Users can delete their own tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own tests" ON public.tests FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ratings Users can rate tests they don't own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can rate tests they don't own" ON public.ratings FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (NOT (EXISTS ( SELECT 1
   FROM public.tests
  WHERE ((tests.id = ratings.test_id) AND (tests.user_id = auth.uid())))))));


--
-- Name: saved_tests Users can save tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save tests" ON public.saved_tests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_tests Users can unsave tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unsave tests" ON public.saved_tests FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ai_master_chats Users can update their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own chat history" ON public.ai_master_chats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ratings Users can update their own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own ratings" ON public.ratings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_settings Users can update their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: tests Users can update their own tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own tests" ON public.tests FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: test_attempts Users can view their own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own attempts" ON public.test_attempts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_master_chats Users can view their own chat history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own chat history" ON public.ai_master_chats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_settings Users can view their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_tests Users can view their saved tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their saved tests" ON public.saved_tests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_master_chats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_master_chats ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_ai_tests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_ai_tests ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_tests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_tests ENABLE ROW LEVEL SECURITY;

--
-- Name: test_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: tests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;