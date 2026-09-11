import React, { useEffect, useState } from "react";

import {
  ChevronDown,
  Clock,
  Send,
  Search,
  Filter,
  RefreshCw,
  Star,
  LogOut,
} from "lucide-react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import ComposeModal from "./ComposeModal";

const API_URL =
  import.meta.env.VITE_API_URL || "https://reachinbox-79u6.onrender.com";
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface Campaign {
  id?: number;
  to?: string;
  subject: string;
  body: string;
  time?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState({
    scheduled: 0,
    sent: 0,
  });

  const [campaigns, setCampaigns] = useState<{
    scheduledList: Campaign[];
    sentList: Campaign[];
  }>({
    scheduledList: [],
    sentList: [],
  });

  // ==================================================
  // GET LOGGED-IN GOOGLE USER
  // ==================================================

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
      });

      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      navigate("/");
    }
  };

  // ==================================================
  // GET CAMPAIGN STATS
  // ==================================================

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`, {
        withCredentials: true,
      });

      setStats({
        scheduled: response.data.scheduled || 0,
        sent: response.data.sent || 0,
      });

      setCampaigns({
        scheduledList: response.data.scheduledList || [],
        sentList: response.data.sentList || [],
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    fetchUser();
    fetchStats();

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div className="w-64 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-6">
          {/* Logo */}

          <div className="mb-8 flex items-center">
            <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center rounded-xl text-2xl font-bold shadow-sm">
              S
            </div>
          </div>

          {/* Logged-in User */}

          {user && (
            <div className="flex items-center justify-between hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center space-x-3 min-w-0">
                {/* Avatar */}

                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Name + Email */}

                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {user.name}
                  </div>

                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
            </div>
          )}

          {/* Compose Button */}

          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full mt-6 py-2 border-2 border-[#10B981] text-[#10B981] rounded-full font-medium hover:bg-green-50 transition-colors"
          >
            Compose
          </button>

          {/* Core Navigation */}

          <div className="mt-8">
            <div className="text-[11px] text-gray-400 font-bold mb-3 uppercase tracking-wider">
              Core
            </div>

            <nav className="space-y-1">
              {/* Scheduled */}

              <div
                onClick={() => setActiveTab("scheduled")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeTab === "scheduled"
                    ? "bg-[#E8F5E9] text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock
                    size={18}
                    className={
                      activeTab === "scheduled"
                        ? "text-gray-700"
                        : "text-gray-500"
                    }
                  />

                  <span className="font-medium text-sm">Scheduled</span>
                </div>

                <span
                  className={`text-sm ${
                    activeTab === "scheduled"
                      ? "font-medium text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {stats.scheduled}
                </span>
              </div>

              {/* Sent */}

              <div
                onClick={() => setActiveTab("sent")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeTab === "sent"
                    ? "bg-[#E8F5E9] text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Send
                    size={18}
                    className={
                      activeTab === "sent" ? "text-gray-700" : "text-gray-500"
                    }
                  />

                  <span className="font-medium text-sm">Sent</span>
                </div>

                <span
                  className={`text-sm ${
                    activeTab === "sent"
                      ? "font-medium text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {stats.sent}
                </span>
              </div>
            </nav>
          </div>
        </div>

        {/* Logout at bottom */}

        <div className="mt-auto p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 flex flex-col bg-white">
        {/* =================================================
            TOP HEADER
        ================================================== */}

        <div className="h-20 flex items-center px-8 border-b border-gray-100 justify-between">
          {/* Search */}

          <div className="relative w-full max-w-2xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#F3F4F6] rounded-full py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Header Right Side */}

          <div className="flex items-center gap-5 ml-6">
            {/* Filter */}

            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Filter"
            >
              <Filter size={20} />
            </button>

            {/* Refresh */}

            <button
              onClick={fetchStats}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>

            {/* Google User */}

            {user && (
              <div className="flex items-center gap-3 pl-5 border-l border-gray-200">
                {/* Avatar */}

                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* User Details */}

                <div className="hidden md:block max-w-[180px]">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </div>

                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>

                {/* Logout */}

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={19} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            EMAIL LIST
        ================================================== */}

        <div className="flex-1 overflow-auto">
          {/* ================= SCHEDULED ================= */}

          {activeTab === "scheduled" ? (
            campaigns.scheduledList.length > 0 ? (
              campaigns.scheduledList.map((campaign, idx) => (
                <div
                  key={campaign.id ?? idx}
                  className="flex items-center px-8 py-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                >
                  <div className="w-56 font-semibold text-sm text-gray-900 truncate pr-4">
                    To: {campaign.to || "Recipient"}
                  </div>

                  <div className="flex items-center px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[11px] font-medium mr-4 whitespace-nowrap">
                    <Clock size={12} className="mr-1.5 stroke-[2.5]" />

                    {campaign.time || "Scheduled"}
                  </div>

                  <div className="flex-1 text-sm truncate">
                    <span className="font-semibold text-gray-900">
                      {campaign.subject}
                    </span>

                    <span className="text-gray-400">
                      {" "}
                      - {(campaign.body || "").substring(0, 50)}
                      ...
                    </span>
                  </div>

                  <Star
                    size={18}
                    className="text-gray-300 hover:text-yellow-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Clock size={48} className="mb-4 text-gray-200" />

                <p className="text-sm font-medium text-gray-500">
                  No scheduled campaigns
                </p>

                <p className="text-xs mt-1">
                  Use the Compose button to schedule an email.
                </p>
              </div>
            )
          ) : /* ================= SENT ================= */

          campaigns.sentList.length > 0 ? (
            campaigns.sentList.map((campaign, idx) => (
              <div
                key={campaign.id ?? idx}
                className="flex items-center px-8 py-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
              >
                <div className="w-56 font-semibold text-sm text-gray-900 truncate pr-4">
                  To: {campaign.to || "Recipient"}
                </div>

                <div className="px-3 py-1 bg-gray-100 rounded-full text-[11px] font-medium text-gray-600 mr-4">
                  Sent
                </div>

                <div className="flex-1 text-sm truncate">
                  <span className="font-semibold text-gray-900">
                    {campaign.subject}
                  </span>

                  <span className="text-gray-400">
                    {" "}
                    - {(campaign.body || "").substring(0, 50)}
                    ...
                  </span>
                </div>

                <Star
                  size={18}
                  className="text-gray-300 hover:text-yellow-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Send size={48} className="mb-4 text-gray-200" />

              <p className="text-sm font-medium text-gray-500">
                No campaigns sent yet
              </p>

              <p className="text-xs mt-1">
                When you send a campaign, it will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          COMPOSE MODAL
      ====================================================== */}

      {isComposeOpen && (
        <ComposeModal
          onClose={() => {
            setIsComposeOpen(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
