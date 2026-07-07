-- Run this in your Supabase SQL Editor to support blocking users

ALTER TABLE public.donor 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
