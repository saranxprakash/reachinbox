import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

// --------------------------------------------------
// Protected Route
// --------------------------------------------------

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/me", {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  // Don't redirect while we're checking the cookie
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500 text-sm">Checking authentication...</div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/" replace />;
}

// --------------------------------------------------
// App
// --------------------------------------------------

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
