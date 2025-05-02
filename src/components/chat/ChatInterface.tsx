
import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, PaperclipIcon, ArrowDownCircle } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AdPlaceholder } from "@/components/ads/AdPlaceholder";

interface Message {
  id: string;
  message: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Welcome message when chat first loads
  useEffect(() => {
    const welcomeMessage = {
      id: "welcome",
      message: "Hello! I'm your MPA assistant. How can I help you today with Multi Project Association?",
      sender: "assistant" as const,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add scroll event listener to show/hide scroll button
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      message: input.trim(),
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simple response generation logic - we'd replace this with an actual AI API call
      const botResponses = [
        "I'm here to help you with managing your projects in MPA!",
        "You can upload your projects via the Upload page.",
        "To check your profile details, navigate to Account Settings.",
        "Need help with subscriptions? Visit the Subscription page.",
        "MPA supports various file formats for your projects.",
        "Don't forget to check our referral program for bonus points!",
        "You can report errors via the Error Report page if you encounter any issues.",
        "Our team is working to improve MPA every day.",
      ];
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create bot response
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage = {
        id: `assistant-${Date.now()}`,
        message: randomResponse,
        sender: "assistant" as const,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[80vh] border shadow-md">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>MPA Assistant</span>
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Online</span>
        </CardTitle>
        <CardDescription>
          Get help with managing your projects and using MPA features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow relative">
        <ScrollArea
          className="h-full px-4 py-2" 
          ref={scrollAreaRef}
        >
          <div className="space-y-4 min-h-full pb-2">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.message}
                sender={msg.sender}
                timestamp={msg.timestamp}
                avatar={msg.sender === 'user' ? user?.user_metadata?.avatar_url : undefined}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            className="absolute bottom-4 right-4 rounded-full shadow-lg opacity-80"
            size="sm"
            variant="secondary"
            onClick={scrollToBottom}
          >
            <ArrowDownCircle className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
      
      <div className="px-4 py-2">
        <AdPlaceholder type="inline" className="my-2" />
      </div>
      
      <CardFooter className="pt-0 px-4 pb-4">
        <div className="flex items-end w-full gap-2 border rounded-lg p-2 bg-background">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-grow min-h-[60px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant="ghost"
              disabled={isLoading}
              className="rounded-full h-8 w-8"
            >
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-full h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
