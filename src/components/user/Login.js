import { useRef, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";

import {
  auth, facebookProvider,
  githubProvider, googleProvider
} from "../../firebase";
import { useAuth } from "../context/AuthContext";

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
    load();

    try {
      await login(emailRef.current.value, passwordRef.current.value);
      //saveUser();
      history("/");
    } catch (e) {
      catchError(e, "Login failed. (" + e.code.replace("auth/", "") + ")");
    }
  }

  async function handleOnClick(provider) {
    load();

    if (provider == null) {
      setLoading(false);
      return setError("Invalid provider.");
    }

    try {
      await auth.signInWithPopup(provider);
      //saveUser();
      history("/");
    } catch (e) {
      catchError(e, "Login failed. (" + e.code.replace("auth/", "") + ")");
    }
  }

  function load() {
    setMessage("");
    setError("");
    setLoading(true);
  }

  function catchError(e, msg) {
    setLoading(false);
    console.error(e.message);
    return setError(msg);
  }

  return (
    <Container
      id="Login"
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
                disabled={loading}
                variant="success"
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
        {/* <div class="fb-login-button" data-width="" data-size="medium" data-button-type="continue_with" data-layout="default" data-auto-logout-link="false" data-use-continue-as="true"></div> */}

        <Button
          className="login-provider mt-4"
          onClick={() => handleOnClick(googleProvider)}
        >
          <Icon.Google className="google" /> Continue with Google
        </Button>
        <Button
          className="login-provider"
          onClick={() => handleOnClick(facebookProvider)}
        >
          <Icon.Facebook className="facebook" /> Continue with Facebook
        </Button>
        <Button
          className="login-provider"
          onClick={() => handleOnClick(githubProvider)}
        >
          <Icon.Github className="github" /> Continue with GitHub
        </Button>
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </Container>
  );
}
