// components/Sidebar.jsx
import React, { useState } from "react";
import {
  Plus,
  Search,
  Library,
  Folder,
  Compass,
  MessageSquare,
  ChevronLeft,
  User,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  chats,
  onNewChat,
  onSelectChat,
  currentChatId,
}) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`${
        open ? "w-64" : "w-16"
      } bg-[#202123] text-gray-200 flex flex-col h-screen transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => setOpen((p) => !p)}
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft
            size={20}
            className={`transform transition-transform ${
              open ? "" : "rotate-180"
            }`}
          />
        </button>
        {open && <h1 className="text-sm font-semibold text-white">AI Designer</h1>}
      </div>

      {/* Top actions */}
      <div className="space-y-1 px-2 mb-4">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition"
        >
          <Plus size={18} /> {open && <span>New chat</span>}
        </button>
        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition">
          <Search size={18} /> {open && <span>Search chats</span>}
        </button>
        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition">
          <Library size={18} /> {open && <span>Library</span>}
        </button>
        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition">
          <Folder size={18} /> {open && <span>Projects</span>}
        </button>
      </div>

      {/* GPTs section */}
      {open && (
        <p className="text-xs text-gray-500 uppercase px-3 mb-1">GPTs</p>
      )}
      <div className="space-y-1 px-2 mb-4">
        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition">
          <Compass size={18} /> {open && <span>Explore</span>}
        </button>
        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition">
          <Sparkles size={18} /> {open && <span>Voice Over Generator</span>}
        </button>
        <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#2a2b32] transition">
          <Sparkles size={18} /> {open && <span>Code Tutor</span>}
        </button>
      </div>

      {/* Chats section */}
      {open && <p className="text-xs text-gray-500 uppercase px-3 mb-1">Chats</p>}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {chats.length === 0 ? (
          open && <p className="text-gray-500 text-sm px-3">No conversations yet</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#2a2b32] transition ${
                currentChatId === chat.id ? "bg-[#343541]" : ""
              }`}
            >
              <MessageSquare size={16} />
              {open && (
                <span className="truncate text-sm">
                  {chat.title || "Untitled Chat"}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer (User profile) */}
      <div className="border-t border-[#343541] p-3 mt-2 flex items-center gap-2">
        <User className="w-6 h-6 text-gray-400" />
        {open && (
          <div className="flex-1 text-sm">
            <p className="text-white font-medium">Arun Kumar</p>
            <p className="text-xs text-gray-400">Free</p>
          </div>
        )}
        {open && (
          <button className="bg-white text-black text-xs font-semibold px-2 py-1 rounded hover:bg-gray-200">
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
