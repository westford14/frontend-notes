import React, { useState, useContext } from "react";
import axios from "axios";
import logger from "../utils/logger";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";
import { AuthContext } from "./AuthContext";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_USER = process.env.REACT_APP_ADMIN_USER;

const LoginPage = ({}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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
          const data = JSON.stringify({
            username: username,
            password_hash: dbPassword,
          });
          const loginResponse = await axios.post(
            BASE_URL + "/v1/auth/login",
            data,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + adminResponse.data.access_token,
              },
            },
          );

          const loggedInUser = {
            name: username,
            token: loginResponse.data.access_token,
            id: response.data.id,
          };
          login(loggedInUser);
          navigate("/home");
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
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </p>
    </div>
  );
};

export default LoginPage;
