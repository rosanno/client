// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axiosClient from "../../../axios/axiosClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const user = req.body;

    const response = await axiosClient.post("auth/login", user);
    res.status(200).json(response);
  }
}
