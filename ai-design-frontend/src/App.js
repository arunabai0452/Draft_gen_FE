import React, { useState } from "react";
import ChatInput from "./components/ChatInput";
import MessageGrid from "./components/MessageGrid";

function App() {
  const [messages, setMessages] = useState([]);

  const handleSend = async ({ prompt, file }) => {
    if (!prompt && !file) return;

    // Add user message with loading=true
    const newMessage = { prompt, images: [], loading: true };
    setMessages((prev) => [...prev, newMessage]);

    const formData = new FormData();
    formData.append("user_prompt", prompt);
    if (file) formData.append("file", file);
    formData.append("num_variations", 1);
    formData.append("num_images_per_prompt", 1);

    try {
      const res = await fetch("https://unsure-practicedly-veronique.ngrok-free.dev/generate_with_moodboard", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // Update the message with images and set loading=false
      setMessages((prev) =>
        prev.map((msg) =>
          msg === newMessage ? { ...msg, images: data.images || [], loading: false } : msg
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to generate designs.");

      // Turn off loading even on error
      setMessages((prev) =>
        prev.map((msg) => (msg === newMessage ? { ...msg, loading: false } : msg))
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AI Marketing Design Generator
      </h1>

      {/* Messages appear here */}
      <MessageGrid messages={messages} />

      {/* Input fixed at bottom */}
      <ChatInput onSend={handleSend} loading={messages.some((m) => m.loading)} />
    </div>
  );
}

export default App;
