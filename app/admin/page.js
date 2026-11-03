'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminGuard from '@/components/AdminGuard';
import AdminsEditor from '@/components/AdminsEditor';

export default function Admin() {
  return (
    <AdminGuard>
      <Panel />
    </AdminGuard>
  );
}

function Panel() {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('championships')
      .select('id, name, teams(id), matches(id, status)')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setLista(data);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crear(e) {
    e.preventDefault();
    const nombre = name.trim();
    if (!nombre) return;
    const { error } = await supabase.from('championships').insert({ name: nombre });
    if (error) return setError(error.message);
    setName('');
    setError('');
    cargar();
  }

  async function borrar(c) {
    if (!confirm(`¿Borrar "${c.name}" con todos sus equipos y partidos?`)) return;
    const { error } = await supabase.from('championships').delete().eq('id', c.id);
    if (error) return setError(error.message);
    cargar();
  }

  return (
    <>
      <h1 className="titulo grande">Panel de administración</h1>

      <form className="fila" onSubmit={crear}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del nuevo campeonato"
          aria-label="Nombre del nuevo campeonato"
          maxLength={60}
        />
        <button className="btn" type="submit">Crear campeonato</button>
      </form>

      {error && <p className="banner" role="alert">{error}</p>}

      {lista === null ? (
        <p className="vacio">Cargando…</p>
      ) : lista.length === 0 ? (
        <p className="vacio">Todavía no hay campeonatos. Crea el primero arriba.</p>
      ) : (
        <ul className="lista">
          {lista.map((c) => {
            const jugados = c.matches.filter((m) => m.status === 'finished').length;
            return (
              <li key={c.id} className="item">
                <Link href={`/admin/campeonato/${c.id}`} className="item-link">
                  <strong>{c.name}</strong>
                  <span>{c.teams.length} equipos · {jugados}/{c.matches.length} partidos jugados</span>
                </Link>
                <Link href={`/campeonato/${c.id}`} className="btn-texto">Vista pública</Link>
                <button className="btn-texto" onClick={() => borrar(c)}>Borrar</button>
              </li>
            );
          })}
        </ul>
      )}
      <AdminsEditor />
    </>
  );
}
