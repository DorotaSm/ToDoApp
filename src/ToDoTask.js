import React, { useState, useEffect } from "react";
import { Modal, Dropdown } from "react-bootstrap"; // Importing Bootstrap components
import axios from "axios"; // Importing axios for HTTP requests
import DateTimePicker from "react-datetime-picker"; // Importing datetime picker component
import "react-bootstrap/dist/react-bootstrap.min.js"; // Importing React Bootstrap JavaScript
import "react-datetime-picker/dist/DateTimePicker.css"; // Importing datetime picker CSS
import "bootstrap/dist/css/bootstrap.min.css"; // Importing Bootstrap CSS
import "react-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css"; // Importing datetime picker CSS
import GradientCircularProgress from "./Loader"; // Assuming this is a custom loader component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // FontAwesome for icons
import { faPlus, faEdit } from "@fortawesome/free-solid-svg-icons"; // Icons for add and edit tasks
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"; // Icon for delete task
import Form from "react-bootstrap/Form"; // Form component from React Bootstrap

const ToDoTask = ({ listId }) => {
  const [tasks, setTasks] = useState([]); // State for storing tasks
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [isModalOpen, setIsModalOpen] = useState(false); // State for task modal
  const [taskData, setTaskData] = useState({
    // State for task data
    title: "New Task",
    description: "",
    dueDate: new Date(),
    priority: "",
  });
  const [editingTaskId, setEditingTaskId] = useState(null); // State for tracking editing task ID

  // Effect to fetch tasks when listId changes or on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true); // Set loading state
        setError(null); // Reset error state
        const response = await axios.get(
          `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}/tasks`
        );

        if (response.status === 200) {
          setTasks(response.data); // Set tasks from API response
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setTasks([]); // Set empty tasks array if not found
          setError(null); // Reset error state
        } else {
          setError(error); // Set error state for other errors
        }
      } finally {
        setLoading(false); // Set loading state to false
      }
    };

    fetchTasks(); // Invoke fetchTasks function
  }, [listId]); // Dependency array to run effect when listId changes

  // Function to add a task to the list
  const addTaskToList = async (taskData) => {
    try {
      const response = await axios.post(
        `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}/tasks`,
        taskData
      );
      setTasks((prevTasks) => [...prevTasks, response.data]); // Add new task to tasks state
    } catch (error) {
      setError(error); // Set error state if request fails
    }
  };

  // Function to delete a task from the list
  const deleteTaskFromList = async (taskId) => {
    try {
      await axios.delete(
        `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}/tasks/${taskId}`
      );
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId)); // Remove task from tasks state
    } catch (error) {
      setError(error); // Set error state if request fails
    }
  };

  // Function to edit a task in the list
  const editTaskInList = async (taskId, updatedTaskData) => {
    try {
      const response = await axios.put(
        `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}/tasks/${taskId}`,
        updatedTaskData
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? response.data : task))
      ); // Update task in tasks state
    } catch (error) {
      setError(error); // Set error state if request fails
    }
  };

  // Function to handle checkbox change (mark task as completed or incomplete)
  const handleCheckboxChange = async (taskId, event) => {
    const updatedTask = tasks.find((task) => task.id === taskId); // Find task to update
    const updatedTaskData = { ...updatedTask, completed: event.target.checked }; // Update task data
    await editTaskInList(taskId, updatedTaskData); // Call editTaskInList function
  };

  // Function to handle input change for task form fields
  const handleInputChange = (e) => {
    if (!e || !e.target) {
      console.error("Event object or event target is undefined:", e);
      return;
    }
    const { id, value } = e.target; // Extract id and value from event target
    if (!id) {
      console.error("Input element id is undefined");
      return;
    }
    setTaskData((prevData) => ({
      ...prevData,
      [id]: value, // Update taskData state with new value
    }));
  };

  // Function to handle date change in datetime picker
  const handleDateChange = (date) => {
    setTaskData((prevData) => ({
      ...prevData,
      dueDate: date, // Update dueDate in taskData state
    }));
  };

  // Function to handle priority change in dropdown
  const handlePriorityChange = (priority) => {
    setTaskData((prevData) => ({
      ...prevData,
      priority: priority, // Update priority in taskData state
    }));
  };

  // Function to save task (either add new task or edit existing task)
  const handleSave = async () => {
    if (editingTaskId) {
      await editTaskInList(editingTaskId, taskData); // Edit existing task
    } else {
      await addTaskToList(taskData); // Add new task
    }
    setIsModalOpen(false); // Close modal after saving task
    setTaskData({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "",
    }); // Reset taskData state
    setEditingTaskId(null); // Reset editingTaskId state
  };

  // Function to open modal for editing existing task
  const handleOpenModalEdit = (task) => {
    setEditingTaskId(task.id); // Set editing task ID
    setTaskData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
    }); // Set taskData state with existing task details
    setIsModalOpen(true); // Open modal
  };

  // Function to open modal for adding new task
  const handleOpenModalNew = () => {
    setEditingTaskId(null); // Reset editing task ID
    setTaskData({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "",
    }); // Reset taskData state
    setIsModalOpen(true); // Open modal
  };

  // Function to close modal and reset taskData and editingTaskId states
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
    setTaskData({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "",
    }); // Reset taskData state
    setEditingTaskId(null); // Reset editingTaskId state
  };

  // Function to format date in specified format
  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const date = new Date(dateString); // Create new Date object from dateString
    return date.toLocaleDateString("en-GB", options); // Return formatted date string (adjust locale as needed)
  }

  // Loading state
  if (loading) {
    return <GradientCircularProgress />; // Show loading spinner while fetching data
  }

  // Error state
  if (error) {
    return <div>Error fetching tasks: {error.message}</div>; // Show error message if fetch fails
  }

  // Render UI
  return (
    <div>
      {/* Display list of tasks */}
      <div>
        <ul className="task-list">
          {tasks.length === 0 ? (
            <p>No tasks</p> // Show message if no tasks
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="task-item">
                {/* Task header with title and actions */}
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <div className="task-actions">
                    {/* Button to edit task */}
                    <button
                      onClick={() => handleOpenModalEdit(task)}
                      className="edit-button">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {/* Button to delete task */}
                    <button
                      onClick={() => deleteTaskFromList(task.id)}
                      className="delete-button">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
                {/* Task details */}
                <div className="task-details">
                  <p className="task-description">
                    Description: {task.description}
                  </p>
                  {/* Checkbox to mark task as completed or incomplete */}
                  <Form.Check
                    className="task-checkbox"
                    type="checkbox"
                    id={`checkbox-${task.id}`}
                    label={task.completed ? "Completed" : "Incomplete"}
                    checked={task.completed}
                    onChange={(event) => handleCheckboxChange(task.id, event)}
                  />
                  <p className="task-priority">Priority: {task.priority}</p>
                  {/* Display due date */}
                  <p className="task-due-date">
                    Due Date: {formatDate(task.dueDate)}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Button to add new task */}
      <button onClick={handleOpenModalNew} className="add-task-button">
        <FontAwesomeIcon
          icon={faPlus}
          className="plus-icon"
          size="2x"
          style={{ color: "#7e69cc" }}
        />
        <span className="button-text">Add Task</span>
      </button>

      {/* Modal for adding/editing task */}
      <Modal show={isModalOpen} onHide={handleCloseModal} centered>
        <Modal.Header>
          <Modal.Title>
            {editingTaskId ? "Edit Task" : "Add New Task"}
          </Modal.Title>
          <button type="button" className="close" onClick={handleCloseModal}>
            &times;
          </button>
        </Modal.Header>
        <Modal.Body>
          {/* Form inputs for task details */}
          <label>
            Title
            <input
              type="text"
              placeholder="Title"
              id="title"
              value={taskData.title}
              onChange={handleInputChange}
              className="form-control"
            />
          </label>
          <label>
            Description
            <input
              type="text"
              placeholder="Description"
              id="description"
              value={taskData.description}
              onChange={handleInputChange}
              className="form-control"
            />
          </label>
          <label>
            Due Date
            <DateTimePicker
              onChange={handleDateChange}
              value={taskData.dueDate}
              format="dd-MM-yyyy"
              inputProps={{
                id: "dueDate",
                className: "form-control",
              }}
            />
          </label>

          {/* Dropdown for selecting task priority */}
          <label>
            Priority
            <Dropdown onSelect={(e) => handlePriorityChange(e)}>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {taskData.priority ? taskData.priority : "Select Priority"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="High">High</Dropdown.Item>
                <Dropdown.Item eventKey="Medium">Medium</Dropdown.Item>
                <Dropdown.Item eventKey="Low">Low</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </label>
        </Modal.Body>
        <Modal.Footer>
          {/* Buttons to cancel or save task */}
          <button onClick={handleCloseModal} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Task
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ToDoTask;
