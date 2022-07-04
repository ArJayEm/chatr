import { useEffect, useRef, useState } from "react";
import { Alert, Form } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";
import LoadingContact from "../contacts/LoadingContact";

export default function Messages() {
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
      getUser();
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

  // usersCollection
  //   .doc(auth.currentUser.uid)
  //   .get()
  //   .then((snapshot) => {
  //     if (snapshot.exists) {
  //       //setUser(snapshot.data());
  //       if (snapshot.data().contacts) {
  //         //if (snapshot.data().isLoggedIn) {
  //         let userContacts = snapshot.data().contacts.map((e) => e.uid) ?? [];
  //         //console.log(userContacts.length);
  //         if (userContacts.length > 0) {
  //           //setUserContacts(userContacts);

  //           usersCollection
  //             .where("uid", "in", userContacts)
  //             .get()
  //             .then((snapshots) => {
  //               load();
  //               setContacts(snapshots.docs.map((e) => e.data()));
  //               setLoading(false);
  //             })
  //             .finally(() => {})
  //             .catch((e) => {
  //               catchError(e, "get-contacs-error.");
  //             });
  //         }
  //         // } else {
  //         //   //history("/login");
  //         // }
  //       }
  //     }
  //     setLoading(false);
  //   })
  //   .finally(() => {})
  //   .catch((e) => {
  //     catchError(e, "get-user-error.");
  //   });

  async function getUser() {
    try {
      load();
      let userContacts = await usersCollection
        .doc(auth.currentUser.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            return (
              (snapshot.data().contacts &&
                snapshot.data().contacts.map((e) => e.uid)) ??
              null
            );
          }
        });
      setLoading(false);

      if (userContacts == null) return;

      load();
      let contacts = await usersCollection
        .where("uid", "in", userContacts)
        .get()
        .then((snapshots) => {
          return snapshots.docs.map((e) => e.data()) ?? null;
        });
      setLoading(false);

      if (contacts == null) return;

      setContacts(contacts);
    } catch (e) {
      catchError(e, "get-user-error.");
    }
  }

  // let [userContacts] = useCollectionData(usersRef);
  // let contactsRef = usersCollection.where("uid", "in", userContacts);
  // let [contacts] = usersCollection(contactsRef);

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
        <Form
          id="SearchUserCode"
          className="form mb-dot5"
          onSubmit={handleOnSearch}
        >
          <input
            type="text"
            className="form-control form"
            placeholder="Search..."
            ref={contactsRef}
          />
          <button
            className="btn"
            type="submit"
            title="Search"
            onError={handleOnError}
          >
            <Icon.Search />
          </button>
          <a className="btn" href="/addcontact">
            <Icon.Plus />
          </a>
        </Form>
        <ul id="Contacts" className="contacts">
          {loading && <LoadingContact count={5} />}
          {!loading && !contacts && (
            <li>No contacts yet. Click the plus button to add some.</li>
          )}
          {!loading &&
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
            })}
        </ul>
      </div>
    </div>
  );
}
