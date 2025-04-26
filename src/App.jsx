import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import MainApp from "./components/MainApp";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <MainApp />
      )}
    </div>
  );
}

export default App;
