import React from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-gray-900 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            S
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to ReachInbox
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Sign in to manage your email campaigns
            </p>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
            Continue with Google
          </button>

          <p className="text-xs text-center text-gray-400 mt-6">
            By continuing, you agree to use ReachInbox responsibly.
          </p>
        </div>
      </div>
    </div>
  );
}
