// =========================== IMPORTS ===========================
import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================== PAGE IMPORTS ===========================
import Home from "./common/pages/Home";
import Dashboard from "./common/pages/Dashboard";
import Logout from "./common/pages/Logout";
import Settings from "./common/pages/Settings";
import Databases from "./common/pages/Databases";
import Tables from "./common/pages/Tables";
import TableCreate from "./common/pages/TableCreate";
import TableEdit from "./common/pages/TableEdit";
import TableView from "./common/pages/TableView";

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
        <Route path="/table_edit" element={<TableEdit />}/>
        <Route path="/table_view" element={<TableView />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
