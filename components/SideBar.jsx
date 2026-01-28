"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  BookOpen,
  Star,
  Folder,
  Users,
  Settings,
  HelpCircle,
  TrendingUp,
  Clock,
  Download,
  Upload,
  User,
  LogOut,
  Plus,
  Search,
  Zap,
  Globe,
  Bell,
  FolderOpen,
  Book,
  Shield,
} from "lucide-react";

const navItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "All Documents", href: "/docs", icon: FileText, badge: "12" },
  { title: "Notes", href: "/notes", icon: BookOpen, badge: "8" },
  { title: "Starred", href: "/starred", icon: Star },
  { title: "Categories", href: "/categories", icon: Folder },
  { title: "Shared", href: "/shared", icon: Users, badge: "3" },
  { title: "Trending", href: "/trending", icon: TrendingUp },
  { title: "Recent", href: "/recent", icon: Clock },
];

const toolsItems = [
  { title: "Import", href: "/import", icon: Download },
  { title: "Export", href: "/export", icon: Upload },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help & Support", href: "/help", icon: HelpCircle },
];

const premiumFeatures = [
  { title: "AI Assistant", icon: Zap },
  { title: "Global Sync", icon: Globe },
  { title: "Priority Support", icon: Shield },
];

export default function SideBar() {
  const [search, setSearch] = useState("");
  const [storage, setStorage] = useState(65); // 65% used

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="pt-6 px-6">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/avatar.jpg" alt="John Doe" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              JD
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white font-montserrat">
              John Doe
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Premium User
            </div>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            PRO
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* New Document Button */}
        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 mb-6">
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-6">
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                        {item.badge && (
                          <Badge className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Premium Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Premium Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {premiumFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                  >
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {feature.title}
                    </span>
                    <Badge className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Active
                    </Badge>
                  </div>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 pb-6">
        {/* Storage Usage */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Storage
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              32.5 GB / 50 GB
            </span>
          </div>
          <Progress value={storage} className="h-2" />
        </div>

        {/* Version Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>Version</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">v2.1.0</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}