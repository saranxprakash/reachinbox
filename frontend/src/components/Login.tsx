import React, { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://reachinbox-79u6.onrender.com";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Email/password authentication will be connected to the backend here.
    console.log("Login attempt:", email);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10">
          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2
              bg-[#e4f7ed]
              hover:bg-[#d8f1e5]
              rounded-lg
              py-3
              text-sm
              font-medium
              text-gray-700
              transition-colors"
          >
            {/* Google Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.93-4.2 2.93-7.4Z"
                fill="#4285F4"
              />
              <path
                d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.7Z"
                fill="#34A853"
              />
              <path
                d="M6.53 13.79A5.85 5.85 0 0 1 6.22 12c0-.62.11-1.22.31-1.79V7.69H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.31l3.25-2.52Z"
                fill="#FBBC05"
              />
              <path
                d="M12 6.18c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.26 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.72 5.39l3.25 2.52C7.3 7.9 9.46 6.18 12 6.18Z"
                fill="#EA4335"
              />
            </svg>
            Login with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"></div>

            <span className="text-xs text-gray-400 whitespace-nowrap">
              or sign up through email
            </span>

            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-100 border-none rounded-lg
                px-4 py-3
                text-sm
                text-gray-700
                placeholder-gray-500
                outline-none
                focus:ring-2 focus:ring-green-200"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-100 border-none rounded-lg
                px-4 py-3
                text-sm
                text-gray-700
                placeholder-gray-500
                outline-none
                focus:ring-2 focus:ring-green-200"
            />

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-green-600
                hover:bg-green-700
                text-white
                rounded-lg
                py-3
                text-sm
                font-medium
                transition-colors
                mt-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
