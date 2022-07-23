import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import Moment from "moment";
import axiosClient from "../axios/axiosClient";
import TaskModal from "./TaskModal";

const LINES_TO_SHOW = 2;

const useStyles = makeStyles({
  multiLineEllipsis: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    "-webkit-line-clamp": LINES_TO_SHOW,
    "-webkit-box-orient": "vertical",
  },
});

let timer;
const timeout = 500;

const Kanban = (props) => {
  const boardsId = props.boardsId;
  const classes = useStyles();
  const user = useSelector((state) => state.user.value);
  const [data, setData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  const getNewData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`boards/${boardsId}`);
      setData(res.sections);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;
    const sourceColIndex = data.findIndex((e) => e.id === source.droppableId);
    const destinationColIndex = data.findIndex(
      (e) => e.id === destination.droppableId
    );
    const sourceCol = data[sourceColIndex];
    const destinationCol = data[destinationColIndex];

    const sourceSectionId = sourceCol.id;
    const destinationSectionId = destinationCol.id;

    const sourceTasks = [...sourceCol.tasks];
    const destinationTasks = [...destinationCol.tasks];

    if (source.droppableId !== destination.droppableId) {
      const [removed] = sourceTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, removed);
      data[sourceColIndex].tasks = sourceTasks;
      data[destinationColIndex].tasks = destinationTasks;
    } else {
      const [removed] = destinationTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, removed);
      data[destinationColIndex].tasks = destinationTasks;
    }

    try {
      await axiosClient.put(`boards/${boardsId}/tasks/update-position`, {
        resourceList: sourceTasks,
        destinationList: destinationTasks,
        resourceSectionId: sourceSectionId,
        destinationSectionId: destinationSectionId,
      });
      getNewData();
    } catch (error) {
      console.log(error);
    }
  };

  const createTask = async (sectionId) => {
    setAnchorEl(null);
    try {
      const task = await axiosClient.post(`boards/${boardsId}/tasks`, {
        sectionId,
      });
      const newData = [...data];
      const index = newData.findIndex((e) => e.id === sectionId);
      newData[index].tasks.unshift(task);
      setData(newData);
    } catch (error) {
      console.log(error);
    }
  };

  const updateSectionTitle = async (e, sectionId) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    const newData = [...data];
    const index = newData.findIndex((e) => e.id === sectionId);
    newData[index].title = newTitle;
    setData(newData);
    timer = setTimeout(async () => {
      try {
        await axiosClient.put(`boards/${boardsId}/sections/${sectionId}`, {
          title: newTitle,
        });
      } catch (err) {
        console.log(err);
      }
    }, timeout);
  };

  const deleteSection = async (sectionId) => {
    setAnchorEl(null);
    try {
      await axiosClient.delete(`boards/${boardsId}/sections/${sectionId}`);
      const newData = [...data].filter((e) => e.id !== sectionId);
      setData(newData);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (task) => {
    console.log(task);
    try {
      await axiosClient.delete(`boards/${boardsId}/tasks/${task.id}`);
      const newData = [...data];
      const sectionIndex = newData.findIndex((e) => e.id === task.section.id);
      const taskIndex = newData[sectionIndex].tasks.findIndex(
        (e) => e.id === task.id
      );
      newData[sectionIndex].tasks.splice(taskIndex, 1);
      setData(newData);
    } catch (error) {
      console.log(error);
    }
  };

  const onUpdateTask = (task) => {
    const newData = [...data];
    const sectionIndex = newData.findIndex((e) => e.id === task.section.id);
    const taskIndex = newData[sectionIndex].tasks.findIndex(
      (e) => e.id === task.id
    );
    newData[sectionIndex].tasks[taskIndex] = task;
    setData(newData);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            width: "calc(100vw - 400px)",
            overflowX: "auto",
          }}
        >
          {data.map((section) => (
            <div key={section.id} style={{ width: "300px" }}>
              <Droppable key={section.id} droppableId={section.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      width: "300px",
                      padding: "10px",
                      marginRight: "10px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "background.default",
                      }}
                    >
                      <TextField
                        value={section.title}
                        onChange={(e) => updateSectionTitle(e, section.id)}
                        placeholder="Untitled"
                        variant="outlined"
                        sx={{
                          flexGrow: 1,
                          "& .MuiOutlinedInput-input": { padding: 0 },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "unset ",
                          },
                          "& .MuiOutlinedInput-root": {
                            fontSize: "1rem",
                            fontWeight: "700",
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => createTask(section.id)}
                        sx={{
                          color: "gray",
                          "&:hover": { color: "green" },
                        }}
                      >
                        <AddOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteSection(section.id)}
                        sx={{
                          color: "gray",
                          "&:hover": { color: "orange" },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {/* Task */}
                    {section.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              padding: "10px",
                              marginTop: "10px",
                              cursor: snapshot.isDragging
                                ? "grab"
                                : "pointer!important",
                            }}
                          >
                            <Box onClick={() => setSelectedTask(task)}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "0 10px",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                  }}
                                >
                                  {task.title === "" ? "Untitled" : task.title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                  }}
                                >
                                  {Moment(task.createdAt).format("DD MMM YYYY")}
                                </Typography>
                              </Box>
                              <CardContent>
                                <Typography
                                  variant="p"
                                  fontSize="small"
                                  className={classes.multiLineEllipsis}
                                >
                                  {task.content === ""
                                    ? "..."
                                    : task.content.replace(/(<([^>]+)>)/gi, "")}
                                </Typography>
                              </CardContent>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0 10px",
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 25,
                                  height: 25,
                                  overflow: "hidden",
                                  textTransform: "uppercase",
                                }}
                              >
                                {user.username.slice(0, 1)}
                              </Avatar>
                              <CardActions>
                                <IconButton
                                  onClick={() => deleteTask(task)}
                                  sx={{
                                    color: "gray",
                                    "&:hover": { color: "orange" },
                                  }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </CardActions>
                            </Box>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </div>
          ))}
        </Box>
      </DragDropContext>
      <TaskModal
        task={selectedTask}
        boardsId={boardsId}
        onClose={() => setSelectedTask(undefined)}
        onUpdate={onUpdateTask}
      />
    </>
  );
};

export default Kanban;
