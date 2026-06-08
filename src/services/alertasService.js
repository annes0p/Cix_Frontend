import api from "./api";

export const getAlertas = async () => {
    const response = await api.get("/inventory");
    return response.data.data || response.data;
};
