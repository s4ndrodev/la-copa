import { useState } from 'react';
import { jugadoresATexto, parseJugadores } from '@/lib/utils';

export default function AlineacionEditor({ nombre, rows, onSave }) {
  const [titulares, setTitulares] = useState(jugadoresATexto(rows.filter((r) => r.is_starter)));
  const [suplentes, setSuplentes] = useState(jugadoresATexto(rows.filter((r) => !r.is_starter)));
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    const filas = [
      ...parseJugadores(titulares).map((j) => ({ ...j, isStarter: true })),
      ...parseJugadores(suplentes).map((j) => ({ ...j, isStarter: false })),
    ];
    await onSave(filas);
    setGuardando(false);
  }

  return (
    <div className="bloque">
      <h4>Alineación · {nombre}</h4>
      <label className="campo">
        Titulares
        <textarea
          value={titulares}
          onChange={(e) => setTitulares(e.target.value)}
          placeholder={'Un jugador por línea\n1 Portero\n10 Delantero'}
        />
      </label>
      <label className="campo">
        Suplentes
        <textarea
          value={suplentes}
          onChange={(e) => setSuplentes(e.target.value)}
          placeholder="Un jugador por línea"
        />
      </label>
      <button className="btn btn-chico" onClick={guardar} disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar alineación'}
      </button>
    </div>
  );
}
