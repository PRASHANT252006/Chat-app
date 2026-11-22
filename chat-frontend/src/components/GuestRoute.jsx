import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const GuestRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default GuestRoute;
