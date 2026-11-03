import { useState } from 'react';
import { dayLabel, isPlayed, sortMatches } from '@/lib/store';

export default function Partidos({ teams, matches, onAdd, onSave, onClear, onRemove }) {
  const nombre = (id) => teams.find((t) => t.id === id)?.name ?? '—';

  // Agrupa por día manteniendo el orden cronológico; los partidos sin fecha van al final.
  const grupos = new Map();
  for (const m of sortMatches(matches)) {
    const key = m.date ? m.date.slice(0, 10) : 'sin-fecha';
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(m);
  }

  return (
    <section>
      <NuevoPartido teams={teams} onAdd={onAdd} />

      {matches.length === 0 ? (
        <p className="vacio">Aún no hay partidos programados.</p>
      ) : (
        [...grupos.entries()].map(([key, lista]) => (
          <div key={key} className="dia">
            <h3 className="dia-titulo">{dayLabel(key)}</h3>
            <ul className="lista">
              {lista.map((m) => (
                <Partido
                  key={m.id}
                  m={m}
                  local={nombre(m.homeId)}
                  visita={nombre(m.awayId)}
                  onSave={onSave}
                  onClear={onClear}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}

function NuevoPartido({ teams, onAdd }) {
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  if (teams.length < 2) {
    return <p className="vacio">Necesitas al menos dos equipos para programar un partido.</p>;
  }

  function agregar(e) {
    e.preventDefault();
    if (!homeId || !awayId) return setError('Elige el equipo local y el visitante.');
    if (homeId === awayId) return setError('Local y visitante deben ser equipos distintos.');
    onAdd({ homeId, awayId, date });
    setHomeId('');
    setAwayId('');
    setError('');
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

function Partido({ m, local, visita, onSave, onClear, onRemove }) {
  const [hg, setHg] = useState(m.homeGoals ?? '');
  const [ag, setAg] = useState(m.awayGoals ?? '');
  const jugado = isPlayed(m);
  const valido = hg !== '' && ag !== '' && Number(hg) >= 0 && Number(ag) >= 0;
  const hora = m.date ? m.date.slice(11, 16) : '';

  function guardar() {
    if (!valido) return;
    onSave(m.id, Math.floor(Number(hg)), Math.floor(Number(ag)));
  }

  function quitarResultado() {
    setHg('');
    setAg('');
    onClear(m.id);
  }

  return (
    <li className={jugado ? 'partido jugado' : 'partido'}>
      <div className="marcador">
        <span className="local">{local}</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={hg}
          onChange={(e) => setHg(e.target.value)}
          aria-label={`Goles de ${local}`}
        />
        <span className="guion">–</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={ag}
          onChange={(e) => setAg(e.target.value)}
          aria-label={`Goles de ${visita}`}
        />
        <span className="visita">{visita}</span>
      </div>
      <div className="acciones">
        {hora && <span className="hora">{hora}</span>}
        <button className="btn btn-chico" onClick={guardar} disabled={!valido}>
          {jugado ? 'Actualizar' : 'Guardar resultado'}
        </button>
        {jugado && (
          <button className="btn-texto" onClick={quitarResultado}>Quitar resultado</button>
        )}
        <button
          className="btn-texto"
          onClick={() => confirm('¿Borrar este partido?') && onRemove(m.id)}
        >
          Borrar partido
        </button>
      </div>
    </li>
  );
}
