import React from "react";
import { useNavigate } from "react-router-dom";

import Dashboard from "../app/Dashboard";

export default function Logout() {
  const history = useNavigate();

  function handleCancel() {
    history("/");
  }

  return (
    <div>
      <Dashboard />
      <div id="LogoutModal" className="modal">
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}
