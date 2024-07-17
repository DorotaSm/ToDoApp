import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import GradientCircularProgress from "./Loader"; // Assuming this is a custom loader component

import ToDoTask from "./ToDoTask"; // Assuming this is the component for displaying tasks
import { Modal } from "react-bootstrap";
import "react-bootstrap/dist/react-bootstrap.min.js"; // Importing React Bootstrap JavaScript
import "react-datetime-picker/dist/DateTimePicker.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Importing Bootstrap CSS
import "react-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css"; // Assuming this is for date/time picker styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

function ToDoList() {
  const [lists, setLists] = useState([]); // State for storing lists
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [selectedList, setSelectedList] = useState(null); // State for tracking selected list
  const [isModalNewListOpen, setIsModalNewListOpen] = useState(false); // State for new list modal

  // Fetch data from MockAPI on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch lists from MockAPI
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list"
      );
      setLists(response.data); // Set fetched lists to state
      console.log(response.data); // Logging fetched data (optional)
    } catch (error) {
      setError(error); // Handle and set error state
    } finally {
      setLoading(false); // Set loading state to false after fetch attempt
    }
  };

  // Handle click on list item to toggle open/close
  const handleListClick = (listId) => {
    if (selectedList === listId) {
      setSelectedList(null); // Close list if already open
    } else {
      setSelectedList(listId); // Open clicked list
    }
  };

  // Function to add a new list
  const addList = async (listData) => {
    try {
      const response = await axios.post(
        `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list`,
        { title: listData }
      );
      fetchData(); // Refresh lists after adding new list
      setIsModalNewListOpen(false); // Close modal after adding list
    } catch (error) {
      setError(error); // Handle and set error state
    }
  };

  // Function to delete a list and its tasks
  const deleteList = async (listId) => {
    try {
      let tasksToDelete = [];
      try {
        const response = await axios.get(
          `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}/tasks`
        );
        tasksToDelete = response.data; // Get tasks associated with list
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`No tasks found for list with id ${listId}.`);
        } else {
          throw error; // Throw other errors
        }
      }

      // Delete tasks associated with the list
      if (tasksToDelete.length > 0) {
        await Promise.all(
          tasksToDelete.map(async (task) => {
            await axios.delete(
              `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}/tasks/${task.id}`
            );
          })
        );
      }

      await axios.delete(
        `https://6694dd694bd61d8314c8f53e.mockapi.io/ToDoAPI/list/${listId}`
      ); // Delete the list itself

      fetchData(); // Refresh lists after deletion
    } catch (error) {
      setError(error); // Handle and set error state
    }
  };

  // Open modal to create new list
  const handleOpenModalNewList = () => {
    setIsModalNewListOpen(true);
  };

  // Close modal to create new list
  const handleCloseModalNewList = () => {
    setIsModalNewListOpen(false);
  };

  // Loading state
  if (loading) {
    return <GradientCircularProgress />; // Show loading spinner while fetching data
  }

  // Error state
  if (error) {
    return <div>Error: {error.message}</div>; // Show error message if fetch fails
  }

  // Render UI
  return (
    <div>
      {/* Header section */}
      <div className="header">
        <h1>Work that should be done</h1>
        {/* Button to open new list modal */}
        <button className="button type1" onClick={handleOpenModalNewList}>
          Create new List
        </button>
      </div>

      {/* Modal for creating new list */}
      <Modal
        show={isModalNewListOpen}
        onHide={handleCloseModalNewList}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Title for New List:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Enter list title"
            id="listTitle"
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          {/* Close modal button */}
          <button
            className="btn btn-secondary"
            onClick={handleCloseModalNewList}>
            Close
          </button>
          {/* Save new list button */}
          <button
            className="btn btn-primary"
            onClick={() => addList(document.getElementById("listTitle").value)}>
            Save
          </button>
        </Modal.Footer>
      </Modal>

      {/* Grid container for displaying lists */}
      <div className="grid-container">
        {/* Mapping through lists and rendering each list */}
        {lists.map((list) => (
          <div key={list.id} className="grid-item">
            <h2>{list.title}</h2>
            {/* Container for list actions */}
            <div className="button-container">
              {/* Button to delete list */}
              <button
                onClick={() => deleteList(list.id)}
                className="delete-button">
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>

              {/* Button to toggle task visibility */}
              <button
                onClick={() => handleListClick(list.id)}
                className="toggle-button">
                {/* Toggle button icon based on selected list state */}
                {selectedList === list.id ? (
                  <FontAwesomeIcon icon={faChevronUp} />
                ) : (
                  <FontAwesomeIcon icon={faChevronDown} />
                )}
              </button>
            </div>

            {/* Render tasks if list is selected */}
            {selectedList === list.id && <ToDoTask listId={list.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToDoList;
