import React, { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { useRouter } from "next/router";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import axiosClient from "../../axios/axiosClient";
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { setBoards } from "../../redux/features/boardSlice";
import EmojiPicker from "../../components/EmojiPicker";
import Kanban from "../../components/Kanban";
import { setFavouriteList } from "../../redux/features/favouriteSlice";

let timer;
const timeout = 500;

const Boards = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { boardsId } = router.query;
  const favouriteList = useSelector((state) => state.favourites.value);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [icon, setIcon] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const boards = useSelector((state) => state.board.value);

  useEffect(() => {
    const getBoard = async () => {
      try {
        const res = await axiosClient.get(`boards/${boardsId}`);
        console.log(res.sections);
        setTitle(res.title);
        setDescription(res.description);
        setSections(res.sections);
        setIsFavourite(res.favourite);
        setIcon(res.icon);
      } catch (error) {
        console.log(error);
      }
    };

    getBoard();
  }, [boardsId]);

  const onIconChange = async (newIcon) => {
    let temp = [...boards];
    const index = temp.findIndex((e) => e.id === boardsId);
    temp[index] = { ...temp[index], icon: newIcon };

    if (isFavourite) {
      let tempFavourite = [...favouriteList];
      const favouriteIndex = tempFavourite.findIndex((e) => e.id === boardId);
      tempFavourite[favouriteIndex] = {
        ...tempFavourite[favouriteIndex],
        icon: newIcon,
      };
      dispatch(setFavouriteList(tempFavourite));
    }

    setIcon(newIcon);
    dispatch(setBoards(temp));
    try {
      await axiosClient.put(`boards/${boardsId}`, { icon: newIcon });
    } catch (error) {}
  };

  const updateTitle = async (e) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    setTitle(newTitle);

    let temp = [...boards];
    const index = temp.findIndex((e) => e.id === boardsId);
    temp[index] = { ...temp[index], title: newTitle };

    if (isFavourite) {
      let tempFavourite = [...favouriteList];
      const favouriteIndex = tempFavourite.findIndex((e) => e.id === boardsId);
      tempFavourite[favouriteIndex] = {
        ...tempFavourite[favouriteIndex],
        title: newTitle,
      };
      dispatch(setFavouriteList(tempFavourite));
    }

    dispatch(setBoards(temp));

    timer = setTimeout(async () => {
      try {
        await axiosClient.put(`boards/${boardsId}`, { title: newTitle });
      } catch (err) {
        console.log(err);
      }
    }, timeout);
  };

  const updateDescription = async (e) => {
    clearTimeout(timer);
    const newDescription = e.target.value;
    setDescription(newDescription);
    timer = setTimeout(async () => {
      try {
        await axiosClient.put(`boards/${boardsId}`, {
          description: newDescription,
        });
      } catch (err) {
        console.log(err);
      }
    }, timeout);
  };

  const createSection = async () => {
    setAnchorEl(null);
    try {
      const section = await axiosClient.post(`boards/${boardsId}/sections`);
      console.log(section);
      setSections([...sections, section]);
    } catch (error) {
      console.log(error);
    }
  };

  const addFavourite = async () => {
    setAnchorEl(null);
    try {
      const board = await axiosClient.put(`boards/${boardsId}`, {
        favourite: !isFavourite,
      });
      let newFavouriteList = [...favouriteList];
      if (isFavourite) {
        newFavouriteList = newFavouriteList.filter((e) => e.id !== boardsId);
      } else {
        newFavouriteList.unshift(board);
      }
      dispatch(setFavouriteList(newFavouriteList));
      setIsFavourite(!isFavourite);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteBoard = async () => {
    setAnchorEl(null);
    try {
      await axiosClient.delete(`boards/${boardsId}`);
      if (isFavourite) {
        const newFavouriteList = favouriteList.filter((e) => e.id !== boardsId);
        dispatch(setFavouriteList(newFavouriteList));
      }

      const newList = boards.filter((e) => e.id !== boardsId);
      if (newList.length === 0) {
        router.push("/");
      } else {
        router.push(`/boards/${newList[0].id}`);
      }
      dispatch(setBoards(newList));
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <Box>
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            onClose={handleClose}
            open={open}
          >
            <MenuItem
              sx={{
                display: "flex",
                alignItems: "center",
              }}
              onClick={createSection}
            >
              <ListItemIcon>
                <AddBoxOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Add Section
            </MenuItem>
            <MenuItem
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
              onClick={addFavourite}
            >
              <ListItemIcon>
                {isFavourite ? (
                  <StarOutlinedIcon color="warning" />
                ) : (
                  <StarBorderOutlinedIcon fontSize="small" />
                )}
              </ListItemIcon>
              Add To Favorites
            </MenuItem>
            <MenuItem
              sx={{
                display: "flex",
                alignItems: "center",
              }}
              onClick={deleteBoard}
            >
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" />
              </ListItemIcon>
              Delete board
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Box
        sx={{
          padding: "10px 50px",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <EmojiPicker icon={icon} onChange={onIconChange} />
            <TextField
              value={title}
              onChange={updateTitle}
              placeholder="Untitled"
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-input": { padding: 0 },
                "& .MuiOutlinedInput-notchedOutline": { border: "unset " },
                "& .MuiOutlinedInput-root": {
                  fontSize: "2rem",
                  fontWeight: "700",
                },
              }}
            />
          </Box>
          <TextField
            value={description}
            onChange={updateDescription}
            placeholder="Add a description"
            variant="outlined"
            multiline
            fullWidth
            sx={{
              "& .MuiOutlinedInput-input": { padding: 0 },
              "& .MuiOutlinedInput-notchedOutline": { border: "unset " },
              "& .MuiOutlinedInput-root": { fontSize: "0.8rem" },
            }}
          />
        </Box>
        <Box>
          <Kanban data={sections} boardsId={boardsId} />
        </Box>
      </Box>
    </>
  );
};

Boards.getLayout = AppLayout;

export default Boards;
