import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventarios from "./pages/Inventarios";
import Login from "./pages/Login";
import Movimientos from "./pages/Movimientos";
import Clientes from "./pages/Clientes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventarios" element={<Inventarios />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/clientes" element={<Clientes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
