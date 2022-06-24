import React, { useRef, useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
//import socialMediaAuth from "../context/AuthSocialMedia";
import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
} from "../firebase";
import FacebookIcon from "mdi-react/FacebookIcon";
import GoogleIcon from "mdi-react/GoogleIcon";
import GithubIcon from "mdi-react/GithubIcon";

export default function Continue() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useNavigate();
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await login(emailRef.current.value, passwordRef.current.value);
      //saveUser();
      history("/");
    } catch (e) {
      setLoading(false);
      console.error(e.message);
      return setError("Login failed. (" + e.code.replace("auth/", "") + ")");
    }
  }

  async function handleOnClick(provider) {
    setMessage("");
    setError("");
    setLoading(true);

    if (provider == null) {
      setLoading(false);
      return setError("Invalid provider.");
    }

    try {
      await auth.signInWithPopup(provider);
      //saveUser();
      history("/");
    } catch (e) {
      setLoading(false);
      console.error(e.message);
      return setError("Login failed. (" + e.code.replace("auth/", "") + ")");
    }
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Log In</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
              </Form.Group>
              <Form.Group id="password" className="mt-2">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  ref={passwordRef}
                  autoComplete="on"
                  required
                />
              </Form.Group>
              <Button
                variant="success"
                disabled={loading}
                className="w-100 mt-4"
                type="submit"
              >
                Log In
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </Card.Body>
        </Card>
        <hr />
        {/* <div class="fb-login-button" data-width="" data-size="medium" data-button-type="continue_with" data-layout="default" data-auto-logout-link="false" data-use-continue-as="true"></div> */}
        <Button
          variant="primary"
          className="w-100 mt-1"
          onClick={() => handleOnClick(facebookProvider)}
        >
          <FacebookIcon style={{ float: "left" }} />
          <span> Continue with Facebook</span>
        </Button>
        <Button
          variant="light"
          className="w-100 mt-1"
          style={{
            backgroundColor: "#fd7e14",
            color: "#fff",
          }}
          onClick={() => handleOnClick(googleProvider)}
        >
          <GoogleIcon style={{ float: "left" }} />
          <span> Continue with Google</span>
        </Button>
        <Button
          variant="secondary"
          className="w-100 mt-1"
          onClick={() => handleOnClick(githubProvider)}
        >
          <GithubIcon className="" style={{ float: "left" }} />
          <span> Continue with GitHub</span>
        </Button>
        <hr />
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </Container>
  );
}
