"use client";
import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, User, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import VideoCallFrame from '@/app/components/video/VideoCallFrame';
import { useSession } from 'next-auth/react';

export default function VideoCallsPage() {
    const { data: session } = useSession();
    const [activeCall, setActiveCall] = useState(null);
    const [isStartingCall, setIsStartingCall] = useState(false);

    // Mock function to start a call - in real app this would call API
    const startCall = async () => {
        setIsStartingCall(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock response
            setActiveCall({
                url: 'https://luxe-atelier.daily.co/demo-room',
                token: 'demo-token' // In real app, this comes from backend
            });
        } catch (error) {
            console.error('Failed to start call:', error);
        } finally {
            setIsStartingCall(false);
        }
    };

    if (activeCall) {
        return (
            <div className="h-[calc(100vh-8rem)]">
                <VideoCallFrame
                    url={activeCall.url}
                    token={activeCall.token}
                    onLeave={() => setActiveCall(null)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Calls</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your consultations and fittings</p>
                </div>
                <Button onClick={startCall} disabled={isStartingCall}>
                    {isStartingCall ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                    {isStartingCall ? 'Starting Call...' : 'Start Instant Call'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Calls */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Consultations</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
                        <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No upcoming calls</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">You don't have any scheduled video consultations.</p>
                        <Button variant="outline">View Calendar</Button>
                    </div>
                </div>

                {/* Quick Actions / History */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Call History</h2>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No past calls.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
