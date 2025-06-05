// "use client"
// import { Companion, Message } from "@prisma/client"
// import {ChatHeader} from "@/components/chat-header"
// import { useRouter } from "next/navigation";
// import {FormEvent, useState } from "react";
// import { useCompletion } from "@ai-sdk/react";
// import ChatForm from "@/components/chat-form";
// import ChatMessages from "@/components/chat-messages";
// import { ChatMessageProps } from "@/components/chat-message";

// interface ChatClientProps{
//     companion: Companion & {
//         messages: Message[];
//         _count:{
//             messages: number;
//         }
//     }
// }
// export const ChatClient  = ({
//     companion
// }: ChatClientProps) => {
//     const router = useRouter();
//     const [messages,setMessages] = useState<ChatMessageProps[]>(companion.messages);
//     const {
//         input,
//         isLoading,
//         handleInputChange,
//         handleSubmit,
//         setInput,
//     } = useCompletion({
//             api: `/api/chat/${companion.id}`,
//             onFinish(prompt,completion){
//                 const systemMessage: ChatMessageProps = {
//                     role: "system",
//                     content: completion.trim(),
//                 }
//                 setMessages((current)=>[...current,systemMessage]);
//                 setInput("");

//                 router.refresh();
//             }
//         }
//     )
//     const onSubmit = (e: FormEvent<HTMLFormElement>)=>{
//         const userMessage: ChatMessageProps = {
//             role: "user",
//             content: input,
//         }
//         setMessages((current)=>[...current,userMessage]);
//         handleSubmit(e);
//     }
//     return (
//         <div className="flex flex-col h-full p-4 space-y-2">
//             <ChatHeader companion = {companion}/>
//             <ChatMessages companion = {companion} isLoading={isLoading} messages = {messages}/>
//             <ChatForm isLoading = {isLoading} input = {input} handleInputChange={handleInputChange} onSubmit={onSubmit}/>
//         </div>
//     );
// }
 "use client"
import { Companion, Message } from "@prisma/client"
import { ChatHeader } from "@/components/chat-header"
import { useRouter } from "next/navigation";
import { FormEvent, useState, useRef, useEffect } from "react";
import ChatForm from "@/components/chat-form";
import ChatMessages from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    }
  }
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Add user message immediately
    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Add temporary assistant message
      setMessages((current) => [...current, { role: "system", content: "", isLoading: true }]);
      const isProd = process.env.NODE_ENV === "production";
      if(isProd){
        const mockMessage = `This is a mock AI generated response.To generate your own response please go to the [Github Link](https://github.com/aryan1625/ai-buddy) and follow the steps.`
        setMessages((current) => {
          const newMessages = [...current];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: mockMessage,
            isLoading: false
          };
          return newMessages;
        });
      }else{
      const response = await fetch(`/api/chat/${companion.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;  
        // Update the last message incrementally
        setMessages((current) => {
          const newMessages = [...current];
          const lastIndex = newMessages.length - 1;
          
          if (newMessages[lastIndex].role === "system") {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: assistantMessage,
              isLoading: false
            };
          }
          return newMessages;
        });
      }
    }
    // Update database and refresh
    router.refresh();
    } catch (error) {
      console.error("Fetch error:", error);
      // Update with error message
      setMessages((current) => {
        const newMessages = [...current];
        const lastIndex = newMessages.length - 1;
        
        if (newMessages[lastIndex].role === "system") {
          newMessages[lastIndex] = {
            role: "system",
            content: "Sorry, I encountered an error",
            isLoading: false
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader companion={companion} />
      <ChatMessages 
        companion={companion} 
        isLoading={isLoading} 
        messages={messages} 
        messageEndRef={messageEndRef}
      />
      <ChatForm 
        isLoading={isLoading} 
        input={input} 
        handleInputChange={(e) => setInput(e.target.value)} 
        onSubmit={handleSubmit}
      />
    </div>
  );
};