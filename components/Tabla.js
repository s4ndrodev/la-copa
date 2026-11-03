'use client';

import { useRef } from 'react';
import { standings } from '@/lib/utils';

const SIGLAS = [
  ['#', 'Posición en la tabla'],
  ['PJ', 'Partidos jugados'],
  ['G', 'Partidos ganados'],
  ['E', 'Partidos empatados'],
  ['P', 'Partidos perdidos'],
  ['GF', 'Goles a favor (los que ha marcado)'],
  ['GC', 'Goles en contra (los que ha recibido)'],
  ['DG', 'Diferencia de gol: GF menos GC'],
  ['Pts', 'Puntos: 3 por victoria y 1 por empate'],
];

export default function Tabla({ teams, matches }) {
  const modal = useRef(null);

  if (teams.length === 0) {
    return <p className="vacio">Este campeonato aún no tiene equipos.</p>;
  }

  const rows = standings(teams, matches);

  return (
    <div className="tabla-wrap">
      <div className="tabla-barra">
        <button
          className="info-btn"
          onClick={() => modal.current?.showModal()}
          aria-label="Qué significan las siglas de la tabla"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="1.3" fill="currentColor" />
          </svg>
          Info
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th className="pos">#</th>
            <th className="eq">Equipo</th>
            <th>PJ</th>
            <th>G</th>
            <th>E</th>
            <th>P</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>Pts</th>
            <th className="forma-col">Forma</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i === 0 && r.pj > 0 ? 'lider' : ''}>
              <td className="pos">{i + 1}</td>
              <td className="eq">{r.name}</td>
              <td>{r.pj}</td>
              <td>{r.g}</td>
              <td>{r.e}</td>
              <td>{r.p}</td>
              <td>{r.gf}</td>
              <td>{r.gc}</td>
              <td>{r.dg > 0 ? `+${r.dg}` : r.dg}</td>
              <td className="pts">{r.pts}</td>
              <td className="forma-col">
                <span className="forma">
                  {r.forma.map((f, k) => (
                    <span key={k} className={`punto punto-${f}`} title={f === 'G' ? 'Ganó' : f === 'E' ? 'Empató' : 'Perdió'}>
                      {f}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota">Cuentan los partidos finalizados. Desempate: puntos, diferencia de gol, goles a favor.</p>

      {/* Popup con el significado de cada sigla. Se cierra con Esc, tocando fuera o con el botón. */}
      <dialog
        ref={modal}
        className="modal"
        aria-labelledby="siglas-titulo"
        onClick={(e) => {
          if (e.target === modal.current) modal.current.close();
        }}
      >
        <div className="modal-cuerpo">
          <h3 id="siglas-titulo">Qué significa cada sigla</h3>
          <dl className="siglas">
            {SIGLAS.map(([sigla, texto]) => (
              <div key={sigla} className="sigla-fila">
                <dt>{sigla}</dt>
                <dd>{texto}</dd>
              </div>
            ))}
            <div className="sigla-fila">
              <dt>Forma</dt>
              <dd>
                Resultado de los últimos 5 partidos, con el más reciente a la derecha:{' '}
                <span className="punto punto-G">G</span> ganó,{' '}
                <span className="punto punto-E">E</span> empató,{' '}
                <span className="punto punto-P">P</span> perdió.
              </dd>
            </div>
          </dl>
          <button className="btn" onClick={() => modal.current?.close()}>Entendido</button>
        </div>
      </dialog>
    </div>
  );
}
