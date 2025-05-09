import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import NotesList from "./NotesList";
import Search from "./Search";
import Header from "./Header";
import logger from "../utils/logger";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const MainApp = () => {
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const data = {
      id: user.id,
    };
    const fetchData = async () => {
      try {
        const response = await axios.post(BASE_URL + "/v1/notes/user", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        });
        if (response.status === 200) {
          console.log("response", response);
          const savedNotes = response.data;
          logger.info("parsed savedNotes: ", savedNotes);
          if (savedNotes) {
            setNotes(savedNotes);
          }
        } else {
          logger.error("could not get notes", { response });
          setError("Backend issue getting notes");
          setNotes([]);
        }
      } catch (error) {
        logger.error("error", error);
        setError("Backend issue getting notes");
      }
    };

    fetchData();
  }, []);

  const addNote = async (text) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const newNote = {
      id: uuid(),
      user_id: user.id,
      text: text,
    };

    const response = await axios.post(
      BASE_URL + "/v1/notes",
      JSON.stringify(newNote),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      },
    );

    if (response.status === 201) {
      const newNotes = [...notes, newNote];
      setNotes(newNotes);
      logger.info("added now note: " + newNote);
    } else {
      logger.error("could not save new note", { response });
      setError("Backend issue sending a note");
      setNotes(notes);
    }
  };

  const deleteNote = async (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await axios.delete(BASE_URL + "/v1/notes/" + id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.token,
      },
    });
    logger.info("response", response);
    if (response.status === 200) {
      console.log("response", response);
      logger.info("removed note", id);
    } else {
      logger.error("could not delete note", { response });
      setError("Backend issue delete note");
    }

    const newNotes = notes.filter((note) => note.id !== id);
    logger.info("deleted note with ID: " + id);
    setNotes(newNotes);
  };

  return (
    <div className={`${darkMode && "dark-mode"}`}>
      <div className="container">
        <Header handleToggleDarkMode={setDarkMode} />
        <Search handleSearchNote={setSearchText} />
        {error && <p>{error}</p>}
        <NotesList
          notes={notes.filter((note) =>
            note.text.toLowerCase().includes(searchText),
          )}
          handleAddNote={addNote}
          handleDeleteNote={deleteNote}
        />
      </div>
    </div>
  );
};

export default MainApp;
