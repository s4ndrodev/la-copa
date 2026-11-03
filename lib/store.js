'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'lacopa:v1';

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// Datos guardados en el navegador: { championships: [{ id, name, teams, matches }] }
export function useStore() {
  const [data, setData] = useState({ championships: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }, [data, ready]);

  const update = useCallback((fn) => setData((prev) => fn(prev)), []);

  return { data, ready, update };
}

export function isPlayed(m) {
  return m.homeGoals !== null && m.awayGoals !== null;
}

export function sortMatches(matches) {
  return [...matches].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

export function standings(teams, matches) {
  const rows = new Map(
    teams.map((t) => [
      t.id,
      { id: t.id, name: t.name, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, forma: [] },
    ])
  );

  for (const m of sortMatches(matches).filter(isPlayed)) {
    const h = rows.get(m.homeId);
    const a = rows.get(m.awayId);
    if (!h || !a) continue;

    h.pj++; a.pj++;
    h.gf += m.homeGoals; h.gc += m.awayGoals;
    a.gf += m.awayGoals; a.gc += m.homeGoals;

    if (m.homeGoals > m.awayGoals) {
      h.g++; h.pts += 3; h.forma.push('G');
      a.p++; a.forma.push('P');
    } else if (m.homeGoals < m.awayGoals) {
      a.g++; a.pts += 3; a.forma.push('G');
      h.p++; h.forma.push('P');
    } else {
      h.e++; a.e++; h.pts++; a.pts++;
      h.forma.push('E'); a.forma.push('E');
    }
  }

  return [...rows.values()]
    .map((r) => ({ ...r, dg: r.gf - r.gc, forma: r.forma.slice(-5) }))
    .sort(
      (x, y) =>
        y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.name.localeCompare(y.name, 'es')
    );
}

export function dayLabel(key) {
  if (key === 'sin-fecha') return 'Sin fecha';
  const d = new Date(key + 'T00:00');
  const txt = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
