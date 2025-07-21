import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE!;

export const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
});


export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
});
