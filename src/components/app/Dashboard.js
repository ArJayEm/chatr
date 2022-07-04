/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";

import { auth, firestore } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import Messages from "../messages/Messages";
import NavigationBar from "./NavigationBar";
import Loading from "./Loading";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const displayName =
    currentUser && (currentUser.displayName ?? currentUser.email);
  const history = useNavigate();
  const [user, setUser] = useState(null);
  const [axiosGeoLocation, setAxiosGeoLocation] = useState(null);
  const [navigatorGeoLocation, setNavigatorGeoLocation] = useState(null);
  // const { coords, isGeolocationAvailable, isGeolocationEnabled } =
  //   useGeolocated({
  //     positionOptions: {
  //       enableHighAccuracy: false,
  //     },
  //     userDecisionTimeout: 5000,
  //   });

  let usersCollection = firestore.collection("users");

  useEffect(
    () => {
      //if (auth.currentUser != null) {
      getGeoLocationData();
      saveUser();
      //setDashboardHeight();
      // } else {
      //   history("/login");
      // }
    },
    //eslint-disable-next-line
    []
  );

  function generateUserCode() {
    //return Math.floor(100000 + Math.random() * 999999);
    var seq = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);
    //console.log(seq);
    return "0".repeat(12 - seq.length) + seq;
  }

  const getGeoLocationData = async () => {
    //console.log(isGeolocationAvailable, isGeolocationEnabled, coords);

    // if (navigator.geolocation) {
    //   var errorCode = null;
    //   var errorMessage = null;

    //   //setNavigatorGeoLocation(navigator.geolocation);

    //   navigator.geolocation.getCurrentPosition(
    //     function (position) {
    //       setNavigatorGeoLocation({
    //         lat: position.coords.latitude,
    //         long: position.coords.longitude,
    //         coords: position.coords.latitude + "," + position.coords.longitude,
    //       });
    //     },
    //     function (error) {
    //       errorCode = error.code;
    //       errorMessage = error.message;
    //       console.error(
    //         "Error getting navigator geo location. " +
    //           errorCode +
    //           " - " +
    //           errorMessage
    //       );
    //     }
    //   );
    // }

    const res = await axios.get("https://geolocation-db.com/json/");
    //console.log(res.data);
    setAxiosGeoLocation(res.data);
  };

  // async function saveVisitor() {
  //   var doc = firestore.collection("visitors");
  // }

  async function saveUser() {
    load();

    var doc = usersCollection.doc(auth.currentUser.uid);
    //console.log(auth.currentUser);
    const data = {};

    if ((await doc.get()).exists) {
      await doc
        .update({
          //editedDate: auth.currentUser.metadata.lastSignInTime,
          displayName: auth.currentUser.displayName ?? auth.currentUser.email,
          lastLogIn: auth.currentUser.metadata.lastSignInTime,
          providerData: auth.currentUser.providerData.map((e) => e)[0],
          isLoggedIn: true,
          axiosGeoLocation: axiosGeoLocation,
          navigatorGeoLocation: navigatorGeoLocation,
        })
        .catch((e) => {
          catchError(e, "update-user-error.");
        });
    } else {
      await doc
        .set({
          uid: auth.currentUser.uid,
          createdDate: auth.currentUser.metadata.createdDate ?? Date.now(),
          userCode: generateUserCode(),
          contacts: [],
          //editedDate: auth.currentUser.metadata.lastSignInTime,
          displayName: auth.currentUser.displayName ?? auth.currentUser.email,
          lastLogIn: auth.currentUser.metadata.lastSignInTime,
          providerData: auth.currentUser.providerData.map((e) => e)[0],
          isLoggedIn: true,
          axiosGeoLocation: axiosGeoLocation,
          navigatorGeoLocation: navigatorGeoLocation,
        })
        .catch((e) => {
          catchError(e, "set-user-error.");
        });
    }

    await usersCollection
      .doc(auth.currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setUser(snapshot.data());
        }
      });
    setLoading(false);
  }

  function setDashboardHeight() {
    if (!loading) {
      let navbarHeight =
        document.getElementsByClassName("navbar")[0].offsetHeight;
      const heightToDeduct = window.innerHeight - navbarHeight;
      console.log(window.innerHeight, navbarHeight);
      document.getElementById("ContactsDiv").style.height =
        heightToDeduct + "px";
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
    <>
      {loading && <Loading />}
      {!loading && <NavigationBar user={user} />}
      <Messages />
    </>
  );
  // retu
}
