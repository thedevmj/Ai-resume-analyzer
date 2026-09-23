import { Navigate } from "react-router-dom";

export default function IsAdmin({ children }) {
  const email =
    sessionStorage.getItem("email") || localStorage.getItem("email");
  const role =
    sessionStorage.getItem("role") || localStorage.getItem("role");

  if (!email) {
    return <Navigate to="/Login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}