// "use client"
// import {BeatLoader} from "react-spinners";  
// import { useToast } from "@/hooks/use-toast";
// import { useTheme } from "next-themes";
// import UserAvatar from "./user-avatar";
// import { cn } from "@/lib/utils";
// import { Button } from "./ui/button";
// import BotAvatar from "./bot-avatar";
// import { Copy } from "lucide-react";
// export interface ChatMessageProps{
//     role: "user" | "system";
//     content?: string;
//     isLoading?: boolean;
//     src?: string;

// }
// const ChatMessage = ({
//     role,
//     content,
//     isLoading,
//     src
// }: ChatMessageProps) => {
//     const {toast} = useToast(); 
//     const {theme} = useTheme();
//     const onCopy = ()=>{
//         if(!content){
//             return;
//         }
//         navigator.clipboard.writeText(content);
//         toast({
//             description: "Message copied to clipboard!",
//         })
//     }
//     return (
//         <div className={cn("group flex items-start gap-x-3 py-4 w-full ", role==="user" && "justify-end")}>
//             {role !== "user" && src && <BotAvatar src={src}/>}
//             <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
//                 {isLoading?
//                 <BeatLoader 
//                     size = {5}
//                     color={theme==="light"?"black":"white"}/>: content}
//             </div>
//             {role === "user" && <UserAvatar/>}
//             {role !== "user" && !isLoading && (
//                 <Button
//                     onClick = {onCopy}
//                     className="opacity-0 group-hover:opacity-100 transition"   
//                     size = "icon"
//                     variant = "ghost" 
//                 >
//                     <Copy className="w-4 h-4"/>
//                 </Button>
//             )}
//         </div>
//     );
// }
 
// export default ChatMessage;

"use client"
import { BeatLoader } from "react-spinners";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import UserAvatar from "./user-avatar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import BotAvatar from "./bot-avatar";
import { Copy } from "lucide-react";

export interface ChatMessageProps {
  role: string;
  content: string;
  isLoading?: boolean;
  src?: string;
}

const ChatMessage = ({
  role,
  content,
  isLoading,
  src
}: ChatMessageProps) => {
  const { toast } = useToast(); 
  const { theme } = useTheme();
  
  const onCopy = () => {
    if (!content) return;
    
    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard!",
    });
  };

  return (
    <div className={cn(
      "group flex items-start gap-x-3 py-4 w-full",
      role === "user" && "justify-end"
    )}>
      {/* Bot Avatar */}
      {role !== "user" && src && <BotAvatar src={src} />}
      
      {/* Message Content */}
      <div className={cn(
        "rounded-md px-4 py-2 max-w-sm text-sm",
        role === "user" 
          ? "bg-primary text-primary-foreground" 
          : "bg-primary/10",
        isLoading ? "min-w-[100px] flex items-center justify-center" : ""
      )}>
        {isLoading ? (
          content ? (
            // Partially loaded content
            content
          ) : (
            // Loading spinner when no content yet
            <BeatLoader 
              size={5}
              color={theme === "light" ? "black" : "white"}
            />
          )
        ) : (
          // Fully loaded content
          content
        )}
      </div>
      
      {/* User Avatar */}
      {role === "user" && <UserAvatar />}
      
      {/* Copy Button */}
      {role !== "user" && !isLoading && content && (
        <Button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 transition"   
          size="icon"
          variant="ghost"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default ChatMessage;