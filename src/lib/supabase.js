import { createClient } from '@supabase/supabase-js';

// Pastikan environment variable ini ada di .env atau Vercel Project Settings
// 1. Cek Service Role Key (Khusus Server Side untuk Bypass RLS)
// Ini agar kita bisa upload file tanpa harus setting Policy "INSERT" yang rumit di Supabase
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 2. Cek Anon Key (Public)
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 3. Prioritaskan Service Role Key jika ada (hanya aman di server-side)
const supabaseKey = serviceRoleKey || anonKey;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl || !supabaseKey) {
    if (typeof window === 'undefined') {
        console.warn('Supabase URL atau Key belum diset. Fitur upload storage tidak akan berfungsi.');
    }
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');





























































































































