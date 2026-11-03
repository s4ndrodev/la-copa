import Link from 'next/link';

export default function Bienvenida() {
  return (
    <>
      <section className="hero hero-grande">
        <h1>Tu campeonato, al día.</h1>
        <p>
          LaCopa reúne en un solo lugar la tabla de posiciones, el calendario de partidos y el
          marcador en vivo de tu torneo de fútbol. Sin planillas ni grupos de mensajes.
        </p>
        <div className="hero-acciones">
          <Link href="/campeonatos" className="btn btn-amarillo">Ver campeonatos</Link>
          <Link href="/login" className="btn btn-borde">Administrar una copa</Link>
        </div>
      </section>

      <section>
        <h2 className="titulo">Para quien sigue el torneo</h2>
        <div className="features">
          <article className="feature">
            <h3>Tabla de posiciones</h3>
            <p>Puntos, goles, diferencia y la forma de cada equipo en sus últimos cinco partidos.</p>
          </article>
          <article className="feature">
            <h3>Partidos por día</h3>
            <p>Un tab para hoy, mañana y cada fecha con partidos programados. Entra y mira qué se juega.</p>
          </article>
          <article className="feature">
            <h3>En vivo</h3>
            <p>
              Cuando se juega, el reloj corre en pantalla con el tiempo, los goles, las tarjetas y
              las alineaciones que el organizador vaya publicando.
            </p>
          </article>
        </div>
      </section>

      <section className="organizador">
        <h2 className="titulo">Para quien organiza</h2>
        <p>
          Crea el campeonato, añade los equipos y genera el calendario todos contra todos con un
          botón. Define cuántos minutos dura cada tiempo, inicia el partido, anota goles y tarjetas,
          y la tabla se actualiza sola.
        </p>
        <Link href="/login" className="btn">Entar</Link>
      </section>
      <Footer/>
    </>
  );
}
