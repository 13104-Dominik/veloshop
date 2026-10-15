import { useCallback, useEffect, useState } from 'react';
import { api, formatPrice } from '../api.js';

const STATUSES = ['nowe', 'w realizacji', 'wyslane', 'anulowane'];
const EMPTY = { nazwa: '', marka: '', cena: '', kategoria_id: '', zdjecie: '' };

export default function Admin() {
  const [tab, setTab] = useState('rowery');
  const [bikes, setBikes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fail = (e) => setMsg({ type: 'blad', text: e.message });
  const ok = (text) => setMsg({ type: 'sukces', text });

  const load = useCallback(() => {
    api('/bikes').then(setBikes).catch(fail);
    api('/categories').then(setCategories).catch(fail);
    api('/orders').then(setOrders).catch(fail);
  }, []);
  useEffect(load, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, cena: Number(form.cena), kategoria_id: Number(form.kategoria_id) };
    try {
      if (editId) await api(`/bikes/${editId}`, { method: 'PUT', body });
      else await api('/bikes', { method: 'POST', body });
      ok(editId ? 'Zapisano zmiany.' : 'Dodano rower.');
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch (err) { fail(err); }
  };

  const edit = (b) => {
    setEditId(b.id);
    setForm({ nazwa: b.nazwa, marka: b.marka, cena: String(b.cena), kategoria_id: String(b.kategoria_id), zdjecie: b.zdjecie || '' });
  };

  const remove = async (b) => {
    if (!window.confirm(`Usunąć rower "${b.nazwa}"?`)) return;
    try { await api(`/bikes/${b.id}`, { method: 'DELETE' }); ok('Usunięto rower.'); load(); } catch (err) { fail(err); }
  };

  const setStatus = async (id, status) => {
    try { await api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }); ok('Zmieniono status.'); load(); } catch (err) { fail(err); }
  };

  return (
    <>
      <h2>Panel administratora</h2>
      <div className="zakladki">
        <button className={tab === 'rowery' ? 'aktywna' : ''} onClick={() => setTab('rowery')}>Rowery</button>
        <button className={tab === 'zamowienia' ? 'aktywna' : ''} onClick={() => setTab('zamowienia')}>Zamówienia ({orders.length})</button>
      </div>
      {msg.text && <p className={msg.type === 'blad' ? 'komunikat-blad' : 'komunikat-sukces'}>{msg.text}</p>}

      {tab === 'rowery' && (
        <>
          <form className="formularz-zamowienia" onSubmit={save}>
            <h3>{editId ? `Edycja roweru #${editId}` : 'Dodaj rower'}</h3>
            <label htmlFor="a-nazwa">Nazwa</label>
            <input id="a-nazwa" value={form.nazwa} onChange={set('nazwa')} required />
            <label htmlFor="a-marka">Marka</label>
            <input id="a-marka" value={form.marka} onChange={set('marka')} required />
            <label htmlFor="a-cena">Cena (PLN)</label>
            <input id="a-cena" type="number" step="0.01" min="0.01" value={form.cena} onChange={set('cena')} required />
            <label htmlFor="a-kat">Kategoria</label>
            <select id="a-kat" value={form.kategoria_id} onChange={set('kategoria_id')} required>
              <option value="">- wybierz -</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nazwa}</option>)}
            </select>
            <label htmlFor="a-zdj">Zdjęcie (np. zdjecia/nazwa.jpg)</label>
            <input id="a-zdj" value={form.zdjecie} onChange={set('zdjecie')} />
            <button className="przycisk-zamow" type="submit">{editId ? 'Zapisz' : 'Dodaj'}</button>
            {editId && <button type="button" className="przycisk-powrot" onClick={() => { setEditId(null); setForm(EMPTY); }}>Anuluj</button>}
          </form>
          <table className="tabela-koszyka">
            <thead><tr><th>ID</th><th>Nazwa</th><th>Marka</th><th>Cena</th><th></th></tr></thead>
            <tbody>
              {bikes.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td><td>{b.nazwa}</td><td>{b.marka}</td><td>{formatPrice(b.cena)}</td>
                  <td>
                    <button className="przycisk" onClick={() => edit(b)}>Edytuj</button>{' '}
                    <button className="przycisk-usun" onClick={() => remove(b)}>Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'zamowienia' && (
        orders.length === 0 ? <p className="pusty-koszyk">Brak zamówień.</p> :
        orders.map((o) => (
          <div key={o.id} className="podsumowanie-zamowienia">
            <h3>#{o.id} - {o.imie_nazwisko} ({o.email})</h3>
            <p>{o.adres}, tel. {o.telefon} | {formatPrice(o.suma_calkowita)}</p>
            <ul>{o.elementy.map((e) => <li key={e.id}>{e.nazwa_roweru} x {e.ilosc}</li>)}</ul>
            <label>Status:{' '}
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
        ))
      )}
    </>
  );
}
