import { useState } from 'react';
import AdminPartido from './AdminPartido';
import { dayLabel, groupKey, sortMatches } from '@/lib/utils';

export default function AdminPartidos({ teams, matches, events, lineups, acc }) {
  const nombre = (id) => teams.find((t) => t.id === id)?.name ?? '—';

  // Agrupa por jornada (o por día si no hay jornada) respetando el orden.
  const grupos = new Map();
  for (const m of sortMatches(matches)) {
    const key = groupKey(m);
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(m);
  }

  return (
    <section>
      <Generador teams={teams} hayPartidos={matches.length > 0} onGenerate={acc.generar} />
      <NuevoPartido teams={teams} onAdd={acc.addMatch} />

      {matches.length === 0 ? (
        <p className="vacio">Aún no hay partidos. Genera el calendario o programa uno a mano.</p>
      ) : (
        [...grupos.entries()].map(([key, lista]) => (
          <div key={key} className="dia">
            <h3 className="dia-titulo">{dayLabel(key)}</h3>
            <ul className="lista">
              {lista.map((m) => (
                <AdminPartido
                  key={m.id}
                  m={m}
                  local={nombre(m.home_id)}
                  visita={nombre(m.away_id)}
                  events={events.filter((e) => e.match_id === m.id)}
                  lineups={lineups.filter((l) => l.match_id === m.id)}
                  acc={acc}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}

function Generador({ teams, hayPartidos, onGenerate }) {
  const [idaVuelta, setIdaVuelta] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  if (teams.length < 2) {
    return <p className="vacio">Necesitas al menos dos equipos para programar partidos.</p>;
  }

  async function generar() {
    if (hayPartidos && !confirm('Ya hay partidos. Solo se añadirán los cruces que falten. ¿Continuar?')) return;
    setOcupado(true);
    await onGenerate(idaVuelta);
    setOcupado(false);
  }

  return (
    <div className="generar">
      <div>
        <strong>Calendario automático</strong>
        <p className="nota">Cada equipo juega contra todos los demás, repartido en jornadas.</p>
      </div>
      <label className="check">
        <input type="checkbox" checked={idaVuelta} onChange={(e) => setIdaVuelta(e.target.checked)} />
        Ida y vuelta
      </label>
      <button className="btn" onClick={generar} disabled={ocupado}>
        {ocupado ? 'Generando…' : 'Generar todos contra todos'}
      </button>
    </div>
  );
}

function NuevoPartido({ teams, onAdd }) {
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  if (teams.length < 2) return null;

  async function agregar(e) {
    e.preventDefault();
    if (!homeId || !awayId) return setError('Elige el equipo local y el visitante.');
    if (homeId === awayId) return setError('Local y visitante deben ser equipos distintos.');
    const ok = await onAdd({ homeId, awayId, date });
    if (ok) {
      setHomeId('');
      setAwayId('');
      setError('');
    }
  }

  return (
    <form className="nuevo" onSubmit={agregar}>
      <label>
        Local
        <select value={homeId} onChange={(e) => { setHomeId(e.target.value); setError(''); }}>
          <option value="">Elegir…</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label>
        Visitante
        <select value={awayId} onChange={(e) => { setAwayId(e.target.value); setError(''); }}>
          <option value="">Elegir…</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label>
        Fecha y hora
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <button className="btn" type="submit">Programar partido</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
