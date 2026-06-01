import api from "./api";

export const getMovimientos = async (params = {}) => {
    const response = await api.get("/movimientos", { params });
    return response.data.data || response.data;
};

export const getMovimientoById = async (id) => {
    const response = await api.get(`/movimientos/${id}`);
    return response.data.data || response.data;
};

export const getKpisMovimientos = async () => {
    const response = await api.get("/movimientos/kpis");
    return response.data.data || response.data;
};

export const crearMovimiento = async (data) => {
    const response = await api.post("/movimientos", data);
    return response.data.data || response.data;
};

export const actualizarMovimiento = async (id, data) => {
    const response = await api.put(`/movimientos/${id}`, data);
    return response.data.data || response.data;
};
