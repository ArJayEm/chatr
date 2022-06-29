/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, firestore } from "../firebase";
import Contacts from "./Contacts";
import NavigationBar from "./NavigationBar";
// import { useAuthState } from "react-firebase-hooks/auth";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const displayName =
    currentUser && (currentUser.displayName ?? currentUser.email);
  const history = useNavigate();
  const [user, setUser] = useState(null);

  let usersCollection = firestore.collection("users");

  useEffect(
    () => {
      //if (auth.currentUser != null) {
      saveUser();
      setDashboardHeight();
      //} else {
      //history("/login");
      //}
    },
    //eslint-disable-next-line
    []
  );

  function generateUserCode() {
    // var lastUserCode = 0;
    // firestore
    //   .collection("users")
    //   .where("userCode", "==", lastUserCode.toString())
    //   //.orderBy("createdDate", "desc")
    //   //.limit(1)
    //   .get()
    //   .then((snapshots) => {
    //     lastUserCode = snapshots.docs.length;
    //   });
    // //lastUserCode++;
    // //console.log(lastUserCode.toString());
    // var userCode =
    //   "0".repeat(12 - lastUserCode.toString().length) +
    //   lastUserCode.toString();
    // //console.log(userCode);
    return Math.floor(100000 + Math.random() * 900000);
  }

  async function saveUser() {
    load();

    var doc = usersCollection.doc(auth.currentUser.uid);
    console.log(auth.currentUser);
    if ((await doc.get()).exists) {
      await doc
        .update({
          //editedDate: auth.currentUser.metadata.lastSignInTime,
          displayName: auth.currentUser.displayName ?? auth.currentUser.email,
          lastLogIn: auth.currentUser.metadata.lastSignInTime,
          providerData: auth.currentUser.providerData.map((e) => e)[0],
          isLoggedIn: true,
          //userCode: generateUserCode(),
          config: auth.currentUser.auth.currentUser.auth.config,
        })
        .catch((e) => {
          catchError(e, "update-user-error.");
        });
    } else {
      await doc
        .set({
          displayName: auth.currentUser.displayName ?? auth.currentUser.email,
          uid: auth.currentUser.uid,
          createdDate: auth.currentUser.metadata.createdDate ?? Date.now(),
          lastLogIn: auth.currentUser.metadata.lastSignInTime ?? Date.now(),
          providerData: auth.currentUser.providerData.map((e) => e)[0],
          //userCode: generateUserCode(),
          userContacts: [],
          isLoggedIn: true,
          config: auth.currentUser.auth.currentUser.auth.config,
        })
        .catch((e) => {
          catchError(e, "set-user-error.");
        });
    }
    setLoading(false);
  }

  function setDashboardHeight() {
    let navbarHeight =
      document.getElementsByClassName("navbar")[0].offsetHeight;
    const heightToDeduct = window.innerHeight - navbarHeight;
    let rootDiv = document.getElementById("ContactsDiv");
    //console.log(heightToDeduct);
    //rootDiv.style.height = heightToDeduct + "px";
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
    <>
      <NavigationBar />
      {/* {loading ? <></> : <Contacts />} */}
      <Contacts />
    </>
  );
  // retu
}
