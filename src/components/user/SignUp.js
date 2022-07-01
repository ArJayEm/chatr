import { useRef, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmpasswordRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  //const history = useNavigate();
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== confirmpasswordRef.current.value) {
      return setError("Passwords do not match.");
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      setMessage("Registration successful!");
      emailRef.current.value = "";
      passwordRef.current.value = "";
      confirmpasswordRef.current.value = "";
      //history("/");
    } catch (e) {
      setLoading(false);
      console.error(e.message);
      return setError("Failed to sign in.");
    }

    setLoading(false);
  }

  return (
    <>
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Sign Up</h2>
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
                <Form.Group id="confirm-password" className="mt-2">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={confirmpasswordRef}
                    autoComplete="on"
                    required
                  />
                </Form.Group>
                <Button disabled={loading} className="w-100 mt-4" type="submit">
                  Sign Up
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
