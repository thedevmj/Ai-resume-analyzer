import React from "react";
import { Navigate } from "react-router-dom";

export default function IsLoggedin({ children }) {

const email= sessionStorage.getItem("email");

    if (!email) {
    return <Navigate to="/Login" replace />;
  }
  
   return children ;
}
