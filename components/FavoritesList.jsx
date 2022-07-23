import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import axiosClient from "../axios/axiosClient";
import { setFavouriteList } from "../redux/features/favouriteSlice";
import { useRouter } from "next/router";
import Link from "next/link";

const FavoritesList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { boardsId } = router.query;
  const list = useSelector((state) => state.favourites.value);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await axiosClient.get("boards/favourites");
        dispatch(setFavouriteList(res));
      } catch (error) {
        console.log(error);
      }
    };

    getBoards();
  }, []);

  useEffect(() => {
    const index = list.findIndex((e) => e.id === boardsId);
    setActiveIndex(index);
  }, [list, boardsId]);

  const onDragEnd = async ({ source, destination }) => {
    const newList = [...list];
    const [removed] = newList.splice(source.index, 1);
    newList.splice(destination.index, 0, removed);

    const activeItem = newList.findIndex((e) => e.id === boardsId);
    setActiveIndex(activeItem);
    dispatch(setFavouriteList(newList));

    try {
      await axiosClient.put("boards/favourites", { boards: newList });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <ListItem>
        <ListItemIcon>
          <StarBorderIcon />
        </ListItemIcon>
        <ListItemText primary="Favorites" />
      </ListItem>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          key={"list-board-droppable"}
          droppableId={"list-board-droppable"}
        >
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {list.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
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
    </>
  );
};

export default FavoritesList;
