import Link from 'next/link';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import AuthBar from '@/components/AuthBar';
import './globals.css';

const body = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

export const metadata = {
  title: 'LaCopa — tu campeonato de fútbol, al día',
  description: 'Tabla de posiciones, partidos por día y marcador en vivo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${body.variable} ${display.variable}`}>
      <body>
        <header className="top">
          <Link href="/" className="logo">LaCopa</Link>
          <div className="top-der">
            <Link href="/campeonatos" className="nav-link">Campeonatos</Link>
            <AuthBar />
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
