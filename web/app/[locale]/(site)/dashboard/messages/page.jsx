"use client";
import React from 'react';
import { MessageSquare, Search, MoreVertical } from 'lucide-react';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';

export default function MessagesPage() {
    return (
        <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No conversations yet.
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                <div className="text-center p-8">
                    <div className="mx-auto h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select a conversation</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a chat from the left to start messaging.</p>
                </div>
            </div>
        </div>
    );
}
