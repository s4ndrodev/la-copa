'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { configured, supabase } from '@/lib/supabase';

export default function AuthBar() {
  const { session, isEditor, ready } = useAuth();
  if (!configured || !ready) return null;

  if (!session) {
    return <Link href="/login" className="auth-link">Entrar</Link>;
  }

  return (
    <div className="auth-bar">
      {isEditor && <Link href="/admin" className="auth-link">Panel</Link>}
      <button className="auth-link" onClick={() => supabase.auth.signOut()}>Salir</button>
    </div>
  );
}
