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

  useEffect(
    () => {
      if (auth.currentUser != null) {
        saveUser();
      } else {
        history("/login");
      }
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
    try {
      setMessage("");
      setError("");
      setLoading(true);

      var doc = firestore.collection("users").doc(auth.currentUser.uid);

      if ((await doc.get()).exists) {
        await doc.update({
          editedDate: auth.currentUser.metadata.lastSignInTime,
          displayName: auth.currentUser.displayName ?? auth.currentUser.email,
          lastLogIn: auth.currentUser.metadata.lastSignInTime,
          providerData: auth.currentUser.providerData.map((e) => e)[0],
          isLoggedIn: true,
          //userCode: generateUserCode(),
        });
      } else {
        await doc.set({
          displayName: auth.currentUser.displayName ?? auth.currentUser.email,
          uid: auth.currentUser.uid,
          createdDate: auth.currentUser.metadata.createdDate ?? Date.now(),
          lastLogIn: auth.currentUser.metadata.lastSignInTime ?? Date.now(),
          providerData: auth.currentUser.providerData.map((e) => e)[0],
          //userCode: generateUserCode(),
          contacts: [],
          isLoggedIn: true,
        });
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error(e.message);
      return setError("Login error.");
    }
  }

  return (
    <>
      <NavigationBar />
      <Contacts />
    </>
  );
  // retu
}
