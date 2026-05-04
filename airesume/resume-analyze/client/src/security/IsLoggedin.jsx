import React from "react";
import { Navigate } from "react-router-dom";

export default function IsLoggedin({ child }) {

const email= localStorage.getItem("email");

    if (email.length === 0) {
    return <Navigate to="/Login" />;
  }
   return child;
}
