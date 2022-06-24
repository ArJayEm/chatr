import React from "react";
import SignUp from "./SignUp";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import Notifications from "./Notifications";
import Contacts from "./Contacts";
import Conversation from "./Conversation";
import "../styles/styles.css";
import AddContact from "./AddContact";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route path="/update-profile" element={<PrivateRoute />}>
              <Route exact path="/update-profile" element={<UpdateProfile />} />
            </Route>
            <Route exact path="/signup" element={<SignUp />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/forgot-password" element={<ForgotPassword />} />
            <Route exact path="/notifications" element={<Notifications />} />
            <Route exact path="/contacts" element={<Contacts />} />
            <Route exact path="/addcontact" element={<AddContact />} />
            <Route path="/conversation/:uid" element={<Conversation />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
