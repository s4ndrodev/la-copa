export const LIVE = ['first_half', 'half_time', 'second_half'];
export const isLive = (m) => LIVE.includes(m.status);
export const isPlayed = (m) =>
  m.status === 'finished' && m.home_goals !== null && m.away_goals !== null;

// Siguiente paso del partido para el botón del admin
export const SIGUIENTE = {
  scheduled: { estado: 'first_half', texto: 'Iniciar 1er tiempo' },
  first_half: { estado: 'half_time', texto: 'Terminar 1er tiempo' },
  half_time: { estado: 'second_half', texto: 'Iniciar 2º tiempo' },
  second_half: { estado: 'finished', texto: 'Finalizar partido' },
};

export const TIPO_EVENTO = { goal: 'Gol', yellow: 'Tarjeta amarilla', red: 'Tarjeta roja' };

// Orden: primero partidos con jornada, luego con fecha, al final sin fecha.
export function sortMatches(matches) {
  const rank = (m) => (m.round ? 0 : m.match_date ? 1 : 2);
  return [...matches].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (a.round || 0) - (b.round || 0) ||
      (a.match_date || '').localeCompare(b.match_date || '')
  );
}

export function standings(teams, matches) {
  const rows = new Map(
    teams.map((t) => [
      t.id,
      { id: t.id, name: t.name, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, forma: [] },
    ])
  );

  const jugados = [...matches]
    .filter(isPlayed)
    .sort(
      (a, b) =>
        (a.match_date || '').localeCompare(b.match_date || '') || (a.round || 0) - (b.round || 0)
    );

  for (const m of jugados) {
    const h = rows.get(m.home_id);
    const a = rows.get(m.away_id);
    if (!h || !a) continue;

    h.pj++; a.pj++;
    h.gf += m.home_goals; h.gc += m.away_goals;
    a.gf += m.away_goals; a.gc += m.home_goals;

    if (m.home_goals > m.away_goals) {
      h.g++; h.pts += 3; h.forma.push('G');
      a.p++; a.forma.push('P');
    } else if (m.home_goals < m.away_goals) {
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

// Calendario todos contra todos (método del círculo). Con número impar, uno descansa cada jornada.
export function roundRobin(ids, doubleLeg = false) {
  const base = [...ids];
  if (base.length % 2) base.push(null);
  const n = base.length;
  const rounds = n - 1;
  const out = [];
  let ring = base;

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      let home = ring[i];
      let away = ring[n - 1 - i];
      if (home === null || away === null) continue;
      if (i === 0 && r % 2 === 1) [home, away] = [away, home];
      out.push({ round: r + 1, homeId: home, awayId: away });
      if (doubleLeg) out.push({ round: r + 1 + rounds, homeId: away, awayId: home });
    }
    ring = [ring[0], ring[n - 1], ...ring.slice(1, n - 1)];
  }
  return out;
}

/* ───── Fechas ───── */

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function todayKey() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function horaCorta(s) {
  return s ? s.slice(11, 16) : '';
}

// Título de grupo en el listado del admin (jornada o día)
export function dayLabel(key) {
  if (key === 'sin-fecha') return 'Sin fecha';
  if (key.startsWith('j')) return `Jornada ${Number(key.slice(1))}`;
  const d = new Date(key + 'T00:00');
  return cap(d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }));
}

export function groupKey(m) {
  if (m.round) return 'j' + String(m.round).padStart(3, '0');
  return m.match_date ? m.match_date.slice(0, 10) : 'sin-fecha';
}

// Etiqueta del tab por día: Hoy, Mañana, Martes..., 24 noviembre
export function etiquetaDia(key, hoyKey) {
  if (key === 'sin-fecha') return 'Sin fecha';
  const d = new Date(key + 'T00:00');
  const h = new Date(hoyKey + 'T00:00');
  const diff = Math.round((d - h) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff >= 2 && diff <= 6) return cap(d.toLocaleDateString('es', { weekday: 'long' }));
  return `${d.getDate()} ${d.toLocaleDateString('es', { month: 'long' })}`;
}

export function tituloDia(key) {
  if (key === 'sin-fecha') return 'Partidos sin fecha asignada';
  const d = new Date(key + 'T00:00');
  return cap(d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }));
}

/* ───── Reloj del partido ───── */

export function elapsedSeconds(m, now) {
  if (!m.half_started_at) return 0;
  return Math.max(0, Math.floor((now - new Date(m.half_started_at).getTime()) / 1000));
}

function totalSeconds(m, now) {
  const half = (m.half_minutes || 45) * 60;
  const base = m.status === 'second_half' ? half : 0;
  return base + elapsedSeconds(m, now);
}

// "23:15" o "45+2'" si se pasa del tiempo reglamentario
export function clockText(m, now) {
  const half = m.half_minutes || 45;
  const limit = (m.status === 'second_half' ? 2 : 1) * half * 60;
  const total = totalSeconds(m, now);
  if (total >= limit) return `${limit / 60}+${Math.floor((total - limit) / 60)}'`;
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function currentMinute(m, now) {
  return Math.floor(totalSeconds(m, now) / 60) + 1;
}

/* ───── Alineaciones ───── */

// Una línea por jugador. Número opcional al inicio: "10 Messi", "7. Ronaldo"
export function parseJugadores(texto) {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const mt = l.match(/^(\d{1,3})[\s.\-–):]+(.+)$/);
      return mt ? { number: Number(mt[1]), player: mt[2].trim() } : { number: null, player: l };
    });
}

export function jugadoresATexto(rows) {
  return rows.map((r) => (r.number != null ? `${r.number} ${r.player}` : r.player)).join('\n');
}
