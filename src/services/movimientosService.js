import api from "./api";

export const getSales = async () => {
    const response = await api.get("/sales");
    return response.data.data || response.data;
};

export const getSaleById = async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data.data || response.data;
};

export const crearSale = async (data) => {
    const response = await api.post("/sales", data);
    return response.data.data || response.data;
};

export const actualizarMovimiento = async (id, data) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data.data || response.data;
};
