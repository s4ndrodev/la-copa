import Link from 'next/link';

// Pie de página solo para la página de inicio
export default function Footer() {
  return (
    <footer className="footer-inicio">
      <div>
        <p className="footer-logo">Qvandev</p>
        <p className="footer-texto">
          Tabla de posiciones, partidos por día y marcador en vivo para tu campeonato de fútbol.
        </p>
      </div>
      <nav className="footer-links" aria-label="Contacto">
        <strong>Contacto</strong>
        <a href="mailto:alessandroguez98@gmail.com">Correo electrónico</a>
      </nav>
      <p className="footer-copy">
        © {new Date().getFullYear()} Qvandev. LaCopa es un producto de Qvandev.
      </p>
    </footer>
  );
}