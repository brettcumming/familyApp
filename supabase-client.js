// supabase-client.js — include this before auth.js on every page
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SJjOnnDTroqbsFy1HNpMkQ_26Y2lx8a';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
