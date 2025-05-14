import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ElencoPrenotazioni() {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [spettacoloSelezionato, setSpettacoloSelezionato] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [idDaEliminare, setIdDaEliminare] = useState(null);
const [mostraModale, setMostraModale] = useState(false);


  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, 'prenotazioni'));
    const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPrenotazioni(dati);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
  if (!idDaEliminare) return;

  await deleteDoc(doc(db, 'prenotazioni', idDaEliminare));
  setIdDaEliminare(null);
  setMostraModale(false);
  fetchData();
};



  const esportaPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Prenotazioni – ${spettacoloSelezionato}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Posto",
          "Cognome",
          "Nome",
          "Telefono",
          "Accredito",
          "Prenotato da",
          "Pagato?",
        ],
      ],
      body: filtrate.map((p) => [
        ` Fila ${getFila(p.posto)} - ${p.posto}`,
        p.cognome,
        p.nome,
        p.telefono,
        p.accredito ? "Sì" : "No",
        p.prenotatoDa || "-",
        p.pagato 
      ]),
    });

    doc.save(`Prenotazioni_${spettacoloSelezionato.replace(/\s+/g, '_')}.pdf`);
  };

  const spettacoliDisponibili = Array.from(new Set(prenotazioni.map(p => p.spettacolo)));

  const getFila = (posto) => {
    const numero = typeof posto === 'number' ? posto : parseInt(posto.replace('S', ''));
    if (posto.toString().startsWith('S')) {
      return posto;
    }
    if (numero <= 10) return '1';
    if (numero <= 20) return '2';
    if (numero <= 30) return '3';
    if (numero <= 40) return '4';
    if (numero <= 50) return '5';
    if (numero <= 60) return '6';
    return '7';
  };

  const filtrate = spettacoloSelezionato
    ? prenotazioni
        .filter(p =>
          p.spettacolo === spettacoloSelezionato &&
          (`${p.nome} ${p.cognome}`.toLowerCase().includes(filtroNome.toLowerCase()) ||
           `${p.cognome} ${p.nome}`.toLowerCase().includes(filtroNome.toLowerCase()))
        )
        .sort((a, b) => a.cognome.localeCompare(b.cognome))
    : [];

  return (
    <div>
      <div className="text-sm text-white flex justify-center mt-4">
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
            window.location.pathname === "/elenco"
              ? "bg-blue-400"
              : "bg-blue-800"
          }`}
        >
          Elenco Prenotazioni
        </a>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Elenco Prenotazioni
        </h1>
{mostraModale && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
      <h2 className="text-lg font-bold">Conferma eliminazione</h2>
      <p>Sei sicuro di voler cancellare questa prenotazione?</p>
      <div className="flex justify-center space-x-4 pt-4">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Elimina
        </button>
        <button
          onClick={() => {
            setMostraModale(false);
            setIdDaEliminare(null);
          }}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
        >
          Annulla
        </button>
      </div>
    </div>
  </div>
)}

        <div className="w-full flex justify-center px-4">
          <select
            className="w-full max-w-md p-2 border rounded bg-white text-black"
            value={spettacoloSelezionato}
            onChange={(e) => setSpettacoloSelezionato(e.target.value)}
          >
            <option value="">Seleziona uno spettacolo</option>
            {spettacoliDisponibili.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {spettacoloSelezionato && (
          <div className="w-full flex justify-center px-4 mt-4 text-white">
            <input
              type="text"
              placeholder="Cerca prenotazione per nominativo"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="w-full max-w-md p-2 border rounded bg-black text-white"
            />
          </div>
        )}

        {filtrate.length > 0 && (
          <div className="mb-4 mt-4 text-center">
            <button
              onClick={esportaPDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm text-center"
            >
              📄 Scarica elenco prenotazioni in PDF
            </button>
          </div>
        )}
        {filtrate.length > 0 ? (
          <div className="space-y-4">
            {filtrate.map((p) => (
              <div
                key={p.id}
                className="border rounded p-3 bg-white text-black shadow-sm text-sm sm:text-base"
              >
                <p>
                  <strong>🎫 Posto:</strong> Fila {getFila(p.posto)} - Posto{" "}
                  {p.posto}
                </p>
                <p>
                  <strong>👤 Nominativo:</strong> {p.cognome} {p.nome}
                </p>
                <p>
                  <strong>📞 Telefono:</strong> {p.telefono}
                </p>
                <p>
                  <strong>🎟️ Accredito:</strong> {p.accredito ? "Sì" : "No"}
                </p>
                <p>
                  <strong>📝 Prenotato da:</strong> {p.prenotatoDa || "-"}
                </p>
                <div className="pt-2">
                  <button
  onClick={() => {
    setIdDaEliminare(p.id);
    setMostraModale(true);
  }}
  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
>
  Cancella
</button>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">
            {spettacoloSelezionato
              ? "Nessuna prenotazione trovata per lo spettacolo selezionato."
              : "Seleziona uno spettacolo per visualizzare le prenotazioni."}
          </p>
        )}
      </div>
    </div>
  );
}