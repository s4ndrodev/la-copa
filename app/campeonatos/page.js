'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { configured, supabase } from '@/lib/supabase';

export default function Campeonatos() {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!configured) return;
    supabase
      .from('championships')
      .select('id, name, teams(id), matches(id, status)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setLista(data);
      });
  }, []);

  if (!configured) {
    return <p className="banner">Faltan las variables de Supabase. Copia .env.local.example a .env.local y rellénalo.</p>;
  }

  return (
    <section>
      <h1 className="titulo grande">Campeonatos</h1>
      {error && <p className="banner" role="alert">{error}</p>}
      {lista === null && !error ? (
        <p className="vacio">Cargando…</p>
      ) : lista && lista.length === 0 ? (
        <p className="vacio">Todavía no hay campeonatos.</p>
      ) : (
        <ul className="lista">
          {(lista || []).map((c) => {
            const jugados = c.matches.filter((m) => m.status === 'finished').length;
            return (
              <li key={c.id} className="item">
                <Link href={`/campeonato/${c.id}`} className="item-link">
                  <strong>{c.name}</strong>
                  <span>{c.teams.length} equipos · {jugados}/{c.matches.length} partidos jugados</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
