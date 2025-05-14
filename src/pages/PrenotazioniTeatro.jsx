import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ElencoPrenotazioni from './ElencoPrenotazioni';
import '../OverlayAnimation.css';

export default function PrenotazioniTeatro() {
  const [spettacoli, setSpettacoli] = useState([]);
  const [postiPrenotati, setPostiPrenotati] = useState([]);
  const [postiSelezionati, setPostiSelezionati] = useState([]);
  const [form, setForm] = useState({
    spettacolo: '',
    nome: '',
    cognome: '',
    telefono: '',
    accredito: false,
    prenotatoDa: ''
  });
  const [messaggio, setMessaggio] = useState('');
  const [mostraElenco, setMostraElenco] = useState(false);
  const [mostraOverlay, setMostraOverlay] = useState(false);
  const [dettaglioPrenotazione, setDettaglioPrenotazione] = useState('');

  const mappaPosti = [
    [null, 1, 2, 3, 4, 5, null, 6, 7, 8, 9, 10, 'S5'],
    ['S1', 11, 12, 13, 14, 15, null, 16, 17, 18, 19, 20, 'S6'],
    ['S2', 21, 22, 23, 24, 25, null, 26, 27, 28, 29, 30, 'S7'],
    ['S3', 31, 32, 33, 34, 35, null, 36, 37, 38, 39, 40, 'S8'],
    ["S4", 41, 42, 43, 44, 45, null, 46, 47, 48, 49, 50, 'S9'],
    [null, 51, 52, 53, 54, 55, null, "S10",56, 57, 58, 59, 60],
    [61, 62, 63, 64, 65, 66, null, null,null, 67, 68, 69, 70]
  ];

  const isSedia = (val) => typeof val === 'string' && val.startsWith('S');
  const prenotazioniSpettacolo = postiPrenotati.filter(p => p.spettacolo === form.spettacolo);
  const poltronePrenotate = prenotazioniSpettacolo.filter(p => !isSedia(p.posto)).length;
  const sediePrenotate = prenotazioniSpettacolo.filter(p => isSedia(p.posto)).length;

  useEffect(() => {
    const fetchPrenotazioni = async () => {
      const snapshot = await getDocs(collection(db, 'prenotazioni'));
      const dati = snapshot.docs.map(doc => doc.data());
      setPostiPrenotati(dati);
    };

    const fetchSpettacoli = async () => {
      const snapshot = await getDocs(collection(db, 'spettacoli'));
      const dati = snapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => new Date(a.data) - new Date(b.data));
      setSpettacoli(dati);
    };

    fetchPrenotazioni();
    fetchSpettacoli();
  }, []);

  const togglePosto = (posto) => {
  if (postiSelezionati.includes(posto)) {
    setPostiSelezionati(postiSelezionati.filter(p => p !== posto));
  } else {
    setPostiSelezionati([...postiSelezionati, posto]);
  }
};


  const prenotaPosto = async () => {
    if (!form.spettacolo || postiSelezionati.length === 0 || !form.nome || !form.cognome || form.telefono.length < 8 || !form.prenotatoDa) {
      setMessaggio('Per favore compila correttamente tutti i campi.');
      return;
    }
    for (const posto of postiSelezionati) {
      await addDoc(collection(db, 'prenotazioni'), { ...form, posto });
    }
    setPostiPrenotati([...postiPrenotati, ...postiSelezionati.map(p => ({ ...form, posto: p }))]);
    setDettaglioPrenotazione(`✅ Prenotazione confermata per ${form.spettacolo} a nome ${form.cognome} ${form.nome}, posti: ${postiSelezionati.join(', ')}`);
    setMostraOverlay(true);
    setPostiSelezionati([]);
    setForm({ spettacolo: '', nome: '', cognome: '', telefono: '', accredito: false, prenotatoDa: '' });
  };

  if (mostraElenco) return <ElencoPrenotazioni />;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: "url('public\teatro.png')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen  p-4 space-y-6 max-w-6xl mx-auto overflow-x-hidden">
        {mostraOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
            <div className="bg-white text-black p-6 rounded shadow-lg max-w-md w-full text-center space-y-4">
              <h2 className="text-xl font-bold">Prenotazione Confermata</h2>
              <p>{dettaglioPrenotazione}</p>
              <button
                onClick={() => setMostraOverlay(false)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Ok
              </button>
            </div>
          </div>
        )}
        <div className="text-sm text-white flex justify-center">
  <a
    href="/"
    className={`px-4 py-2 rounded text-center me-3 ${
      window.location.pathname === "/" ? "bg-blue-400" : "bg-blue-800"
    }`}
  >
    Home
  </a>
  <a
    href="/elenco"
    className={`px-4 py-2 rounded text-center ${
      window.location.pathname === "/elenco" ? "bg-blue-400" : "bg-blue-800"
    }`}
  >
    Elenco Prenotazioni
  </a>
</div>


        <div className="text-center pt-8 pb-4">
          <h1
            className="text-white text-5xl sm:text-6xl font-extrabold tracking-wide drop-shadow-lg"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "2px",
            }}
          >
            🎭 Sipario Aperto 🎭
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <select
            className="w-full p-3 border rounded text-black"
            value={form.spettacolo}
            onChange={(e) => setForm({ ...form, spettacolo: e.target.value })}
          >
            <option value="">Seleziona lo spettacolo da prenotare</option>
            {spettacoli.map((s, i) => (
              <option key={i} value={s.titolo}>
                {s.titolo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-white text-sm">Poltrona Disponibile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-300 rounded"></div>
            <span className="text-white text-sm">Sedia Disponibile</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-white text-sm">Prenotato</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-white text-sm">Selezionato</span>
          </div>
        </div>

        {form.spettacolo && (
          <>
            {postiSelezionati.length === 0 && (
              <p className="text-center text-yellow-300 font-semibold text-sm mt-4">
                🎭 Scegli sulla piantina il tuo posto (o più posti, se le
                prenotazioni che vuoi effettuare hanno tutte lo stesso
                nominativo) prima di compilare il modulo sottostante 🎭
              </p>
            )}

            <div className="text-center text-xl font-bold text-yellow-400">
              PALCO
            </div>
            {postiSelezionati.length > 0 && (
              <p className="text-center text-white text-sm font-semibold mt-2">
                Posti selezionati: {postiSelezionati.join(", ")}
              </p>
            )}

            <div className="flex justify-center">
              <div
                className="space-y-2"
                style={{
                  transform: "scale(0.70)",
                  transformOrigin: "top center",
                }}
              >
                {mappaPosti.map((fila, i) => (
                  <div
                    key={i}
                    className="flex justify-center items-center gap-1"
                  >
                    {fila.map((valore, j) => {
                      if (valore === null)
                        return <div key={j} className="w-8 h-8"></div>;
                      const occupato = prenotazioniSpettacolo.find(
                        (p) => p.posto === valore
                      );
                      const isLaterale = isSedia(valore);
                      const isSelected = postiSelezionati.includes(valore);

                      const baseStyle =
                        "w-8 h-8 text-sm flex items-center justify-center border rounded transition";

                      return (
                        <button
                          key={valore}
                          disabled={!!occupato}
                          onClick={() => togglePosto(valore)}
                          className={`${baseStyle} ${
                            occupato
                              ? "bg-red-600 text-white cursor-not-allowed"
                              : isSelected
                              ? "bg-yellow-400 text-black"
                              : isLaterale
                              ? "bg-purple-300 text-black hover:bg-purple-400"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {valore}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center text-sm mt-4 space-x-4">
              <span className="text-green-400 font-semibold">
                Poltrone prenotate:
              </span>{" "}
              {poltronePrenotate}
              <span className="text-purple-400 font-semibold">
                Sedie prenotate:
              </span>{" "}
              {sediePrenotate}
            </div>

            
            <div className="border rounded p-4 space-y-3 shadow bg-white bg-opacity-90 text-black mt-6">
              <h2 className="font-semibold text-lg">Dati Spettatore</h2>
              <input
                className="w-full p-2 border rounded"
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                type="text"
                placeholder="Cognome"
                value={form.cognome}
                onChange={(e) => setForm({ ...form, cognome: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                type="tel"
                placeholder="Telefono (min 8 cifre)"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />

              <select
                className="w-full p-2 border rounded bg-white text-black"
                value={form.prenotatoDa}
                onChange={(e) =>
                  setForm({ ...form, prenotatoDa: e.target.value })
                }
              >
                <option value="">Prenotato da</option>
                {[
                  "Valeria",
                  "Marco",
                  "Alessandro",
                  "Luigi",
                  "Carmine",
                  "Elisabetta",
                  "Rosaria",
                  "Rosalba",
                  "Rosa",
                  "Fabrizio",
                  "Jimmy",
                  "Cristina",
                ].map((nome, i) => (
                  <option key={i} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.accredito}
                  onChange={(e) =>
                    setForm({ ...form, accredito: e.target.checked })
                  }
                />
                <span>Accredito</span>
              </label>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                onClick={prenotaPosto}
              >
                Prenota
              </button>
              {messaggio && (
                <p className="text-center text-sm text-blue-700 mt-2">
                  {messaggio}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
