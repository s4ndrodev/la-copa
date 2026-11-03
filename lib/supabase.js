import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const configured = Boolean(url && key);

// Valores de relleno para que el build no falle si faltan las variables.
export const supabase = createClient(url || 'http://localhost', key || 'sin-configurar');
