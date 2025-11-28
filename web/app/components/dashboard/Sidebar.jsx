"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Image as ImageIcon,
    MessageSquare,
    Video,
    Radio,
    DollarSign,
    Settings,
    LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardSidebar() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path || pathname?.startsWith(path + '/');

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/dashboard/products', icon: ShoppingBag },
        { name: 'Orders', href: '/dashboard/orders', icon: Package },
        { name: 'Portfolio', href: '/dashboard/portfolio', icon: ImageIcon },
        { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        { name: 'Video Calls', href: '/dashboard/video-calls', icon: Video },
        { name: 'Live Stream', href: '/dashboard/live', icon: Radio },
        { name: 'Finance', href: '/dashboard/finance', icon: DollarSign },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
            <div className="p-4 flex-1 overflow-y-auto">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
