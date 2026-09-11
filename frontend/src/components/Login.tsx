import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // We are not using mock email/password authentication.
    // Google OAuth is the real authentication method.
    alert("Please login using Google.");
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">
          Login
        </h1>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 px-4 bg-[#e8f5e9] hover:bg-[#ddedd0] text-gray-700 text-sm font-medium rounded-lg flex items-center justify-center gap-3 transition-colors border border-green-100/50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
            />
            <path
              fill="#34A853"
              d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5z"
            />
            <path
              fill="#FBBC05"
              d="M6.54 13.58A5.86 5.86 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.11l3.24-2.53z"
            />
            <path
              fill="#EA4335"
              d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.43 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39z"
            />
          </svg>
          Login with Google
        </button>

        <div className="w-full my-6 text-center text-xs text-gray-400">
          Google authentication required
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
          />

          <button
            type="submit"
            className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed"
          >
            Email login disabled
          </button>
        </form>
      </div>
    </div>
  );
}
