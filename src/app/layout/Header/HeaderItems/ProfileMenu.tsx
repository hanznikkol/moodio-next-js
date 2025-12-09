"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { useSpotify } from "@/lib/spotifyLib/context/spotifyContext";
import { supabase } from "@/lib/supabase/supabaseClient";
import { LogOut } from "lucide-react";
import { FaSpotify } from "react-icons/fa";

interface ProfileMenuProps {
  onOpenArchived?: () => void;
  archivedCount?: number;
}

export default function ProfileMenu({onOpenArchived, archivedCount}: ProfileMenuProps) {
  const { profile, resetAll } = useSpotify();
  const userImage = profile?.images?.[0]?.url;
  const displayName = profile?.display_name || "User";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      resetAll()
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-8 h-8 border-2 border-white/20 hover:border-white/50 duration-200 cursor-pointer">
          <AvatarImage src={userImage ?? ""} />
          <AvatarFallback>
            {displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-black/90 text-white border border-white/10"
      >
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <FaSpotify className="w-4 h-4 text-green-400"/>
          <p className="font-medium">{displayName}</p>
        </div>

        {/* Archive */}
        <DropdownMenuItem 
          onClick={() => onOpenArchived?.()} 
          className="hover:cursor-pointer">
          Archived Items
        </DropdownMenuItem>

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 group data-[highlighted]:bg-red-500 data-[highlighted]:text-white cursor-pointer hover:bg-red-500 hover:text-white">
          Logout
          <LogOut className="w-4 h-4 group-hover:text-white" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
