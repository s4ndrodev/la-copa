'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { configured, supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setCargando(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setCargando(false);
    if (error) {
      setError('Correo o contraseña incorrectos.');
      return;
    }
    router.push('/admin');
  }

  if (!configured) {
    return <p className="banner">Faltan las variables de Supabase. Revisa .env.local.</p>;
  }

  return (
    <form className="login" onSubmit={entrar}>
      <h1 className="titulo">Acceso del administrador</h1>
      <p className="nota">Todos pueden ver los campeonatos. Solo el correo autorizado puede editar.</p>
      <label>
        Correo
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label>
        Contraseña
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={cargando}>
        {cargando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
