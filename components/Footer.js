import Link from 'next/link';

// Pie de página solo para la página de inicio
export default function FooterInicio() {
  return (
    <footer className="footer-inicio">
      <div>
        <p className="footer-logo">LaCopa</p>
        <p className="footer-texto">
          Tabla de posiciones, partidos por día y marcador en vivo para tu campeonato de fútbol.
        </p>
      </div>
      <nav className="footer-links" aria-label="Enlaces del pie de página">
        <Link href="/campeonatos">Campeonatos</Link>
        <Link href="/login">Acceso de administrador</Link>
      </nav>
      <p className="footer-copy">© {new Date().getFullYear()} LaCopa</p>
    </footer>
  );
}
