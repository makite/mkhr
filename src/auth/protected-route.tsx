import { Navigate } from "react-router";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token"); // get token from storage
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
