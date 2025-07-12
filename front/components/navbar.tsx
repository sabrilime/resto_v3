"use client";

import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import { UserProfile } from "./user-profile";

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
                    <img
                        src="/resto-lover-logo.png"
                        alt="Resto Lover Logo"
                        className="hidden md:block h-16 max-w-[220px] w-auto"
                    />
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                <ModeToggle />
                <UserProfile />
            </div>
        </div>
    )
}