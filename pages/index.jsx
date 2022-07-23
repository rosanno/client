import { useState } from "react";
import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import AppLayout from "../layout/AppLayout";
import axiosClient from "../axios/axiosClient";
import { setBoards } from "../redux/features/boardSlice";

const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const createBoard = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post("boards");
      dispatch(setBoards([res]));
      router.push(`/boards/${res.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoadingButton
        variant="outlined"
        color="success"
        onClick={createBoard}
        loading={loading}
      >
        Click here to create your first board
      </LoadingButton>
    </Box>
  );
};

Home.getLayout = AppLayout;

export default Home;
