import api from "./api";

export const getConfiguracion = async () => {
    const response = await api.get("/settings");
    return response.data.data || response.data;
};

export const actualizarConfiguracion = async (configuracion) => {
    const response = await api.put("/settings", configuracion);
    return response.data.data || response.data;
};
