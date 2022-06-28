import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert, Container, Image } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
//import { useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import defaultUser from "../images/default_user.jpg";
import QRCode from "react-qr-code";
import { auth } from "../firebase";

export default function UpdateProfile() {
  const displayNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmpasswordRef = useRef();
  const { currentUser, updateEmail, updatePassword, updateName } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  //const history = useNavigate();
  const displayName = currentUser.displayName ?? currentUser.email;
  const updatable = !currentUser.providerData.map(
    (e) => e.providerId === "password"
  )[0];
  //const providerId = currentUser.providerData.map((e) => e.providerId)[0];

  useEffect(
    (updatable, providerId) => {
      //setLoading("Loading...");
      var msg = updatable
        ? "You registered using " + providerId + ". Can't be updated."
        : "";
      setMessage(msg);
      //console.log(msg);
      //setLoading("");
    },
    //eslint-disable-next-line
    []
  );

  function handleSubmit(e) {
    e.preventDefault();

    const promises = [];
    setLoading(true);
    setError("");
    setMessage("");

    if (passwordRef.current.value !== confirmpasswordRef.current.value) {
      return setError("Passwords do not match.");
    }
    if (displayNameRef.current.value == null) {
      return setError("Display name is required.");
    }

    if (displayNameRef.current.value !== currentUser.displayName) {
      promises.push(updateName(displayNameRef.current.value));
    }
    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then(() => {
        //history("/");
        setMessage("Profile saved.");
      })
      .catch(() => {
        setLoading(false);
        //console.log("yawa: " + yawa);
        //console.log(promises);
        setError("Failed to update");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleOnError() {}

  return (
    <>
      <NavigationBar />
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center">Profile</h2>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="w-100 text-center mb-2">
                <Image
                  roundedCircle
                  onError={() => handleOnError}
                  src={(currentUser && currentUser.photoURL) || defaultUser}
                  alt=""
                  style={{ width: "6em" }}
                />
                <div style={{ background: "white", padding: "16px" }}>
                  <QRCode
                    value={auth.currentUser.providerData[0].uid}
                    fgColor="#198754"
                    size="144"
                    title={displayName}
                  />
                </div>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Group id="displayName" className="mb-2">
                  <label>Name</label>
                  <Form.Control
                    type="text"
                    ref={displayNameRef}
                    required
                    defaultValue={displayName}
                    disabled={true}
                  />
                </Form.Group>
                <Form.Group id="email" className="mb-2">
                  <label>Email</label>
                  <Form.Control
                    type="email"
                    ref={emailRef}
                    required
                    defaultValue={currentUser.email}
                    disabled={updatable}
                  />
                </Form.Group>
                <Form.Group id="password" className="mb-2">
                  <label>Password</label>
                  <Form.Control
                    type="password"
                    ref={passwordRef}
                    autoComplete="on"
                    placeholder="Leave blank to keep the same password"
                    disabled={updatable}
                  />
                </Form.Group>
                <Form.Group id="confirm-password" className="mb-2">
                  <label>Confirm Password</label>
                  <Form.Control
                    type="password"
                    ref={confirmpasswordRef}
                    autoComplete="on"
                    placeholder="Leave blank to keep the same password"
                    disabled={updatable}
                  />
                </Form.Group>
                <div
                  className="w-100 mt-4"
                  style={{
                    display: "grid",
                    gridGap: "0.5em",
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <Button
                    variant="light"
                    disabled={loading}
                    href="/"
                    type="button"
                  >
                    Back
                  </Button>
                  <Button
                    variant="success"
                    disabled={updatable || loading}
                    type="submit"
                  >
                    Update
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          {/* <div className="w-100 text-center mt-2">
            <Link to="/" style={{ textDecoration: "none" }}>
              Back
            </Link>
          </div> */}
        </div>
      </Container>
    </>
  );
}
