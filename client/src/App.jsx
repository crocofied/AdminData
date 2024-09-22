// =========================== IMPORTS ===========================
import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================== PAGE IMPORTS ===========================
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  return (    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
