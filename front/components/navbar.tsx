"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { MobileSidebar } from "./mobile-sidebar";

const font = Poppins({
    weight: "600",
    subsets: ["latin"]
});

export const Navbar = () => {
    return (
        <div className="fixed w-full z-50 flex justify-between 
        items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
            <div className="flex items-center">
                <MobileSidebar />
                <Link href="/">
                    <h1 className={cn(
                        "hidden md:block text-xl md:text-3xl font-bold text-primary",
                        font.className
                    )}>
                        Resto-Lover
                    </h1>
                    <h4 className="hidden md:block">Ile-de-France</h4>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                <ModeToggle />
                <UserButton />
            </div>
        </div>
    )
}