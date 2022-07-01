/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Alert, Container, Form, Image } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";

export default function Contacts() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState(null);
  const history = useNavigate();
  const contactsRef = useRef("");

  let usersCollection = firestore.collection("users");
  let userContacts = [];
  // usersCollection
  //   .doc(auth.currentUser.uid)
  //   .get()
  //   .then((snapshot) => {
  //     setUser(snapshot.data());
  //     userContacts = snapshot.data().contacts.map((e) => e.uid) ?? [];
  //   });
  // let contactsCollection =
  //   userContacts.length > 0
  //     ? usersCollection.where("uid", "in", userContacts)
  //     : usersCollection;
  // let [contacts] = useCollectionData(contactsCollection);

  useEffect(
    () => {
      //if (auth.currentUser != null) {
      getUser();
      // } else {
      //   history("/login");
      // }
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
            //history("/login");
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
        setLoading(false);
      })
      .finally(() => {})
      .catch((e) => {
        catchError(e, "get-contacts-error.");
      });
  }

  function handleOnClick(uid) {
    history("/conversation/" + uid);
  }

  function handleOnSearch() {
    if (contactsRef.current.value) {
    }
  }

  function handleOnError() {}

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
    <>
      <Container id="ContactsDiv">
        <div className="card">
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form
            id="SearchUserCode"
            className="form mb-dot5"
            onSubmit={handleOnSearch}
          >
            <input
              type="text"
              //maxLength="12"
              className="form-control form"
              placeholder="Search..."
              ref={contactsRef}
            />
            <button
              className="btn"
              type="submit"
              title="Search"
              onError={() => handleOnError()}
              // onClick={() => handleOnSearch()}
            >
              <Icon.Search />
            </button>
            <Link className="btn" variant="button" to="/addcontact">
              <Icon.Plus />
            </Link>
          </Form>
          <ul id="Contacts" className="contacts">
            {loading ? (
              <>
                <li className="loading-contact">
                  <div className="user-icon">
                    <Image
                      roundedCircle
                      src={defaultUserImage}
                      style={{ width: "3em" }}
                    />
                  </div>
                  <span>
                    <strong>&nbsp;</strong>
                    <small>&nbsp;</small>
                  </span>
                </li>
                <li className="loading-contact">
                  <div className="user-icon">
                    <Image
                      roundedCircle
                      src={defaultUserImage}
                      style={{ width: "3em" }}
                    />
                  </div>
                  <span>
                    <strong>&nbsp;</strong>
                    <small>&nbsp;</small>
                  </span>
                </li>
              </>
            ) : contacts ? (
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
                          defaultUserImage
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
        </div>
      </Container>
    </>
  );
}
