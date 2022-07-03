import { useEffect, useRef, useState } from "react";
import { Alert, Form, Image } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";
//eslint-disable-next-line

export default function Contacts() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  //const [user, setUser] = useState(null);
  //const [userContacts, setUserContacts] = useState(null);
  const [contacts, setContacts] = useState(null);
  const history = useNavigate();
  const contactsRef = useRef("");

  let usersCollection = firestore.collection("users");

  useEffect(
    () => {
      //getUser();
    },
    //eslint-disable-next-line
    []
  );

  // async function getUser() {
  //   load();

  //   await usersCollection
  //     .doc(auth.currentUser.uid)
  //     .get()
  //     .then((snapshot) => {
  //       if (snapshot.exists) {
  //         //setUser(snapshot.data());

  //         if (snapshot.data().isLoggedIn) {
  //           let userContacts = snapshot.data().contacts.map((e) => e.uid) ?? [];
  //           console.log(userContacts.length);
  //           if (userContacts.length > 0) {
  //             setUserContacts(userContacts);
  //           }
  //         } else {
  //           history("/login");
  //         }
  //       }
  //       setLoading(false);
  //     })
  //     .finally(() => {})
  //     .catch((e) => {
  //       catchError(e, "get-user-error.");
  //     });
  // }

  usersCollection
    .doc(auth.currentUser.uid)
    .get()
    .then((snapshot) => {
      if (snapshot.exists) {
        //setUser(snapshot.data());

        //if (snapshot.data().isLoggedIn) {
          let userContacts = snapshot.data().contacts.map((e) => e.uid) ?? [];
          //console.log(userContacts.length);
          if (userContacts.length > 0) {
            //setUserContacts(userContacts);

            usersCollection
              .where("uid", "in", userContacts)
              .get()
              .then((snapshots) => {
                setContacts(snapshots.docs.map((e) => e.data()));
                setLoading(false);
              });
          }
        // } else {
        //   //history("/login");
        // }
      }
      setLoading(false);
    })
    .finally(() => {})
    .catch((e) => {
      catchError(e, "get-user-error.");
    });

  function handleOnClick(uid) {
    history("/conversation/" + uid);
  }

  function handleOnSearch(e) {
    e.preventDefault();

    if (contactsRef.current.value) {
    }
  }

  function handleOnError() {}

  //eslint-disable-next-line
  function load() {
    setMessage("");
    setError("");
    setLoading(true);
  }

  function catchError(e, msg) {
    setLoading(false);
    var message = msg + " " + e.message;
    console.error(message);
    return setError(msg);
  }

  return (
    <div className="page">
      <div id="ContactsDiv" className="container">
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        {contacts && (
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
        )}
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
            contacts &&
            contacts.map((contact) => {
              return (
                <li
                  key={contact.uid}
                  id={contact.uid}
                  onClick={() => handleOnClick(contact.uid)}
                  className={
                    "contact contact_small logged-" +
                    (contact && contact.isLoggedIn ? "in" : "out")
                  }
                >
                  {/* <Contact contact={contact} handleOnError={handleOnError} /> */}
                  <div className="user">
                    <img
                      className="rounded-circle"
                      onError={() => handleOnError}
                      src={
                        contact &&
                        (contact.providerData.photoURL || defaultUserImage)
                      }
                      alt={contact && contact.displayName}
                    />
                    <span className="dot indicator">●</span>
                  </div>
                  <div className="content">
                    <strong className="title">
                      {contact &&
                        (contact.displayName ||
                          contact.providerData.displayName)}
                    </strong>
                    <span className="tag indicator">
                      {/* {contact && (contact.isLoggedIn ? "Online" : "Offline")} */}
                      {/* {messages.last} */}
                    </span>
                  </div>
                </li>
              );
            })
          ) : (
            <li>
              <Link
                className="btn wide btn-success"
                variant="button"
                to="/addcontact"
                style={{ color: "#fff" }}
              >
                <Icon.Plus /> Add Contact
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
