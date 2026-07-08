import api from "./api";

export const getSeguimientoPublico = async (token) => {
    const response = await api.get(`/tracking/public/${token}`);
    return response.data.data || response.data;
};

export const getLinkSeguimiento = async (idTrip) => {
    const response = await api.get(`/tracking/${idTrip}/link`);
    const data = response.data.data || response.data;
    return data.token;
};

export const enviarUbicacion = async (idTrip, latitude, longitude) => {
    await api.patch(`/tracking/${idTrip}/location`, { latitude, longitude });
};

export const calificarEntrega = async (token, rating) => {
    const response = await api.patch(`/tracking/public/${token}/rating`, {
        rating,
    });
    return response.data.data || response.data;
};

// Chat (no chatbot) entre cliente y personal sobre un envio puntual.
export const getMensajesPublico = async (token) => {
    const response = await api.get(`/tracking/public/${token}/messages`);
    return response.data.data || response.data;
};

export const enviarMensajePublico = async (token, content) => {
    const response = await api.post(`/tracking/public/${token}/messages`, {
        content,
    });
    return response.data.data || response.data;
};

export const getMensajesRuta = async (idTrip) => {
    const response = await api.get(`/tracking/${idTrip}/messages`);
    return response.data.data || response.data;
};

export const enviarMensajeRuta = async (idTrip, content) => {
    const response = await api.post(`/tracking/${idTrip}/messages`, {
        content,
    });
    return response.data.data || response.data;
};
