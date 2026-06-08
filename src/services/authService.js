import api from '../api/axios';

export const authService = {
    login: async (identifier, password) => {
        try {
            const response = await api.post('/auth/login', {
                identifier,
                password,
            });

            const token = response.data?.data?.auth?.accessToken;
            const user = response.data?.data?.user;

            if (token) {
                localStorage.setItem('token', token);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error al conectar con el servidor';
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};