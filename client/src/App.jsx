// =========================== IMPORTS ===========================
import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================== PAGE IMPORTS ===========================
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import Settings from "./pages/Settings";

function App() {
  return (    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/logout" element={<Logout />}/>
        <Route path="/settings" element={<Settings />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
