'use client';

import { useCallback, useEffect, useState } from 'react';
import { configured, supabase } from './supabase';
import { isLive } from './utils';

const VACIO = {
  estado: 'cargando', // cargando | ok | no-existe | error
  champ: null,
  teams: [],
  matches: [],
  events: [],
  lineups: [],
  errorCarga: '',
};

// Carga un campeonato completo. Con poll=true se refresca cada 20 s mientras haya un partido en curso.
export function useCampeonato(id, { poll = false } = {}) {
  const [s, setS] = useState(VACIO);

  const cargar = useCallback(async () => {
    const [c, t, m, e, l] = await Promise.all([
      supabase.from('championships').select('id, name').eq('id', id).maybeSingle(),
      supabase.from('teams').select('id, name').eq('championship_id', id).order('name'),
      supabase.from('matches').select('*').eq('championship_id', id),
      supabase.from('match_events').select('*').eq('championship_id', id).order('minute'),
      supabase.from('lineups').select('*').eq('championship_id', id).order('sort_order'),
    ]);
    const fallo = c.error || t.error || m.error || e.error || l.error;
    if (fallo) {
      setS((p) => ({ ...p, estado: 'error', errorCarga: fallo.message }));
      return;
    }
    if (!c.data) {
      setS((p) => ({ ...p, estado: 'no-existe' }));
      return;
    }
    setS({
      estado: 'ok',
      champ: c.data,
      teams: t.data,
      matches: m.data,
      events: e.data,
      lineups: l.data,
      errorCarga: '',
    });
  }, [id]);

  useEffect(() => {
    if (configured) cargar();
  }, [cargar]);

  const hayVivo = s.matches.some(isLive);
  useEffect(() => {
    if (!poll || !hayVivo) return;
    const t = setInterval(cargar, 20000);
    return () => clearInterval(t);
  }, [poll, hayVivo, cargar]);

  return { ...s, reload: cargar };
}

// Hora actual que se actualiza cada segundo mientras active sea true
export function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}
