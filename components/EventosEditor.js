import { useState } from 'react';
import { TIPO_EVENTO, currentMinute } from '@/lib/utils';

export default function EventosEditor({ m, local, visita, events, onAdd, onRemove }) {
  const [teamId, setTeamId] = useState(m.home_id);
  const [type, setType] = useState('goal');
  const [player, setPlayer] = useState('');
  const [minute, setMinute] = useState('');

  const enCurso = m.status === 'first_half' || m.status === 'second_half';
  const nombreEquipo = (id) => (id === m.home_id ? local : visita);

  async function agregar(e) {
    e.preventDefault();
    let min = minute === '' ? null : Math.max(0, Math.floor(Number(minute)));
    // Si el partido está en juego y no se escribió minuto, usa el minuto actual del reloj
    if (min === null && enCurso) min = currentMinute(m, Date.now());
    const ok = await onAdd(m, { teamId, type, player: player.trim(), minute: min });
    if (ok) {
      setPlayer('');
      setMinute('');
    }
  }

  const ordenados = [...events].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  return (
    <div className="bloque">
      <h4>Goles y tarjetas</h4>
      <form className="ev-form" onSubmit={agregar}>
        <label>
          Equipo
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value={m.home_id}>{local}</option>
            <option value={m.away_id}>{visita}</option>
          </select>
        </label>
        <label>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="goal">Gol</option>
            <option value="yellow">Tarjeta amarilla</option>
            <option value="red">Tarjeta roja</option>
          </select>
        </label>
        <label>
          Jugador
          <input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="Opcional" maxLength={60} />
        </label>
        <label>
          Minuto
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder={enCurso ? 'Actual' : 'Opcional'}
          />
        </label>
        <button className="btn btn-chico" type="submit">Añadir</button>
      </form>

      {ordenados.length > 0 && (
        <ul className="ev-lista">
          {ordenados.map((ev) => (
            <li key={ev.id}>
              <span>
                {ev.type === 'goal' ? (
                  <span aria-hidden="true">⚽ </span>
                ) : (
                  <i className={`carta ${ev.type === 'red' ? 'roja' : 'amarilla'}`} />
                )}
                <b>{ev.minute != null ? `${ev.minute}' ` : ''}</b>
                {ev.player || TIPO_EVENTO[ev.type]} · {nombreEquipo(ev.team_id)}
              </span>
              <button className="btn-texto" onClick={() => onRemove(m, ev)}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
