import { Navigate } from "react-router";
import { type ReactNode } from "react";

interface SimpleProtectedRouteProps {
  children: ReactNode;
}

export default function SimpleProtectedRoute({ children }: SimpleProtectedRouteProps) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
