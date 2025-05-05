import React, { useState } from "react";
import axios from "axios";
import logger from "../utils/logger";
import bcrypt from "bcryptjs";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_USER = process.env.REACT_APP_ADMIN_USER;

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    logger.info("login attempt starting", { username });

    const adminResponse = await axios.post(BASE_URL + "/v1/auth/token", {
      username: ADMIN_USER,
    });

    if (adminResponse.status === 200) {
      logger.info("token gathering succeeded", { username });
    } else {
      logger.error("token gathering attempt failed", { username });
      setError(adminResponse.data.message);
    }

    try {
      const response = await axios.get(
        BASE_URL + "/v1/users/username/" + username,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + adminResponse.data.access_token,
          },
        },
      );

      if (response.status === 200) {
        logger.info("login attempt succeeded", { username });
        const dbPassword = response.data.password_hash;
        if (bcrypt.compareSync(password, dbPassword)) {
          onLoginSuccess();
        } else {
          logger.error("login attempt failed", { username });
          setError(response.data.message);
        }
      } else {
        logger.error("login attempt failed", { username });
        setError(response.data.message);
      }
    } catch (error) {
      logger.error("failed login attempt", { error });
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};

export default LoginPage;
