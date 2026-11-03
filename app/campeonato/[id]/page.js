'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { configured } from '@/lib/supabase';
import { useCampeonato } from '@/lib/data';
import Tabla from '@/components/Tabla';
import Dias from '@/components/Dias';

const TABS = [
  { id: 'tabla', label: 'Tabla' },
  { id: 'partidos', label: 'Partidos' },
];

export default function Campeonato() {
  const { id } = useParams();
  const { estado, champ, teams, matches, events, lineups, errorCarga } = useCampeonato(id, { poll: true });
  const [tab, setTab] = useState('tabla');

  if (!configured) {
    return <p className="banner">Faltan las variables de Supabase. Revisa .env.local.</p>;
  }
  if (estado === 'cargando') return <p className="vacio">Cargando…</p>;
  if (estado !== 'ok') {
    return (
      <div className="vacio">
        <p>{errorCarga || 'No encontramos este campeonato.'}</p>
        <Link href="/campeonatos" className="btn">Ver campeonatos</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="campeonato-titulo">{champ.name}</h1>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'tab activa' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tabla' && <Tabla teams={teams} matches={matches} />}
      {tab === 'partidos' && (
        <Dias teams={teams} matches={matches} events={events} lineups={lineups} />
      )}
    </>
  );
}
