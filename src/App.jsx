import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Inventarios from "./pages/Inventarios";
import Login from "./pages/Login";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/inventarios" element={<Inventarios />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
