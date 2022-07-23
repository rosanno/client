import { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
  Avatar,
  Menu,
  ListItemButton,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Logout from "@mui/icons-material/Logout";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import axiosClient from "../axios/axiosClient";
import { setBoards } from "../redux/features/boardSlice";
import { useDispatch } from "react-redux";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Link from "next/link";
import FavoritesList from "./FavoritesList";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Sidebar = ({ open, setOpen }) => {
  const theme = useTheme();
  const router = useRouter();
  const { boardsId } = router.query;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const boards = useSelector((state) => state.board.value);
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await axiosClient.get("boards");
        dispatch(setBoards(res));
      } catch (error) {
        console.log(error);
      }
    };

    getBoards();
  }, [dispatch]);

  useEffect(() => {
    const activeItem = boards.findIndex((e) => e.id === boardsId);
    if (boards.length > 0 && boardsId === undefined) {
      router.push(`/boards/${boards[0].id}`);
    }

    setActiveIndex(activeItem);
  }, [boards, boardsId, router]);

  const addBoard = async () => {
    setAnchorEl(null);
    try {
      const res = await axiosClient.post("boards");
      const newList = [res, ...boards];
      dispatch(setBoards(newList));
      router.push(`/boards/${res.id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const onDragEnd = async ({ source, destination }) => {
    const newList = [...boards];
    const [removed] = newList.splice(source.index, 1);
    newList.splice(destination.index, 0, removed);

    const activeItem = newList.findIndex((e) => e.id === boardsId);
    setActiveIndex(activeItem);
    dispatch(setBoards(newList));

    try {
      await axiosClient.put("boards", { boards: newList });
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    typeof window !== "undefined" && localStorage.removeItem("token");
    router.push("/login");
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Typography variant="h6" noWrap component="div">
              Kanban App
            </Typography>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  style={{ textTransform: "uppercase" }}
                >
                  {user.username.slice(0, 1)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={isOpen}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem>
              <Avatar />
              <Typography variant="span" textTransform="capitalize">
                {user.username}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={addBoard}>
              <ListItemIcon>
                <AddBoxIcon fontSize="small" />
              </ListItemIcon>
              Add Boards
            </MenuItem>
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <FavoritesList />
        </List>
        <List>
          <ListItem>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Task Boards" />
          </ListItem>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              key={"list-board-droppable"}
              droppableId={"list-board-droppable"}
            >
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {boards.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Link href={`/boards/${item.id}`}>
                          <ListItemButton
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            selected={index === activeIndex}
                            sx={{
                              pl: "20px",
                              cursor: snapshot.isDragging
                                ? "grab"
                                : "pointer!important",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="700"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                marginLeft: "50px",
                              }}
                            >
                              {item.icon} {item.title}
                            </Typography>
                          </ListItemButton>
                        </Link>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
