
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  sender: "user" | "assistant";
  timestamp: Date;
  avatar?: string;
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  sender,
  timestamp,
  avatar,
  className,
}) => {
  const isUser = sender === "user";
  
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] md:max-w-[70%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Avatar className={cn("h-8 w-8", isUser ? "ml-2" : "mr-2")}>
          {avatar ? (
            <AvatarImage src={avatar} />
          ) : (
            <AvatarFallback>
              {isUser ? "U" : "AI"}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex flex-col">
          <div
            className={cn(
              "px-4 py-2 rounded-lg",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted rounded-tl-none"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          </div>
          <span
            className={cn(
              "text-[10px] text-muted-foreground mt-1",
              isUser ? "text-right" : "text-left"
            )}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
