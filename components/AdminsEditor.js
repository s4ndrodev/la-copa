'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

async function llamar(metodo, cuerpo) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch('/api/admins', {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Error inesperado.');
  return json;
}

export default function AdminsEditor() {
  const [admins, setAdmins] = useState(null);
  const [yo, setYo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const j = await llamar('GET');
      setAdmins(j.admins);
      setYo(j.yo);
    } catch (e) {
      setError(e.message);
      setAdmins([]);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function agregar(e) {
    e.preventDefault();
    setOcupado(true);
    setError('');
    setOk('');
    try {
      const j = await llamar('POST', { email, password });
      setOk(
        j.creado
          ? 'Administrador añadido. Pásale la contraseña por un canal privado.'
          : 'Ese correo ya tenía cuenta; ahora también es administrador (su contraseña no cambió).'
      );
      setEmail('');
      setPassword('');
      await cargar();
    } catch (err) {
      setError(err.message);
    }
    setOcupado(false);
  }

  async function quitar(correo) {
    if (!confirm(`¿Quitar el acceso de administrador a ${correo}?`)) return;
    setError('');
    setOk('');
    try {
      await llamar('DELETE', { email: correo });
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="admins">
      <h2 className="titulo">Administradores</h2>
      <p className="nota">Estas personas pueden crear y editar campeonatos, partidos y resultados.</p>

      {admins === null ? (
        <p className="vacio">Cargando…</p>
      ) : (
        <ul className="lista">
          {admins.map((correo) => (
            <li key={correo} className="item">
              <span className="item-link"><strong>{correo}</strong></span>
              {correo.toLowerCase() === yo.toLowerCase() ? (
                <span className="etiqueta">Tú</span>
              ) : (
                <button className="btn-texto" onClick={() => quitar(correo)}>Quitar acceso</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className="nuevo" onSubmit={agregar}>
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
        </label>
        <label>
          Contraseña (mín. 8)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </label>
        <button className="btn" type="submit" disabled={ocupado}>
          {ocupado ? 'Añadiendo…' : 'Añadir administrador'}
        </button>
        {error && <p className="error" role="alert">{error}</p>}
        {ok && <p className="exito" role="status">{ok}</p>}
      </form>
    </section>
  );
}
