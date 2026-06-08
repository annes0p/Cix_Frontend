import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventarios from "./pages/Inventarios";
import Login from "./pages/Login";
import Movimientos from "./pages/Movimientos";
import Clientes from "./pages/Clientes";
import OrdenesCompra from "./pages/OrdenesCompra";
import Proveedores from "./pages/Proveedores";
import Reportes from "./pages/Reportes";
import Alertas from "./pages/Alertas";
import Configuracion from "./pages/Configuracion";

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
                    <Route path="/ordenes" element={<OrdenesCompra />} />
                    <Route path="/proveedores" element={<Proveedores />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/alertas" element={<Alertas />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;