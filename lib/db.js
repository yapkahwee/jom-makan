import firebase from "firebase/app";

const db = firebase.firestore();

export function updateUser(uid, user) {
  db.collection("users").doc(uid).set(user);
}