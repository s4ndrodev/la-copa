import { useNow } from '@/lib/data';
import { clockText } from '@/lib/utils';

// Estado en vivo del partido: reloj corriendo, medio tiempo o final.
// No muestra nada si el partido aún no empezó.
export default function Reloj({ m }) {
  const corriendo = m.status === 'first_half' || m.status === 'second_half';
  const now = useNow(corriendo);

  if (corriendo) {
    return (
      <span className="vivo">
        <i className="punto-vivo" aria-hidden="true" />
        EN VIVO
        <b>{m.status === 'first_half' ? '1T' : '2T'}</b>
        <span className="reloj">{clockText(m, now)}</span>
      </span>
    );
  }
  if (m.status === 'half_time') return <span className="vivo pausa">Medio tiempo</span>;
  if (m.status === 'finished') return <span className="final">Final</span>;
  return null;
}
