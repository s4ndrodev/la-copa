import { standings } from '@/lib/utils';

export default function Tabla({ teams, matches }) {
  if (teams.length === 0) {
    return <p className="vacio">Este campeonato aún no tiene equipos.</p>;
  }

  const rows = standings(teams, matches);

  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            <th className="pos">#</th>
            <th className="eq">Equipo</th>
            <th title="Partidos jugados">PJ</th>
            <th title="Ganados">G</th>
            <th title="Empatados">E</th>
            <th title="Perdidos">P</th>
            <th title="Goles a favor">GF</th>
            <th title="Goles en contra">GC</th>
            <th title="Diferencia de gol">DG</th>
            <th title="Puntos">Pts</th>
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
    </div>
  );
}
