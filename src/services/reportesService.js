import api from "./api";

export const getReportesInventario = async () => {
    const response = await api.get("/inventory");
    return response.data.data || response.data;
};

export const getReportesMovimientos = async () => {
    const response = await api.get("/movements");
    return response.data.data || response.data;
};

export const getReportesCompras = async () => {
    const response = await api.get("/purchases");
    return response.data.data || response.data;
};