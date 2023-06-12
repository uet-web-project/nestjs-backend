import axios from 'axios';

const provinceApiUrl = 'https://provinces.open-api.vn/api/';

const axiosInstance = axios.create({
  baseURL: provinceApiUrl,
});

export default axiosInstance;
