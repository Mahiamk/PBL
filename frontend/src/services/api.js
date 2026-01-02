import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000', // Connects to FastAPI
    withCredentials: true,
});

export default API;