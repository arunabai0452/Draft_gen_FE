import React, { useState, useEffect, useRef } from "react";
import { Plus, MessageSquare, Menu, X } from "lucide-react";
import ChatInput from "./components/ChatInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat", messages: [] },
  ]);
  const [activeChat, setActiveChat] = useState(chats[0]?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modalImage, setModalImage] = useState(null); // base64/url of clicked image


  // Ref to always get the latest active chat
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const handleNewChat = () => {
    const newChat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const handleSend = async (chatId, { prompt, file }) => {
    if (!prompt && !file) return;

    // Add user + AI loading message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
            ...chat,
            title:
              chat.title === "New Chat" && prompt
                ? prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "")
                : chat.title,
            messages: [
              ...chat.messages,
              { sender: "user", prompt, file, loading: false },
              { sender: "ai", loading: true, images: [] },
            ],
          }
          : chat
      )
    );

    const formData = new FormData();
    formData.append("user_prompt", prompt);
    if (file) formData.append("file", file);

    try { 
      const res = await fetch("https://difficile-convalescently-edelmira.ngrok-free.dev/generate_with_moodboard", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // Update chat messages
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map((msg) =>
              msg.sender === "ai" && msg.loading
                ? { ...msg, loading: false, images: data.images || [] }
                : msg
            );
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        })
      );

      // Trigger notification only if user is NOT in this chat
      if (chatId !== activeChatRef.current) {
        toast.info(`New AI response: ${prompt}`, {
          position: "top-right",
          autoClose: 5000,
          style: {
            background: "#000000",
            color: "#ffffff",
            fontWeight: "bold",
          }
        });
        showBrowserNotification("New AI Response", prompt);
      }
    } catch (err) {
      console.error(err);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map((msg) =>
              msg.sender === "ai" && msg.loading
                ? { ...msg, loading: false, error: true }
                : msg
            );
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        })
      );
    }
  };

  const currentChat = chats.find((chat) => chat.id === activeChat);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      {/* Sidebar */}
      <div
        className={`
    bg-white border-r transition-all duration-300 flex flex-col
    fixed md:relative z-50 h-full
    ${isSidebarOpen ? "left-0 w-64" : "-left-64 w-64"} md:left-0 md:w-64
  `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <img
            src="./namelogo.png"
            alt="Modelfarm Logo"
            className="h-10 w-[80%]"
          />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 flex justify-between items-center">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-2">
          <p className="text-xs text-gray-500 uppercase px-2 mt-2">Chats</p>
          {chats.length === 0 && <p className="text-xs text-gray-400 p-2">No chats yet</p>}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${activeChat === chat.id ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
            >
              <MessageSquare size={16} className="text-gray-600" />
              <span className="truncate">{chat.title}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <Menu size={18} />
              </button>
            )}
            <h1 className="text-lg font-semibold">{"AI Design Generator"}</h1>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentChat?.messages?.map((msg, i) => (
            <div key={i} className="flex flex-col gap-2">
              {msg.sender === "user" && (
                <div className="flex justify-end">
                  <div className="bg-black text-white p-3 rounded-lg max-w-lg">{msg.prompt}</div>
                </div>
              )}

              {msg.sender === "ai" && (
                <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
                  {msg.loading && (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                  )}

                  {!msg.loading && msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {msg.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img.base64 ? `data:image/png;base64,${img.base64}` : img.url}
                            alt={`Generated ${idx}`}
                            className="rounded border h-52 w-auto object-contain cursor-pointer"
                            onClick={() => setModalImage(img.base64 ? `data:image/png;base64,${img.base64}` : img.url)}
                          />

                          <a
                            href={img.base64 ? `data:image/png;base64,${img.base64}` : img.url}
                            download={`generated_${idx + 1}.png`}
                            className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded hover:bg-opacity-90"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.error && <p className="text-red-500">❌ Failed to generate images.</p>}
                </div>
              )}
            </div>
          ))}

          {!currentChat && <div className="text-gray-400 text-center mt-20">Start a new chat to begin</div>}
        </div>

        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <div
              className="relative max-w-3xl max-h-[80%] p-2"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking on image container
            >
              <button
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                onClick={() => setModalImage(null)}
              >
                <X size={24} />
              </button>
              <img
                src={modalImage}
                alt="Modal"
                className="max-h-[80vh] max-w-full rounded"
              />
            </div>
          </div>
        )}


        {activeChat && <ChatInput onSend={(msg) => handleSend(currentChat.id, msg)} loading={false} />}
      </div>
    </div>
  );
}
