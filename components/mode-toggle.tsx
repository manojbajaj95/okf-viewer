"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip="Theme"
                className="text-sidebar-foreground/70"
              />
            }
          >
            <span className="relative size-4 shrink-0">
              <SunIcon className="size-4 scale-100 rotate-0 transition-transform duration-200 motion-reduce:transition-none dark:scale-0 dark:-rotate-90" />
              <MoonIcon className="absolute inset-0 size-4 scale-0 rotate-90 transition-transform duration-200 motion-reduce:transition-none dark:scale-100 dark:rotate-0" />
            </span>
            <span>Theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-40">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
