import axios from "axios";

// 1. .env dosyasından API adresini oku
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Tüm istekler için standart bir axios istemcisi oluştur
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // (Gelecekte cookie/session kullanırsak diye)
});

// 3. (Opsiyonel ama Önemli) Hata yakalama interceptor'ı
// Backend'den gelen 500, 404 gibi hataları konsolda net görelim
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API İsteği Hatası:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
