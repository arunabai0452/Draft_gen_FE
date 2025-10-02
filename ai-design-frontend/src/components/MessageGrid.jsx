import React, { useEffect, useRef } from "react";

export default function MessageGrid({ messages, loading }) {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom when new message appears
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto mt-4 mb-32">
            {messages.map((msg, idx) => (
                <div key={idx}>
                    {/* User message */}
                    <div className="text-right mb-2">
                        <span className="inline-block bg-blue-500 text-white px-3 py-2 rounded-lg">
                            {msg.prompt}
                        </span>
                    </div>

                    {/* AI loading indicator (snake dots) */}
                    {msg.loading && (
                        <div className="flex items-center gap-1 mb-4">
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-0"></div>
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-400"></div>
                        </div>
                    )}

                    {/* AI generated images */}
                    {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-4 justify-start">
                            {msg.images.map((img, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={img.base64 ? `data:image/png;base64,${img.base64}` : img.url}
                                        alt={`Generated ${i}`}
                                        className="rounded border h-52 w-auto object-contain"
                                    />
                                    <a
                                        href={img.base64 ? `data:image/png;base64,${img.base64}` : img.url}
                                        download={`generated_${i + 1}.png`}
                                        className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded hover:bg-opacity-90"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
