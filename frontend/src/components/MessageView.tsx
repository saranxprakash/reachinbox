import React from "react";
import { ArrowLeft, Star, Archive, Trash2, Zap } from "lucide-react";

export default function MessageView({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            Oliver, hello there! | MJWYT44 BM#52W01
          </h2>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-gray-600">
            <Star size={18} />
          </button>
          <button className="hover:text-gray-600">
            <Archive size={18} />
          </button>
          <button className="hover:text-gray-600">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="p-8 flex-1 overflow-y-auto">
        {/* Sender Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
              A
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Amanda Clark{" "}
                <span className="text-gray-400 text-sm font-normal">
                  &lt;sender@example.com&gt;
                </span>
              </div>
              <div className="text-gray-400 text-sm">to me ▾</div>
            </div>
          </div>
          <div className="text-gray-400 text-sm">Nov 3, 10:23 AM</div>
        </div>

        {/* Body */}
        <div className="text-gray-800 space-y-6 leading-relaxed">
          <p>Hey Oliver,</p>
          <p>You've just RECEIVED something</p>

          {/* Highlight Box */}
          <div className="bg-[#FFF9EA] border-l-4 border-yellow-400 p-4 rounded-r-md my-6">
            <div className="flex items-start">
              <Zap
                size={18}
                className="text-yellow-500 mt-1 mr-3 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  Extremely Exclusive—Only 4 Spots Worldwide Per Year | $25,000
                  investment
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  To explore securing your private transformation, simply reply
                  right now with <strong>"FLY OUT FIX"</strong>.
                </p>
              </div>
            </div>
          </div>

          <p>Your coach for world-class performance,</p>
          <p>Grant</p>
          <p className="text-gray-500 italic text-sm">
            P.S. Always remember that you can develop world class technique! 🚀
          </p>

          {/* Attachments */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-100">
            <div className="border border-gray-200 rounded-md overflow-hidden w-48">
              <div className="h-32 bg-blue-100"></div>
              <div className="p-2 bg-gray-50 text-xs text-gray-600 border-t border-gray-200">
                Tennis_Coach_Profile.png
                <br />
                <span className="text-gray-400">1.2 MB</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-md overflow-hidden w-48">
              <div className="h-32 bg-blue-100"></div>
              <div className="p-2 bg-gray-50 text-xs text-gray-600 border-t border-gray-200">
                Tennis_Coach_Profile2.png
                <br />
                <span className="text-gray-400">1.2 MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
