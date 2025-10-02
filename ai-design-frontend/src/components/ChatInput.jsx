import React, { useState } from "react";
import { Send, X } from "lucide-react";

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSend = () => {
    if (!text.trim() && !file) return;
    onSend({ prompt: text, file });
    setText("");
    setFile(null);
    setPreview(null);
    document.getElementById("fileInput").value = null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    document.getElementById("fileInput").value = null;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex flex-col items-center">
      {/* File preview */}
      {preview && (
        <div className="mb-2 relative w-full max-w-3xl flex justify-start">
          <img
            src={preview}
            alt="Moodboard Preview"
            className="rounded border h-20 w-auto object-contain"
          />
          <button
            onClick={removeFile}
            className="absolute top-0 left-20 -ml-4 bg-gray-200 hover:bg-gray-300 rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center w-full max-w-3xl rounded-full border px-4 py-2 shadow-sm bg-white">
        {/* Plus button */}
        <label
          htmlFor="fileInput"
          className={`text-gray-500 hover:text-gray-700 text-xl font-bold mr-2 cursor-pointer ${
            loading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          +
        </label>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />

        {/* Text input */}
        <textarea
          placeholder="Type your design prompt..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-gray-800 placeholder-gray-400"
          disabled={loading}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-black text-white p-2 rounded-full flex items-center justify-center disabled:opacity-50 ml-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
