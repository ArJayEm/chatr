import { auth } from "../firebase";

const socialMediaAuth = (provider) => {
  return auth.signInWithPopup(provider)
    .then((res) => {
      return res.user;
    })
    .catch((e) => {
      return e;
    });
};

export default socialMediaAuth;
