import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./LoadingState";

export function RequireAuth() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireInstructor() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.tipo !== "instrutor") {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}
