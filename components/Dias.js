import { useMemo, useState } from 'react';
import PartidoPublico from './PartidoPublico';
import { etiquetaDia, tituloDia, todayKey } from '@/lib/utils';

// Partidos agrupados por día, con un tab por cada día que tenga partidos.
export default function Dias({ teams, matches, events, lineups }) {
  const hoy = todayKey();
  const [sel, setSel] = useState(null);

  const { claves, porDia } = useMemo(() => {
    const mapa = new Map();
    for (const m of matches) {
      const k = m.match_date ? m.match_date.slice(0, 10) : 'sin-fecha';
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(m);
    }
    for (const lista of mapa.values()) {
      lista.sort(
        (a, b) =>
          (a.match_date || '').localeCompare(b.match_date || '') || (a.round || 0) - (b.round || 0)
      );
    }
    const fechas = [...mapa.keys()].filter((k) => k !== 'sin-fecha').sort();
    if (mapa.has('sin-fecha')) fechas.push('sin-fecha');
    return { claves: fechas, porDia: mapa };
  }, [matches]);

  if (claves.length === 0) {
    return <p className="vacio">Aún no hay partidos programados.</p>;
  }

  const fechadas = claves.filter((k) => k !== 'sin-fecha');
  const porDefecto = claves.includes(hoy)
    ? hoy
    : fechadas.find((k) => k >= hoy) || fechadas[fechadas.length - 1] || 'sin-fecha';
  const actual = sel && claves.includes(sel) ? sel : porDefecto;

  const nombre = (id) => teams.find((t) => t.id === id)?.name ?? '—';

  return (
    <section>
      <div className="dias-tabs" role="tablist" aria-label="Días con partidos">
        {claves.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={actual === k}
            className={actual === k ? 'dia-tab activa' : 'dia-tab'}
            onClick={() => setSel(k)}
          >
            {etiquetaDia(k, hoy)}
          </button>
        ))}
      </div>

      <h2 className="dia-titulo primero">{tituloDia(actual)}</h2>
      <ul className="lista">
        {porDia.get(actual).map((m) => (
          <PartidoPublico
            key={m.id}
            m={m}
            local={nombre(m.home_id)}
            visita={nombre(m.away_id)}
            events={events}
            lineups={lineups}
          />
        ))}
      </ul>
    </section>
  );
}
