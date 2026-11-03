import { useEffect, useState } from 'react';
import Reloj from './Reloj';
import EventosEditor from './EventosEditor';
import AlineacionEditor from './AlineacionEditor';
import { SIGUIENTE, isLive, isPlayed } from '@/lib/utils';

const firma = (rows) => rows.map((r) => `${r.player}|${r.number}|${r.is_starter}`).join(';');

export default function AdminPartido({ m, local, visita, events, lineups, acc }) {
  const [hg, setHg] = useState(m.home_goals ?? '');
  const [ag, setAg] = useState(m.away_goals ?? '');
  const [min, setMin] = useState(String(m.half_minutes));

  // Si el marcador cambia por un gol o por otro cambio, se sincronizan los campos
  useEffect(() => {
    setHg(m.home_goals ?? '');
    setAg(m.away_goals ?? '');
  }, [m.home_goals, m.away_goals]);
  useEffect(() => {
    setMin(String(m.half_minutes));
  }, [m.half_minutes]);

  const jugado = isPlayed(m);
  const valido = hg !== '' && ag !== '' && Number(hg) >= 0 && Number(ag) >= 0;
  const siguiente = SIGUIENTE[m.status];

  function guardarResultado() {
    if (!valido) return;
    acc.saveResult(m, Math.floor(Number(hg)), Math.floor(Number(ag)));
  }

  function guardarMinutos() {
    const n = Math.floor(Number(min));
    if (!n || n < 1 || n > 120) {
      setMin(String(m.half_minutes));
      return;
    }
    if (n !== m.half_minutes) acc.setHalfMinutes(m.id, n);
  }

  const lineupLocal = lineups.filter((l) => l.team_id === m.home_id);
  const lineupVisita = lineups.filter((l) => l.team_id === m.away_id);

  return (
    <li className={isLive(m) ? 'partido en-vivo' : jugado ? 'partido jugado' : 'partido'}>
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
        <input
          type="datetime-local"
          className="fecha"
          value={m.match_date ? m.match_date.slice(0, 16) : ''}
          onChange={(e) => acc.setDate(m.id, e.target.value)}
          aria-label="Fecha y hora del partido"
        />
        <button className="btn btn-chico" onClick={guardarResultado} disabled={!valido}>
          {jugado ? 'Actualizar resultado' : 'Guardar resultado final'}
        </button>
        {(jugado || m.home_goals !== null) && (
          <button
            className="btn-texto"
            onClick={() => confirm('¿Quitar el resultado y reiniciar el partido?') && acc.clearResult(m)}
          >
            Quitar resultado
          </button>
        )}
        <button
          className="btn-texto"
          onClick={() => confirm('¿Borrar este partido?') && acc.removeMatch(m.id)}
        >
          Borrar partido
        </button>
      </div>

      <details className="panel">
        <summary>
          Control del partido <Reloj m={m} />
        </summary>

        <div className="panel-cuerpo">
          <div className="control">
            <label>
              Minutos por tiempo
              <input
                type="number"
                min="1"
                max="120"
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                onBlur={guardarMinutos}
              />
            </label>
            <div className="control-botones">
              {siguiente && (
                <button className="btn btn-chico" onClick={() => acc.cambiarEstado(m, siguiente.estado)}>
                  {siguiente.texto}
                </button>
              )}
              {isLive(m) && (
                <button
                  className="btn-texto"
                  onClick={() => confirm('¿Finalizar el partido ahora?') && acc.cambiarEstado(m, 'finished')}
                >
                  Finalizar ya
                </button>
              )}
            </div>
          </div>

          <EventosEditor
            m={m}
            local={local}
            visita={visita}
            events={events}
            onAdd={acc.addEvent}
            onRemove={acc.removeEvent}
          />

          <div className="alineaciones">
            <AlineacionEditor
              key={'l' + firma(lineupLocal)}
              nombre={local}
              rows={lineupLocal}
              onSave={(filas) => acc.saveLineup(m, m.home_id, filas)}
            />
            <AlineacionEditor
              key={'v' + firma(lineupVisita)}
              nombre={visita}
              rows={lineupVisita}
              onSave={(filas) => acc.saveLineup(m, m.away_id, filas)}
            />
          </div>
        </div>
      </details>
    </li>
  );
}
