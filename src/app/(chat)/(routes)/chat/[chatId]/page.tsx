
import prismadb from "@/lib/prismadb";
import { RedirectToSignIn } from "@clerk/nextjs";
import {auth} from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import {ChatClient} from "./components/client";
interface ChatIdPageProps{
    params: Promise<{ chatId: string }>
}
const ChatIdPage = async({
    params
}:ChatIdPageProps) => {
    const {userId} = await auth();
    if(!userId){
        return <RedirectToSignIn/>
    }
    const {chatId} = await params;
    const companion = await prismadb.companion.findUnique({
        where:{
            id: chatId
        },
        include:{
            messages:{
                orderBy:{
                    createdAt: "asc"
                },
                where:{
                    userId,
                }
            },
            _count:{
                select:{
                    messages:true
                }
            }

        }
    })
    if(!companion){
        return redirect("/");
    }
    return (
        <ChatClient companion = {companion}/>
    );
}
 
export default ChatIdPage;