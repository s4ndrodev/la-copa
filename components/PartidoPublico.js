import Reloj from './Reloj';
import { horaCorta, isLive } from '@/lib/utils';

function textoGoles(lista) {
  return lista
    .map((g) => `${g.player || 'Gol'}${g.minute != null ? ` ${g.minute}'` : ''}`)
    .join(', ');
}

function Chips({ amarillas, rojas }) {
  return (
    <>
      {amarillas > 0 && (
        <span className="chip" title="Tarjetas amarillas">
          <i className="carta amarilla" />{amarillas}
        </span>
      )}
      {rojas > 0 && (
        <span className="chip" title="Tarjetas rojas">
          <i className="carta roja" />{rojas}
        </span>
      )}
    </>
  );
}

function DetalleEquipo({ nombre, cartas, titulares, suplentes }) {
  return (
    <div className="det-equipo">
      <h4>{nombre}</h4>
      {cartas.length > 0 && (
        <ul className="det-lista">
          {cartas.map((c) => (
            <li key={c.id}>
              <i className={`carta ${c.type === 'red' ? 'roja' : 'amarilla'}`} />
              {c.player || 'Sin nombre'}{c.minute != null ? ` ${c.minute}'` : ''}
            </li>
          ))}
        </ul>
      )}
      {titulares.length > 0 && (
        <>
          <h5>Titulares</h5>
          <ul className="det-lista">
            {titulares.map((j) => (
              <li key={j.id}>{j.number != null && <b>{j.number}</b>} {j.player}</li>
            ))}
          </ul>
        </>
      )}
      {suplentes.length > 0 && (
        <>
          <h5>Suplentes</h5>
          <ul className="det-lista">
            {suplentes.map((j) => (
              <li key={j.id}>{j.number != null && <b>{j.number}</b>} {j.player}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Vista pública de un partido. Solo muestra lo que el admin haya rellenado.
export default function PartidoPublico({ m, local, visita, events, lineups }) {
  const live = isLive(m);
  const mostrarMarcador = live || m.status === 'finished';
  const evs = events.filter((e) => e.match_id === m.id);
  const lin = lineups.filter((l) => l.match_id === m.id);

  const de = (teamId, type) => evs.filter((e) => e.team_id === teamId && e.type === type);
  const golesL = de(m.home_id, 'goal');
  const golesV = de(m.away_id, 'goal');
  const hayGoles = golesL.length + golesV.length > 0;

  const amL = de(m.home_id, 'yellow').length;
  const roL = de(m.home_id, 'red').length;
  const amV = de(m.away_id, 'yellow').length;
  const roV = de(m.away_id, 'red').length;
  const hayTarjetas = amL + roL + amV + roV > 0;
  const hayDetalle = hayTarjetas || lin.length > 0;

  const cartasDe = (teamId) => evs.filter((e) => e.team_id === teamId && e.type !== 'goal');
  const linDe = (teamId, starter) =>
    lin.filter((l) => l.team_id === teamId && l.is_starter === starter);

  const hora = m.status === 'scheduled' ? horaCorta(m.match_date) : '';
  const hayLinea = hora || m.status !== 'scheduled' || m.round;

  return (
    <li className={live ? 'partido publico en-vivo' : 'partido publico'}>
      {hayLinea && (
        <div className="estado-linea">
          {hora && <span className="hora">{hora}</span>}
          <Reloj m={m} />
          {m.round && <span className="jornada">Jornada {m.round}</span>}
        </div>
      )}

      <div className="marcador solo">
        <span className="local">{local}</span>
        <span className="res">{mostrarMarcador ? `${m.home_goals ?? 0} – ${m.away_goals ?? 0}` : 'vs'}</span>
        <span className="visita">{visita}</span>
      </div>

      {hayGoles && (
        <div className="marcador solo extra">
          <span className="local">{textoGoles(golesL)}</span>
          <span className="balon" aria-hidden="true">⚽</span>
          <span className="visita">{textoGoles(golesV)}</span>
        </div>
      )}

      {hayTarjetas && (
        <div className="marcador solo extra">
          <span className="local"><Chips amarillas={amL} rojas={roL} /></span>
          <span className="balon" aria-hidden="true" />
          <span className="visita"><Chips amarillas={amV} rojas={roV} /></span>
        </div>
      )}

      {hayDetalle && (
        <details className="detalles" open={live}>
          <summary>Alineaciones y tarjetas</summary>
          <div className="det-grid">
            <DetalleEquipo
              nombre={local}
              cartas={cartasDe(m.home_id)}
              titulares={linDe(m.home_id, true)}
              suplentes={linDe(m.home_id, false)}
            />
            <DetalleEquipo
              nombre={visita}
              cartas={cartasDe(m.away_id)}
              titulares={linDe(m.away_id, true)}
              suplentes={linDe(m.away_id, false)}
            />
          </div>
        </details>
      )}
    </li>
  );
}
