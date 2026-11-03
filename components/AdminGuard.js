'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { configured } from '@/lib/supabase';

// Solo deja pasar a los correos autorizados como editores.
export default function AdminGuard({ children }) {
  const { session, isEditor, ready } = useAuth();

  if (!configured) {
    return <p className="banner">Faltan las variables de Supabase. Revisa .env.local.</p>;
  }
  if (!ready) return <p className="vacio">Cargando…</p>;
  if (!session) {
    return (
      <div className="vacio">
        <p>Esta sección es solo para administradores.</p>
        <Link href="/login" className="btn">Entrar</Link>
      </div>
    );
  }
  if (!isEditor) {
    return (
      <div className="vacio">
        <p>Tu cuenta no tiene permiso de administrador.</p>
        <Link href="/campeonatos" className="btn">Ver campeonatos</Link>
      </div>
    );
  }
  return children;
}
