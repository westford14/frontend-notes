import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logger from "../utils/logger";
import "../styles/AuthForm.css";
import bcrypt from "bcryptjs";
import axios from "axios";
import { v4 as uuid } from "uuid";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_USER = process.env.REACT_APP_ADMIN_USER;

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    logger.info("Signing up with:", email, username);

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
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const data = JSON.stringify({
        id: uuid(),
        username: username,
        email: email,
        password_hash: hashedPassword,
        password_salt: salt,
        active: true,
        roles: "admin",
      });
      const response = await axios.post(BASE_URL + "/v1/users", data, {
        headers: {
          "Content-Type": "application/json; charset=utf8",
          Authorization: "Bearer " + adminResponse.data.access_token,
        },
      });
      logger.info("response: ", response);

      if (response.status === 201) {
        logger.info("signup attempt succeeded", { username });
        setSubmitted(true);
      } else {
        logger.error("signup attempt failed", { username });
        setError(response);
      }
    } catch (error) {
      logger.error("signup attempt", { error });
      setError("Could not signup due to backend error");
    }
  };

  return (
    <div>
      {!submitted ? (
        <div className="auth-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <br />
            <input
              type="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <br />
            {error && <p>{error}</p>}
            <button type="submit">Sign Up</button>
          </form>
          <p>
            Already have an account?{" "}
            <button onClick={() => navigate("/")}>Login</button>
          </p>
        </div>
      ) : (
        <div className="auth-container">
          <h2>Success!</h2>
          <p>Thank you for signing up, {username}.</p>
          <p>
            Return home to login?{" "}
            <button onClick={() => navigate("/")}>Login</button>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
