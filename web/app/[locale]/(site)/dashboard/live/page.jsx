"use client";
import React from 'react';
import { Radio, Users, Play, BarChart2 } from 'lucide-react';
import Button from '@/components/Button';

export default function LiveStreamPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Streaming</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect with your audience in real-time</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Radio className="mr-2 h-4 w-4" />
                    Go Live Now
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        <div className="text-center relative z-10 p-6">
                            <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform cursor-pointer">
                                <Play className="h-8 w-8 text-white ml-1" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Ready to stream?</h3>
                            <p className="text-gray-300 mt-2">Check your camera and microphone settings before going live.</p>
                        </div>
                    </div>
                </div>

                {/* Stats & Settings */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stream Stats</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <Users className="h-5 w-5 mx-auto text-blue-500 mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                                <p className="text-xs text-gray-500">Followers</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <BarChart2 className="h-5 w-5 mx-auto text-green-500 mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">0h</p>
                                <p className="text-xs text-gray-500">Streamed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
