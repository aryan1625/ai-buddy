"use client";
import { cn } from "@/lib/utils";
import { Menu,Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { DotIcon } from "lucide-react";
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { ModeToggle } from "./ui/mode-toggle";
import { MobileSideBar } from "@/components/mobile-sidebar";
import { useProModal } from "@/hooks/use-pro-modal";
const font = Poppins({
    weight: "600",
    subsets: ["latin"]
})
interface NavbarProps {
    isPro?: boolean;    
}
export const Navbar = ({isPro}:NavbarProps) => {
    const proModal = useProModal();

    return (
        <div className="fixed w-full z-50 flex justify-between items-center py-2,py-4 border-b border-primary/10 bg-secondary h-16">
            <div className="flex items-center">
                <MobileSideBar/>
                {/* <Menu className = "block md:hidden"/> */}
                <Link href = "/">
                    <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary",
                        font.className
                    )}>AI Buddy</h1>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                {!isPro && (
            <Button className={buttonVariants({ variant: "premium" })} onClick={proModal.onOpen}>Upgrade 
                    <Sparkles className="w-4 h-4 fill-white text-white ml-2" />
            </Button>
                )
                }
            <ModeToggle/>
            <UserButton >
                <UserButton.MenuItems>
                <UserButton.Action label="signOut"  />
                <UserButton.Link
                    label="Create organization"
                    labelIcon={<DotIcon />}
                    href="/create-organization"
                />
                <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
            </UserButton>

            </div>
        </div>
    )
}
