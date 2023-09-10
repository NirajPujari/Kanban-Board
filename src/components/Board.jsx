//Import necessary modules and styles
import React, { useEffect, useState } from "react";
import "./styles/Board.css";

//The Board component
function Board() {
  //State to manage tasks and edited tasks
  const [tasks, setTasks] = useState({
    todo: [],
    inprogress: [],
    done: [],
  });

  const [editedTask, setEditedTask] = useState(null);

  useEffect(() => {
    //Function to fetch data and add tasks with a delay
    const fetchDataAndAddTasks = async () => {
      try {
        //Fetch data from the API
        const response = await fetch("https://data-mdlx.onrender.com/data");
        //Parse the response as JSON
        const json = await response.json();
        console.log(json);

        //Iterate through the columns and tasks in the JSON data
        for (const columnData of json) {
          const column = columnData[0];
          const tasks = columnData[1];

          //Add tasks with a delay
          await addTasksWithDelay(tasks, column);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    //Function to add tasks with a delay
    const addTasksWithDelay = async (tasks, column) => {
      for (const task of tasks) {
        //Add a delay of 500ms between tasks
        await new Promise((resolve) => setTimeout(resolve, 500));

        //Update the state to add the task to the specified column
        setTasks((prevTasks) => ({
          ...prevTasks,
          [column]: [...prevTasks[column], task],
        }));
      }
    };

    //Set up a timer to fetch data and add tasks when the component mounts
    const timer = setTimeout(() => {
      fetchDataAndAddTasks();
      console.log("useEffect ran");
    }, 500);

    //Clean up the timer when the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, []);

  //Function to handle the addition of a task.
  const handleAddTask = (taskText, deckdescription, column) => {
    //Create a new task object with the provided text, description, and column
    //We are not providing id because we will fetch id from api endpoint.
    const newTask = {
      text: taskText,
      description: deckdescription,
      column: column,
    };

    //Make a POST request to your API to add the new task
    fetch(`https://data-mdlx.onrender.com/data/${Date.now()}`, {
      method: "POST", //HTTP POST method to send data to the server
      headers: {
        "Content-Type": "application/json", //Set the content type to JSON
      },
      body: JSON.stringify(newTask), //Convert the task object to JSON and send it as the request body
    })
      .then((response) => {
        //Check if the response is OK (status code 200)
        if (!response.ok) {
          //If the response is not OK, throw an error with the response status text
          throw new Error(`Failed to add task: ${response.statusText}`);
        }
        //Parse the response as JSON
        return response.json();
      })
      .then((addedTask) => {
        //Update the state to include the newly added task in the specified column
        setTasks((prevTasks) => ({
          ...prevTasks,
          [column]: [...prevTasks[column], addedTask], //Add the added task to the specified column
        }));
      })
      .catch((error) => {
        //Handle any errors that occur during the fetch operation
        console.error("Error adding task:", error);
      });
  };

  //Function to handle the deletion of a task.
  const handleDeleteTask = (taskId, column) => {
    //Send a DELETE request to the server to remove the task with the given taskId.
    fetch(`https://data-mdlx.onrender.com/data/${taskId}`, {
      method: "DELETE", //Specify the HTTP DELETE method.
    })
      .then((response) => {
        //Check the response status code returned by the server.
        if (response.status === 200) {
          //If the status code is 200 (OK), it means the task was successfully deleted on the server.
          //Update the 'tasks' state to remove the deleted task from the specified column.
          setTasks((prevTasks) => ({
            ...prevTasks,
            [column]: prevTasks[column].filter((task) => task.id !== taskId),
          }));
        } else if (response.status === 500) {
          //If the status code is 500 (Internal Server Error), log an error indicating the server encountered an issue.
          console.error(`Failed to delete task: ${response.statusText}`);
        } else {
          //If the status code is neither 200 nor 500, log an error indicating that the task was not found.
          console.error("Task not found");
        }
      })
      .catch((error) => {
        //If an error occurs during the fetch request (e.g., network issue), log the error.
        console.error("Error deleting task:", error);
      });
  };

  //Function to handle editing a task with a new text and description
  const handleEditTask = (taskId, newText, newDescription) => {
    //Check if there's no editedTask, return early
    if (!editedTask) {
      return;
    }

    //Make a PUT request to update the task with the provided taskId
    fetch(`https://data-mdlx.onrender.com/data/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: newText, description: newDescription }),
    })
      .then((response) => {
        //Check if the response status is 200 (OK)
        if (response.status === 200) {
          //If the update was successful, update the state (tasks) with the new text and description
          setTasks((prevTasks) => ({
            ...prevTasks,
            [editedTask.column]: prevTasks[editedTask.column].map((task) =>
              task.id === taskId
                ? { ...task, text: newText, description: newDescription }
                : task
            ),
          }));

          //Reset the editedTask to null, indicating that editing is complete
          setEditedTask(null);
        } else {
          //If the response status is not 200, log an error message
          console.error(`Failed to update task: ${response.statusText}`);
        }
      })
      .catch((error) => {
        //Handle any errors that occur during the fetch operation
        console.error("Error updating task:", error);
      });
  };

  //This function is called when the "Edit" button on a task card is clicked.
  const handleEditClick = (taskId, column) => {
    //It sets the edited task information, which includes the taskId and column, in the state.
    //This helps track which task is being edited and in which column it belongs.
    setEditedTask({ taskId, column });
  };

  //This function is used to cancel the editing mode of a task.
  //It sets the `editedTask` state to `null`, indicating that no task is currently being edited.
  const handleCancelEdit = () => {
    setEditedTask(null); //Set `editedTask` to `null` to exit editing mode.
  };

  const isEditing = (taskId) => {
    //Check if 'editedTask' is truthy (i.e., there is an edited task) and if the taskId matches the one being checked.
    return editedTask && editedTask.taskId === taskId;
  };

  //This function is called when a task card is dragged.
  //It sets the data to be transferred during the drag-and-drop operation.
  const handleDragStart = (e, taskId, column) => {
    //Set the task ID and column as data to be transferred.
    e.dataTransfer.setData("taskId", taskId); //taskId: Unique identifier for the task
    e.dataTransfer.setData("column", column); //column: The current column of the task
  };

  //This function is called when a draggable element is being dragged over a drop target.
  const handleDragOver = (e) => {
    //Prevent the default behavior of the browser, which is to not allow dropping.
    e.preventDefault();
  };

  const handleDrop = (e, column) => {
    //Get the taskId and sourceColumn from the data transferred during the drag
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumn = e.dataTransfer.getData("column");

    //Check if the task is being dropped into a different column
    if (sourceColumn !== column) {
      //Find the task with the taskId in the sourceColumn
      const task = tasks[sourceColumn].find((task) => task.id === taskId);

      //Delete the task from the sourceColumn
      handleDeleteTask(task.id, sourceColumn);

      //Add the task to the destination column
      handleAddTask(task.text, task.description, column);
    }
  };

  return (
    <div className="App">
      <h1 className="header">Kanban Board</h1>
      <div className="columns">
        <div
          className="column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
        >
          <h2 className="header-board">To Do</h2>
          <ul className="cards">
            {tasks.todo.map((task) => (
              <li
                className={`card ${isEditing(task.id) ? "editing" : ""}`}
                key={task.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, task.id, "todo")}
              >
                {isEditing(task.id) ? (
                  <>
                    <input
                      type="text"
                      value={editedTask.text}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, text: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTask(
                            task.id,
                            editedTask.text,
                            editedTask.description
                          );
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={editedTask.description}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          description: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTask(
                            task.id,
                            editedTask.text,
                            editedTask.description
                          );
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <button onClick={() => handleCancelEdit()}>Cancel</button>
                  </>
                ) : (
                  <>
                    <h3>{task.text}</h3>
                    <p>{task.description}</p>
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(task.id, "todo")}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTask(task.id, "todo")}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
            <li className="card-input">
              <input id="todo-title" type="text" placeholder="Add a title" />
              <input
                id="todo-desc"
                type="text"
                placeholder="Add the description"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  var title = document.getElementById("todo-title").value;
                  var desc = document.getElementById("todo-desc").value;
                  handleAddTask(title, desc, "todo");
                  document.getElementById("todo-title").value = "";
                  document.getElementById("todo-desc").value = "";
                }}
              >
                Add task
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="columns">
        <div
          className="column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "inprogress")}
        >
          <h2 className="header-board">In Progress</h2>
          <ul className="cards">
            {tasks.inprogress.map((task) => (
              <li
                className={`card ${isEditing(task.id) ? "editing" : ""}`}
                key={task.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, task.id, "inprogress")}
              >
                {isEditing(task.id) ? (
                  <>
                    <input
                      type="text"
                      value={editedTask.text}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, text: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTask(
                            task.id,
                            editedTask.text,
                            editedTask.description
                          );
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={editedTask.description}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          description: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTask(
                            task.id,
                            editedTask.text,
                            editedTask.description
                          );
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <button onClick={() => handleCancelEdit()}>Cancel</button>
                  </>
                ) : (
                  <>
                    <h3>{task.text}</h3>
                    <p>{task.description}</p>
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(task.id, "inprogress")}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTask(task.id, "inprogress")}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
            <li className="card-input">
              <input
                id="inprogress-title"
                type="text"
                placeholder="Add a title"
              />
              <input
                id="inprogress-desc"
                type="text"
                placeholder="Add the description"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  var title = document.getElementById("inprogress-title").value;
                  var desc = document.getElementById("inprogress-desc").value;
                  handleAddTask(title, desc, "inprogress");
                  document.getElementById("inprogress-title").value = "";
                  document.getElementById("inprogress-desc").value = "";
                }}
              >
                Add task
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="columns">
        <div
          className="column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
        >
          <h2 className="header-board">Done</h2>
          <ul className="cards">
            {tasks.done.map((task) => (
              <li
                className={`card ${isEditing(task.id) ? "editing" : ""}`}
                key={task.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, task.id, "done")}
              >
                {isEditing(task.id) ? (
                  <>
                    <input
                      type="text"
                      value={editedTask.text}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, text: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTask(
                            task.id,
                            editedTask.text,
                            editedTask.description
                          );
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={editedTask.description}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          description: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTask(
                            task.id,
                            editedTask.text,
                            editedTask.description
                          );
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <button onClick={() => handleCancelEdit()}>Cancel</button>
                  </>
                ) : (
                  <>
                    <h3>{task.text}</h3>
                    <p>{task.description}</p>
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(task.id, "done")}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTask(task.id, "done")}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
            <li className="card-input">
              <input id="done-title" type="text" placeholder="Add a title" />
              <input
                id="done-desc"
                type="text"
                placeholder="Add the description"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  var title = document.getElementById("done-title").value;
                  var desc = document.getElementById("done-desc").value;
                  handleAddTask(title, desc, "done");
                  document.getElementById("done-title").value = "";
                  document.getElementById("done-desc").value = "";
                }}
              >
                Add task
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Board;
