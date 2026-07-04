import api from "./api";

export const getCatalogoPublico = async () => {
    const response = await api.get("/public/catalog");
    return response.data.data || response.data;
};

export const crearVentaPublica = async (payload) => {
    const response = await api.post("/public/sales", payload);
    return response.data.data || response.data;
};

export const buscarDocumentoPublico = async (tipo, numero) => {
    const response = await api.get(`/public/document-lookup/${tipo}/${numero}`);
    return response.data.data || response.data;
};
