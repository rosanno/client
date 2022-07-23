import axiosClient from "../axios/axiosClient";

const authUtils = {
  isAuthenticated: async () => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return false;

    try {
      const res = await axiosClient.post("auth/verify-token");
      return res.user;
    } catch {
      return false;
    }
  },
};

export default authUtils;
