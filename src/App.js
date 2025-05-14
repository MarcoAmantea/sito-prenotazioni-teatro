import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrenotazioniTeatro from './pages/PrenotazioniTeatro';
import ElencoPrenotazioni from './pages/ElencoPrenotazioni';

function App() {
  return (
    <Router>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: "url('/teatro.png')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="min-h-screen bg-black bg-opacity-70 p-4">
          <Routes>
            <Route path="/" element={<PrenotazioniTeatro />} />
            <Route path="/elenco" element={<ElencoPrenotazioni />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;