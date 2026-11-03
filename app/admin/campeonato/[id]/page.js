'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCampeonato } from '@/lib/data';
import { roundRobin } from '@/lib/utils';
import AdminGuard from '@/components/AdminGuard';
import Equipos from '@/components/Equipos';
import AdminPartidos from '@/components/AdminPartidos';

const TABS = [
  { id: 'partidos', label: 'Partidos' },
  { id: 'equipos', label: 'Equipos' },
];

export default function AdminCampeonato() {
  return (
    <AdminGuard>
      <Contenido />
    </AdminGuard>
  );
}

function Contenido() {
  const { id } = useParams();
  const { estado, champ, teams, matches, events, lineups, errorCarga, reload } = useCampeonato(id);
  const [tab, setTab] = useState(null);
  const [error, setError] = useState('');

  // Lanza el error de una consulta de Supabase
  const q = async (consulta) => {
    const { error } = await consulta;
    if (error) throw error;
  };

  // Ejecuta una acción de escritura, muestra el error si lo hay y recarga los datos
  async function act(fn) {
    setError('');
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e.code === '23505' ? 'Ese nombre ya existe en este campeonato.' : e.message);
      return false;
    } finally {
      await reload();
    }
  }

  /* ── Equipos ── */
  const addTeam = (name) =>
    act(() => q(supabase.from('teams').insert({ championship_id: id, name })));

  // Al borrar un equipo, la base borra también sus partidos, eventos y alineaciones.
  const removeTeam = (teamId) => act(() => q(supabase.from('teams').delete().eq('id', teamId)));

  /* ── Partidos ── */
  const addMatch = ({ homeId, awayId, date }) =>
    act(() =>
      q(
        supabase.from('matches').insert({
          championship_id: id,
          home_id: homeId,
          away_id: awayId,
          match_date: date || null,
        })
      )
    );

  const removeMatch = (mid) => act(() => q(supabase.from('matches').delete().eq('id', mid)));

  const setDate = (mid, date) =>
    act(() => q(supabase.from('matches').update({ match_date: date || null }).eq('id', mid)));

  const setHalfMinutes = (mid, minutos) =>
    act(() => q(supabase.from('matches').update({ half_minutes: minutos }).eq('id', mid)));

  // Resultado manual: deja el partido como finalizado
  const saveResult = (m, hg, ag) =>
    act(() =>
      q(
        supabase
          .from('matches')
          .update({ home_goals: hg, away_goals: ag, status: 'finished' })
          .eq('id', m.id)
      )
    );

  const clearResult = (m) =>
    act(() =>
      q(
        supabase
          .from('matches')
          .update({ home_goals: null, away_goals: null, status: 'scheduled', half_started_at: null })
          .eq('id', m.id)
      )
    );

  // Cambia el estado del partido: 1er tiempo, medio tiempo, 2º tiempo, final
  const cambiarEstado = (m, estadoNuevo) => {
    const patch = { status: estadoNuevo };
    if (estadoNuevo === 'first_half' || estadoNuevo === 'second_half') {
      patch.half_started_at = new Date().toISOString();
    }
    if (m.home_goals === null) {
      patch.home_goals = 0;
      patch.away_goals = 0;
    }
    return act(() => q(supabase.from('matches').update(patch).eq('id', m.id)));
  };

  // Genera el calendario todos contra todos y salta los cruces que ya existen
  async function generar(idaVuelta) {
    const clave = (h, a) => (idaVuelta ? `${h}|${a}` : [h, a].sort().join('|'));
    const existentes = new Set(matches.map((m) => clave(m.home_id, m.away_id)));

    const nuevos = roundRobin(teams.map((t) => t.id), idaVuelta)
      .filter((p) => !existentes.has(clave(p.homeId, p.awayId)))
      .map((p) => ({
        championship_id: id,
        home_id: p.homeId,
        away_id: p.awayId,
        round: p.round,
      }));

    if (nuevos.length === 0) {
      setError('Ya existen todos los partidos de este calendario.');
      return false;
    }
    return act(() => q(supabase.from('matches').insert(nuevos)));
  }

  /* ── Goles y tarjetas ── */
  // Un gol suma automáticamente al marcador
  const addEvent = (m, { teamId, type, player, minute }) =>
    act(async () => {
      await q(
        supabase.from('match_events').insert({
          championship_id: id,
          match_id: m.id,
          team_id: teamId,
          type,
          player: player || null,
          minute: minute ?? null,
        })
      );
      if (type === 'goal') {
        const esLocal = teamId === m.home_id;
        await q(
          supabase
            .from('matches')
            .update({
              home_goals: (m.home_goals ?? 0) + (esLocal ? 1 : 0),
              away_goals: (m.away_goals ?? 0) + (esLocal ? 0 : 1),
            })
            .eq('id', m.id)
        );
      }
    });

  const removeEvent = (m, ev) =>
    act(async () => {
      await q(supabase.from('match_events').delete().eq('id', ev.id));
      if (ev.type === 'goal' && m.home_goals !== null) {
        const esLocal = ev.team_id === m.home_id;
        await q(
          supabase
            .from('matches')
            .update({
              home_goals: Math.max(0, m.home_goals - (esLocal ? 1 : 0)),
              away_goals: Math.max(0, m.away_goals - (esLocal ? 0 : 1)),
            })
            .eq('id', m.id)
        );
      }
    });

  /* ── Alineaciones ── */
  const saveLineup = (m, teamId, filas) =>
    act(async () => {
      await q(supabase.from('lineups').delete().eq('match_id', m.id).eq('team_id', teamId));
      if (filas.length > 0) {
        await q(
          supabase.from('lineups').insert(
            filas.map((f, i) => ({
              championship_id: id,
              match_id: m.id,
              team_id: teamId,
              player: f.player,
              number: f.number,
              is_starter: f.isStarter,
              sort_order: i,
            }))
          )
        );
      }
    });

  const acc = {
    addMatch,
    removeMatch,
    setDate,
    setHalfMinutes,
    saveResult,
    clearResult,
    cambiarEstado,
    generar,
    addEvent,
    removeEvent,
    saveLineup,
  };

  if (estado === 'cargando') return <p className="vacio">Cargando…</p>;
  if (estado !== 'ok') {
    return (
      <div className="vacio">
        <p>{errorCarga || 'No encontramos este campeonato.'}</p>
        <Link href="/admin" className="btn">Volver al panel</Link>
      </div>
    );
  }

  const actual = tab ?? (teams.length > 0 ? 'partidos' : 'equipos');

  return (
    <>
      <div className="barra-volver">
        <Link href="/admin" className="volver">← Panel</Link>
        <Link href={`/campeonato/${id}`} className="volver">Ver vista pública →</Link>
      </div>
      <h1 className="campeonato-titulo">{champ.name}</h1>

      {error && <p className="banner" role="alert">{error}</p>}

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={actual === t.id}
            className={actual === t.id ? 'tab activa' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actual === 'equipos' && <Equipos teams={teams} onAdd={addTeam} onRemove={removeTeam} />}
      {actual === 'partidos' && (
        <AdminPartidos teams={teams} matches={matches} events={events} lineups={lineups} acc={acc} />
      )}
    </>
  );
}
