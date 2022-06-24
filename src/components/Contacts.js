import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Container, Alert, Button, Image } from "react-bootstrap";
import { auth, firestore } from "../firebase";
import AddIcon from "mdi-react/AddIcon";
import defaultUser from "../images/default_user.jpg";

export default function Contacts() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState(null);
  const history = useNavigate();

  let usersCollection = firestore.collection("users");

  useEffect(
    () => {
      if (auth.currentUser != null) {
        getUser();
      } else {
        history("/login");
      }
    },
    //eslint-disable-next-line
    []
  );

  async function getUser() {
    load();
    var doc = usersCollection.doc(auth.currentUser.uid);

    await doc
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setUser(snapshot.data());

          if (snapshot.data().isLoggedIn) {
            let userContacts = snapshot.data().contacts.map((e) => e.uid) ?? [];
            if (userContacts.length > 0) {
              getContacts(userContacts);
            }
          } else {
            history("/login");
          }
        }
        setLoading(false);
      })
      .finally(() => {})
      .catch((e) => {
        catchError(e, "get-user-error.");
      });
  }

  async function getContacts(userContacts) {
    load();

    await usersCollection
      .where("uid", "in", userContacts)
      .get()
      .then((snapshots) => {
        setContacts(snapshots.docs.map((e) => e.data()));
        console.log(contacts);
        setLoading(false);
      })
      .finally(() => {})
      .catch((e) => {
        catchError(e, "get-contacts-error.");
      });
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

  function handleOnClick(uid) {
    history("/conversation/" + uid);
  }

  function handleOnError() {}

  return (
    <>
      <Container
        className="d-flex justify-content-center mt-4"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              {/* <h2 className="text-center mb-4">Messages</h2> */}
              <div className="w-100 text-center mt-2">
                <Link variant="button" to="/addcontact">
                  <Button variant="success" className="w-100 mb-2">
                    <AddIcon /> Add Contact
                  </Button>
                </Link>
                <Link to="/" style={{ textDecoration: "none" }}>
                  Reload
                </Link>
                <ul id="Contacts" className="mt-2">
                  {!loading && contacts ? (
                    contacts.map((contact) => {
                      return (
                        <li
                          key={contact.uid}
                          //className={i === 0 ? "active" : ""}
                          id={contact.uid}
                          onClick={() => handleOnClick(contact.uid)}
                        >
                          <div className="user-icon">
                            <Image
                              roundedCircle
                              onError={() => handleOnError}
                              src={
                                (contact && contact.providerData.photoURL) ||
                                defaultUser
                              }
                              alt="photoURL"
                              style={{ width: "3em" }}
                            />
                            <span
                              className={
                                contact.isLoggedIn ? "logged-in" : "logged-out"
                              }
                            >
                              ●
                            </span>
                          </div>
                          <span>
                            <strong>{contact.displayName}</strong>
                            <small>{"{message.last}"}</small>
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li>No Contacts yet T_T...</li>
                  )}
                </ul>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}
