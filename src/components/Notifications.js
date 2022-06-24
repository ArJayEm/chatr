import React from "react";
import { Link } from "react-router-dom";
import { Card, Container } from "react-bootstrap";
import NavigationBar from "./NavigationBar";

export default function Notifications() {
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
              <h2 className="text-center mb-4">Notifications</h2>
              <div className="w-100 text-center mt-2">
                <Link to="/" style={{ textDecoration: "none" }}>
                  <span>{"<"}</span> Back
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}
