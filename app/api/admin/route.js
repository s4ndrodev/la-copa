import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY; // solo servidor, nunca NEXT_PUBLIC_

const opciones = { auth: { persistSession: false, autoRefreshToken: false } };
const error = (mensaje, status) => NextResponse.json({ error: mensaje }, { status });

// Cliente con permisos totales: solo se usa aquí, después de comprobar que quien llama es admin.
const admin = () => createClient(URL_SB, SERVICE, opciones);

// Devuelve el usuario si el token es válido y su correo está en la tabla editors.
async function verificar(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const cliente = createClient(URL_SB, ANON, {
    ...opciones,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error: err } = await cliente.auth.getUser(token);
  if (err || !data?.user) return null;

  const { data: esEditor } = await cliente.rpc('is_editor');
  return esEditor === true ? data.user : null;
}

function comprobarConfig() {
  if (!URL_SB || !ANON) return 'Faltan las variables de Supabase.';
  if (!SERVICE) return 'Falta la variable SUPABASE_SERVICE_ROLE_KEY en el servidor.';
  return null;
}

// Lista de administradores
export async function GET(request) {
  const falta = comprobarConfig();
  if (falta) return error(falta, 500);
  const user = await verificar(request);
  if (!user) return error('No autorizado.', 403);

  const { data, error: err } = await admin().from('editors').select('email').order('email');
  if (err) return error(err.message, 500);
  return NextResponse.json({ admins: data.map((e) => e.email), yo: user.email });
}

// Añade un administrador: crea su cuenta (o reutiliza la existente) y lo autoriza en editors
export async function POST(request) {
  const falta = comprobarConfig();
  if (falta) return error(falta, 500);
  const user = await verificar(request);
  if (!user) return error('No autorizado.', 403);

  const cuerpo = await request.json().catch(() => ({}));
  const email = String(cuerpo.email || '').trim().toLowerCase();
  const password = String(cuerpo.password || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error('Correo no válido.', 400);
  if (password.length < 8) return error('La contraseña debe tener al menos 8 caracteres.', 400);

  const sb = admin();
  let creado = true;

  const { data: nuevo, error: errCrear } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (errCrear) {
    const yaExiste = errCrear.code === 'email_exists' || /already|registered/i.test(errCrear.message);
    if (!yaExiste) return error(errCrear.message, 400);
    creado = false; // la cuenta ya existía: solo se autoriza, su contraseña no cambia
  }

  const { error: errEditor } = await sb.from('editors').upsert({ email });
  if (errEditor) {
    if (creado && nuevo?.user) await sb.auth.admin.deleteUser(nuevo.user.id); // deshace la cuenta creada
    return error(errEditor.message, 500);
  }

  return NextResponse.json({ ok: true, creado });
}

// Quita el permiso de administrador (la cuenta sigue existiendo, pero solo con acceso de lectura)
export async function DELETE(request) {
  const falta = comprobarConfig();
  if (falta) return error(falta, 500);
  const user = await verificar(request);
  if (!user) return error('No autorizado.', 403);

  const cuerpo = await request.json().catch(() => ({}));
  const email = String(cuerpo.email || '');
  if (!email) return error('Falta el correo.', 400);
  if (email.toLowerCase() === (user.email || '').toLowerCase()) {
    return error('No puedes quitarte el acceso a ti mismo.', 400);
  }

  const { error: err } = await admin().from('editors').delete().eq('email', email);
  if (err) return error(err.message, 500);
  return NextResponse.json({ ok: true });
}
