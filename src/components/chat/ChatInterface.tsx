
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperPlaneIcon, PlusCircleIcon, RefreshCw } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { nanoid } from "nanoid";

interface Message {
  id: string;
  message: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

// Sample bot responses for common questions
const getBotResponse = (message: string): string => {
  const normalizedMessage = message.toLowerCase();
  
  if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi ') || normalizedMessage === 'hi') {
    return "Hello! I'm the MPA Assistant. How can I help you today?";
  }
  
  if (normalizedMessage.includes('spark point') || normalizedMessage.includes('sp ') || normalizedMessage.includes('points')) {
    return "Spark Points (SP) are our in-app currency. 1 SP equals 1 INR. You can purchase them through our subscription page and use them to pay for services. We offer packages of 50 SP, 100 SP, 500 SP, and custom amounts. You'll get a 3 SP bonus for every 100 SP purchased!";
  }
  
  if (normalizedMessage.includes('upload') || normalizedMessage.includes('submit') || normalizedMessage.includes('request')) {
    return "To upload a service request, go to the Upload page. Choose a service from our catalog, attach your files (up to 150MB per file, 10 files max, total 1.5GB), and provide detailed instructions. Our team will review your request and process it promptly.";
  }
  
  if (normalizedMessage.includes('payment') || normalizedMessage.includes('pay') || normalizedMessage.includes('upi')) {
    return "We currently process payments manually through UPI transfer. When you purchase Spark Points, you'll see our UPI ID (ja.jamalasraf@fam). After making the transfer, submit your transaction ID for verification. Once verified, SP will be credited to your account automatically.";
  }
  
  if (normalizedMessage.includes('referral') || normalizedMessage.includes('refer')) {
    return "Our referral system gives you 10 SP when someone signs up using your unique referral code. New users get a 15 SP signup bonus and can start using our services immediately. Your referral code can be found on your profile page.";
  }
  
  if (normalizedMessage.includes('work') || normalizedMessage.includes('job') || normalizedMessage.includes('apply')) {
    return "Interested in working with us? Visit our 'Work With Us' page to apply. Submit your details and our admin team will review your application. If approved, you'll be assigned the worker role and can start handling service requests.";
  }
  
  if (normalizedMessage.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  
  // Default fallback response
  return "I'm not sure I understand your question. Could you please rephrase it? You can ask about Spark Points, uploading requests, payments, referrals, or working with us.";
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      message: "Hi there! I'm your MPA Assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      message: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate assistant typing delay
    setTimeout(() => {
      // Add assistant response
      const botResponse: Message = {
        id: nanoid(),
        message: getBotResponse(inputValue),
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: "welcome-message",
        message: "Hi there! I'm your MPA Assistant. How can I help you today?",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] md:h-[70vh] border rounded-lg bg-card overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <h2 className="font-medium">MPA Chat Support</h2>
        <Button variant="outline" size="sm" onClick={startNewChat}>
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            avatar={msg.sender === "assistant" ? "/mpa-assistant.png" : undefined}
          />
        ))}
        
        {isTyping && (
          <div className="flex items-center text-sm text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
            Assistant is typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <Button onClick={handleSendMessage} className="h-10 px-4">
            <PaperPlaneIcon className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ask me about services, Spark Points, uploading projects, or working with us.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
