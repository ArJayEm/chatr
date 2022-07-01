import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  //HashRouter,
} from "react-router-dom";

import "../../styles/styles.css";

import Dashboard from "../app/Dashboard";
import PrivateRoute from "../app/PrivateRoute";
import Conversation from "../messages/Conversation";
import Contacts from "../contacts/Contacts";
import AddContact from "../contacts/AddContact";
import Notifications from "../messages/Notifications";
import { AuthProvider } from "../context/AuthContext";
import ForgotPassword from "../user/ForgotPassword";
import Login from "../user/Login";
import SignUp from "../user/SignUp";
import UpdateProfile from "../user/UpdateProfile";
import NotFound from "./NotFound";
import Logout from "../user/Logout";

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
            <Route component={NotFound} />
            <Route exact path="/logout" element={<Logout />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
