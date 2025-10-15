// components/Notification.jsx
import React from "react";
import { X } from "lucide-react";

export default function Notification({ message, onClose }) {
  return (
    <div className="bg-white border shadow-md p-4 rounded-md w-80 flex justify-between items-start gap-2 animate-slide-in">
      <div className="text-sm text-gray-800 truncate">
        {message.length > 100 ? message.slice(0, 100) + "..." : message}
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={16} />
      </button>
    </div>
  );
}
