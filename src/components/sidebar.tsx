"use client"
import { Home,Plus,Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname,useRouter } from "next/navigation";
import { ProModal } from "./pro-modal";
import { useProModal } from "@/hooks/use-pro-modal";
interface SideBarProps{
    isPro: boolean;
}
export const Sidebar = ({isPro}:SideBarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const proModal = useProModal();
    const routes = [
    {
        icon: Home,
        href : "/",
        label: "Home",
        protected: false,
    },
    {
        icon: Plus,
        href : "/companion/new",
        label: "Create",
        protected: true,
    },
    {
        icon: Settings,
        href : "/settings",
        label: "Settings",
        protected: false,
    }
    ]
    const onNavigate = (url: string, pro: boolean)=>{
        //check if pro
        if(pro && !isPro) {
            return proModal.onOpen();
        }
        return router.push(url)

    }
    return (
        <div className="flex flex-col h-full space-y-4 text-primary bg-secondary">
            <div className="p-3 flex flex-1 justify-center">
                <div className="space-y-2">
                    {routes.map((route)=>(
                        <div key = {route.href} onClick={()=>onNavigate(route.href,route.protected)} className = {cn(
                            "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition ",
                            pathname===route.href && "text-primary bg-primary/10"
                        )}>
                            <div className="flex flex-col gap-y-2 items-center flex-1">
                                {route.icon && <route.icon className="w-5 h-5"/>}  
                                {route.label}     
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}