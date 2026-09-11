import React, { useState, useRef, useEffect } from "react";

import {
  ArrowLeft,
  Paperclip,
  Clock,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Type,
  Link,
  Upload,
} from "lucide-react";

import axios from "axios";
const API_URL =
  import.meta.env.VITE_API_URL || "https://reachinbox-79u6.onrender.com";
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

export default function ComposeModal({ onClose }: { onClose: () => void }) {
  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState<User | null>(null);

  // =====================================================
  // UI STATE
  // =====================================================

  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // FORM STATE
  // =====================================================

  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [attachment, setAttachment] = useState<File | null>(null);

  const [previewEmails, setPreviewEmails] = useState<string[]>([]);

  const [toEmail, setToEmail] = useState("");

  const [subject, setSubject] = useState("");

  const [body, setBody] = useState("");

  // =====================================================
  // SCHEDULER
  // =====================================================

  const [customDateTime, setCustomDateTime] = useState("");

  const [scheduleLabel, setScheduleLabel] = useState("");

  // =====================================================
  // FILE INPUT REFERENCES
  // =====================================================

  const csvInputRef = useRef<HTMLInputElement>(null);

  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to get logged-in user:", error);
      }
    };

    fetchUser();
  }, []);

  // =====================================================
  // CSV UPLOAD
  // =====================================================

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      setCsvFile(selectedFile);

      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;

        if (!text) return;

        const lines = text.split("\n");

        const emails: string[] = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (const line of lines) {
          const cells = line.split(",");

          for (const cell of cells) {
            const trimmed = cell.trim().replace(/^"|"$/g, "");

            if (emailRegex.test(trimmed)) {
              emails.push(trimmed);
              break;
            }
          }
        }

        setPreviewEmails(emails);
      };

      reader.readAsText(selectedFile);
    }
  };

  // =====================================================
  // ATTACHMENT UPLOAD
  // =====================================================

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  // =====================================================
  // CUSTOM SCHEDULE TIME
  // =====================================================

  const handleCustomTimeConfirm = () => {
    if (!customDateTime) {
      alert("Please select a date and time.");
      return;
    }

    const selectedDate = new Date(customDateTime);

    if (selectedDate <= new Date()) {
      alert("Please select a future date and time.");
      return;
    }

    const formattedDate = selectedDate.toLocaleString([], {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    setScheduleLabel(formattedDate);

    setShowScheduleDropdown(false);
  };

  // =====================================================
  // SEND / SCHEDULE CAMPAIGN
  // =====================================================

  const handleSend = async () => {
    if (!user) {
      alert("You are not logged in. Please login with Google.");
      return;
    }

    if (!subject.trim()) {
      alert("Subject is required.");
      return;
    }

    if (!body.trim()) {
      alert("Email body is required.");
      return;
    }

    if (!csvFile && !toEmail.trim()) {
      alert("Please upload a CSV list or enter a recipient email.");
      return;
    }

    // Validate recipient email
    if (toEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(toEmail.trim())) {
        alert("Please enter a valid recipient email.");
        return;
      }
    }

    // ---------------------------------------------------
    // Create FormData
    // ---------------------------------------------------

    const formData = new FormData();

    // Subject
    formData.append("subject", subject.trim());

    // Body
    formData.append("body", body);

    // Real PostgreSQL user ID
    formData.append("userId", String(user.id));

    // Single recipient
    if (toEmail.trim()) {
      formData.append("toEmail", toEmail.trim());
    }

    // CSV recipient list
    if (csvFile) {
      formData.append("file", csvFile);
    }

    // Attachment
    if (attachment) {
      formData.append("attachment", attachment);
    }

    // Schedule time
    if (customDateTime) {
      const scheduledDate = new Date(customDateTime);

      if (scheduledDate <= new Date()) {
        alert("Please select a future date and time.");
        return;
      }

      formData.append("scheduleTime", scheduledDate.toISOString());
    }

    try {
      setIsSubmitting(true);

      await axios.post(`${API_URL}/api/upload`, formData, {
        withCredentials: true,
      });

      alert(
        customDateTime
          ? `Campaign successfully scheduled for ${scheduleLabel}!`
          : "Campaign sent successfully!",
      );

      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send campaign. Please try again.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col h-[85vh]">
        {/* HEADER */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center text-gray-700 font-medium">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 text-gray-400 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            Compose New Email
          </div>

          <div className="flex items-center space-x-4 relative">
            {/* Attachment input */}
            <input
              type="file"
              className="hidden"
              ref={attachmentInputRef}
              onChange={handleAttachmentChange}
            />

            {/* Attachment button */}
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              className={`hover:text-gray-700 ${
                attachment ? "text-green-600 font-bold" : "text-gray-400"
              }`}
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>

            {/* Schedule button */}
            <button
              type="button"
              onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
              className={`${
                scheduleLabel ? "text-green-600" : "text-gray-400"
              } hover:text-gray-700`}
              title="Schedule"
            >
              <Clock size={18} />
            </button>

            {/* Schedule dropdown */}

            {showScheduleDropdown && (
              <div className="absolute top-10 right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4 text-sm text-gray-700 space-y-3">
                <div className="font-medium border-b border-gray-100 pb-2">
                  Send Later
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Pick a particular date & time
                  </label>

                  <input
                    type="datetime-local"
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    min={new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)}
                    className="border border-gray-200 rounded-md p-1.5 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleLabel("");
                      setCustomDateTime("");
                      setShowScheduleDropdown(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleCustomTimeConfirm}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-green-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Send button */}

            <button
              type="button"
              onClick={handleSend}
              disabled={isSubmitting}
              className={`border border-green-600 text-green-600 px-5 py-1.5 rounded-full text-sm font-medium hover:bg-green-50 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting
                ? "Sending..."
                : scheduleLabel
                  ? `Send ${scheduleLabel}`
                  : "Send"}
            </button>
          </div>
        </div>

        {/* FORM */}

        <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
          {/* FROM */}

          <div className="flex items-center border-b border-gray-100 pb-4">
            <span className="w-20 text-gray-800 text-sm font-medium">From</span>

            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 flex items-center">
              {user?.email || "Loading..."}

              <span className="ml-2 text-gray-400 text-xs">▼</span>
            </div>
          </div>

          {/* TO */}

          <div className="flex items-center border-b border-gray-100 pb-4 justify-between">
            <div className="flex items-center flex-1">
              <span className="w-20 text-gray-800 text-sm font-medium">To</span>

              {csvFile ? (
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {previewEmails.slice(0, 3).map((email, idx) => (
                    <span
                      key={idx}
                      className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {email}
                    </span>
                  ))}

                  {previewEmails.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                      +{previewEmails.length - 3}
                    </span>
                  )}

                  {previewEmails.length === 0 && (
                    <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      {csvFile.name}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCsvFile(null);
                      setPreviewEmails([]);
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
              )}
            </div>

            {/* CSV input */}

            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={csvInputRef}
              onChange={handleCsvChange}
            />

            {/* Upload list */}

            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center text-[#10B981] text-sm font-medium hover:text-green-700 transition-colors whitespace-nowrap ml-4"
            >
              <Upload size={16} className="mr-1.5" />
              Upload List
            </button>
          </div>

          {/* ATTACHMENT PREVIEW */}

          {attachment && (
            <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200 w-fit">
              <Paperclip size={14} className="text-gray-400" />

              <span>{attachment.name}</span>

              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-red-500 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* SUBJECT */}

          <div className="flex items-center border-b border-gray-100 pb-4">
            <span className="w-20 text-gray-800 text-sm font-medium">
              Subject
            </span>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>

          {/* TOOLBAR */}

          <div className="flex items-center gap-4 border-b border-gray-100 pb-3 text-gray-400">
            <button type="button" title="Bold" className="hover:text-gray-700">
              <Bold size={16} />
            </button>

            <button
              type="button"
              title="Italic"
              className="hover:text-gray-700"
            >
              <Italic size={16} />
            </button>

            <button
              type="button"
              title="Underline"
              className="hover:text-gray-700"
            >
              <Underline size={16} />
            </button>

            <button
              type="button"
              title="Align Left"
              className="hover:text-gray-700"
            >
              <AlignLeft size={16} />
            </button>

            <button
              type="button"
              title="Align Center"
              className="hover:text-gray-700"
            >
              <AlignCenter size={16} />
            </button>

            <button
              type="button"
              title="Align Right"
              className="hover:text-gray-700"
            >
              <AlignRight size={16} />
            </button>

            <button type="button" title="List" className="hover:text-gray-700">
              <List size={16} />
            </button>

            <button type="button" title="Text" className="hover:text-gray-700">
              <Type size={16} />
            </button>

            <button type="button" title="Link" className="hover:text-gray-700">
              <Link size={16} />
            </button>
          </div>

          {/* DELAY */}

          <div className="flex items-center space-x-8 pt-2">
            <div className="flex items-center space-x-3">
              <span className="text-gray-800 font-medium text-sm">
                Delay between 2 emails
              </span>

              <input
                type="text"
                placeholder="00"
                className="w-14 border border-gray-200 rounded text-center py-1 text-sm outline-none focus:border-green-500 text-gray-700"
              />
            </div>
          </div>

          {/* BODY */}

          <div className="pt-4 h-full flex flex-col">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type Your Email..."
              className="w-full flex-1 outline-none text-gray-800 placeholder-gray-400 resize-none min-h-[250px] text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
