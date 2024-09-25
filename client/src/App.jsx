// =========================== IMPORTS ===========================
import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================== PAGE IMPORTS ===========================
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import Settings from "./pages/Settings";
import Databases from "./pages/Databases";
import Tables from "./pages/Tables";
import TableCreate from "./pages/TableCreate";

function App() {
  return (    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/logout" element={<Logout />}/>
        <Route path="/settings" element={<Settings />}/>
        <Route path="/databases" element={<Databases />}/>
        <Route path="/tables" element={<Tables />}/>
        <Route path="/table_create" element={<TableCreate />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
