import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAdminVerified = localStorage.getItem("isAdminVerified") === "true";

  return isAdminVerified ? <Outlet /> : <Navigate to="/admin/confirm" />;
};

export default ProtectedRoute;
