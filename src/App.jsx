import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Alertas from "./pages/Alertas";
import Clientes from "./pages/Clientes";
import Configuracion from "./pages/Configuracion";
import CRM from "./pages/CRM";
import Dashboard from "./pages/Dashboard";
import Incidencias from "./pages/Incidencias";
import Inventarios from "./pages/Inventarios";
import Login from "./pages/Login";
import Movimientos from "./pages/Movimientos";
import OrdenesCompra from "./pages/OrdenesCompra";
import Proveedores from "./pages/Proveedores";
import Recomendador from "./pages/Recomendador";
import Reportes from "./pages/Reportes";
import Rutas from "./pages/Rutas";
import Seguimiento from "./pages/Seguimiento";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/recomendador-publico"
                    element={<Recomendador />}
                />
                <Route path="/seguimiento/:token" element={<Seguimiento />} />
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
                    <Route path="/recomendador" element={<Recomendador />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/incidencias" element={<Incidencias />} />
                    <Route path="/rutas" element={<Rutas />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;
