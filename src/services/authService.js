import api from "./api";

export const authService = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", {
                identifier,
                password,
            });
            const { auth, user } = response.data.data;
            localStorage.setItem("token", auth.accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al conectar con el servidor";
        }
    },
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
};