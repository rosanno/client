import axios from "axios";
import queryString from "query-string";

const getToken = () =>
  typeof window !== "undefined" && localStorage.getItem("token");

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  paramsSerializer: (params) => queryString.stringify({ params }),
});

axiosClient.interceptors.request.use(async (config) => {
  return {
    ...config,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${getToken()}`,
    },
  };
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
  },
  (err) => {
    if (!err.response) {
      return console.log(err);
    }
    throw err.response;
  }
);

export default axiosClient;
