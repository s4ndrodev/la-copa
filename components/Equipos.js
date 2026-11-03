import { useState } from 'react';

export default function Equipos({ teams, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function agregar(e) {
    e.preventDefault();
    const nombre = name.trim();
    if (!nombre) return;
    if (teams.some((t) => t.name.toLowerCase() === nombre.toLowerCase())) {
      setError('Ya hay un equipo con ese nombre.');
      return;
    }
    const ok = await onAdd(nombre);
    if (ok) {
      setName('');
      setError('');
    }
  }

  function quitar(t) {
    if (!confirm(`¿Quitar a "${t.name}"? También se borrarán sus partidos.`)) return;
    onRemove(t.id);
  }

  return (
    <section>
      <form className="fila" onSubmit={agregar}>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="Nombre del equipo"
          aria-label="Nombre del equipo"
          maxLength={40}
        />
        <button className="btn" type="submit">Añadir equipo</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      {teams.length === 0 ? (
        <p className="vacio">Aún no hay equipos. Añade al menos dos para programar partidos.</p>
      ) : (
        <ul className="lista">
          {teams.map((t) => (
            <li key={t.id} className="item">
              <span className="item-link"><strong>{t.name}</strong></span>
              <button className="btn-texto" onClick={() => quitar(t)}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
