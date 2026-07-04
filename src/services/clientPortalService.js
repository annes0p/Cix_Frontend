import api from "./api";

export const getPedidosPorDocumento = async (docNumber) => {
    const response = await api.get(`/public/clients/${docNumber}/orders`);
    return response.data.data || response.data;
};

export const getIncidenciasPorDocumento = async (docNumber) => {
    const response = await api.get(`/public/clients/${docNumber}/incidents`);
    return response.data.data || response.data;
};

export const reportarIncidenciaPublica = async (payload) => {
    const response = await api.post("/public/clients/incidents", payload);
    return response.data.data || response.data;
};
