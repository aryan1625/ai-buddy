"use client"
import axios from "axios";
import { Companion,Message } from "@prisma/client";
import { Button } from "./ui/button";
import { ChevronLeft,MessagesSquare,MoreVertical,Edit,Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import BotAvatar from "./bot-avatar";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuItem,DropdownMenuContent } from "./ui/dropdown-menu";
interface ChatHeaderProps{
    companion: Companion & {
        messages: Message[];
        _count:{
            messages: number;
        };  
    }
}
export const ChatHeader = ({companion}: ChatHeaderProps) => {
    const router = useRouter();
    const {user} = useUser();
    const {toast} = useToast();
    const onDelete = async()=>{
        try {
            await axios.delete(`/api/companion/${companion.id}`);
            toast({
                description:"Companion deleted successfully.",
            });
            router.refresh();
            router.push("/");
        } catch (error) {
            toast({
                description: "Something went wrong.",
                variant: "destructive"
            })
        }
    }
    return (
        <div className="flex w-full justify-between items-center pb-4 border-b border-primary/10">
            <div className="flex gap-x-2 items-center ">
                <Button onClick={()=>router.back()} size="icon" variant="ghost">
                    <ChevronLeft className="h-8 w-8 "/>
                </Button>
                <BotAvatar src={companion.src}/>
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="font-bold ">
                            {companion.name}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <MessagesSquare className="w-3 h-3 mr-1 "/>
                            {companion._count.messages}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Created By {companion.userName}
                    </p>
                </div>
            </div>
            {user?.id === companion.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="secondary" size="icon">
                            <MoreVertical/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align = "end">
                        <DropdownMenuItem onClick={()=>router.push(`/companion/${companion.id}`)}>
                            <Edit className="w-4 h-4 mr-2"/>Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            <Trash className="w-4 h-4 mr-2"/>Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
 