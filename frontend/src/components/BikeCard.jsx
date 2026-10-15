import { formatPrice } from '../api.js';

export default function BikeCard({ bike, onAdd }) {
  return (
    <div className="karta-roweru">
      {bike.zdjecie && <img src={`/${bike.zdjecie}`} alt={bike.nazwa} />}
      <h3>{bike.nazwa}</h3>
      <p className="marka">{bike.marka}</p>
      <p className="cena">{formatPrice(bike.cena)}</p>
      <button className="przycisk-kup" onClick={() => onAdd(bike)}>Dodaj do koszyka</button>
    </div>
  );
}
