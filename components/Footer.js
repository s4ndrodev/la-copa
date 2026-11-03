export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="brand">
              <span className="brand-mark qd-mark">Q</span>
              Qvandev
            </a>
            <p>Apps simples y útiles, hechas con foco en Cuba.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Contacto</h4>
              <a href="mailto:alessandroguez98@gmail.com">Correo</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Qvandev.</span>
          <span>Hecho en Cuba</span>
        </div>
      </div>
    </footer>
  );
}