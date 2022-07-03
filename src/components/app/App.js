// import { ErrorBoundary } from "react-error-boundary";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  //useNavigate,
} from "react-router-dom";

import "../../styles/styles.css";

import Dashboard from "../app/Dashboard";
import PrivateRoute from "../app/PrivateRoute";
import AddContact from "../contacts/AddContact";
import Contacts from "../contacts/Contacts";
import { AuthProvider } from "../context/AuthContext";
import Conversation from "../messages/Conversation";
import Notifications from "../messages/Notifications";
import ForgotPassword from "../user/ForgotPassword";
import Login from "../user/Login";
import Logout from "../user/Logout";
import SignUp from "../user/SignUp";
import UpdateProfile from "../user/UpdateProfile";
import NotFound from "./NotFound";

function App() {
  // const history = useNavigate();

  // function ErrorFallBack(error, resetErrorBoundary) {
  //   return (
  //     <div role="alert">
  //       <p>Something went wrong: </p>
  //       <pre>{error.message}</pre>
  //       <button onClick={resetErrorBoundary}>Try again</button>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* <ErrorBoundary FallbackComponent={ErrorFallBack} onReset={history("/")}>
      </ErrorBoundary> */}

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
