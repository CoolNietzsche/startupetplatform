import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Messages() {
  const [messages, setMessages] = useState<{ id: number; text: string; fromAdmin: boolean }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Simulate fetching initial messages from an API
    const initialMessages = [
      { id: 1, text: "Welcome to the chat!", fromAdmin: true },
      { id: 2, text: "How can I assist you today?", fromAdmin: true },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = { id: messages.length + 1, text: newMessage, fromAdmin: false };
    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-[70%] p-4 mx-auto max-h-[70vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold mb-2 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-gray-600" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg ${
                  message.fromAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
							onKeyDown={(e) => e.key === "Enter" && handleSendMessage() && e.currentTarget.focus()}
            />
            <Button onClick={handleSendMessage} className="bg-blue-500 text-white">
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}