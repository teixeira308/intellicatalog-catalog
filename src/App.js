import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Catalogo from './components/Catalogo'; // Importe o componente que captura o valor da URL
 

function App() {
  return (
    <BrowserRouter basename="/c">
      <Routes>
        <Route path="/:capturedValue" element={<Catalogo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;