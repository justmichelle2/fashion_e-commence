"use client";
import React, { useState } from 'react';
import {
    Video,
    CalendarClock,
    CalendarDays,
    Clock,
    User,
    Loader2,
    Phone,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    MessageSquare,
    FileText,
    Ruler,
    Link2,
    Star,
    MapPin,
    Headphones
} from 'lucide-react';
import Button from '@/components/Button';
import VideoCallFrame from '@/app/components/video/VideoCallFrame';
import { useSession } from 'next-auth/react';

const upcomingConsultations = [
    {
        id: 'FIT-2094',
        client: 'Amelia Royce',
        service: 'Virtual fitting + atelier tour',
        slot: 'Today • 6:00 PM GMT+1',
        duration: '45 min',
        status: 'confirmed',
        tags: ['VIP', 'Bespoke order'],
        platform: 'Daily room',
        notes: ['Prefers natural lighting'],
        location: 'London',
        timezone: 'GMT+1'
    },
    {
        id: 'CONS-3180',
        client: 'Lina Park',
        service: 'Sketch review & sourcing',
        slot: 'Tomorrow • 9:30 AM GMT+9',
        duration: '30 min',
        status: 'awaiting brief',
        tags: ['Materials'],
        platform: 'Daily room',
        notes: ['Has reference photos ready'],
        location: 'Seoul',
        timezone: 'GMT+9'
    },
    {
        id: 'VIP-8821',
        client: 'Noor Almasi',
        service: 'Bespoke capsule planning',
        slot: 'Fri • 4:00 PM EST',
        duration: '60 min',
        status: 'prep kit sent',
        tags: ['VIP', 'Stylist'],
        platform: 'Secure Daily suite',
        notes: ['Stylist joining from NYC'],
        location: 'New York',
        timezone: 'EST'
    }
];

const callQueue = [
    {
        id: 'FIT-2094',
        stage: 'Now',
        eta: 'Starts in 4 min',
        client: 'Amelia Royce',
        service: 'Virtual fitting',
        channel: 'daily.co/aurora',
        notes: 'Share lace swatches live'
    },
    {
        id: 'CONS-3180',
        stage: 'Next',
        eta: 'in 58 min',
        client: 'Lina Park',
        service: 'Sketch review',
        channel: 'daily.co/sketches',
        notes: 'Translator requested'
    }
];

const callHistory = [
    { id: 'HIST-930', client: 'Jonas Weber', result: 'Measurements locked', duration: '32m', rating: 5, followUp: 'Sketch deck sent' },
    { id: 'HIST-931', client: 'Priya Das', result: 'Fabric samples shipped', duration: '26m', rating: 4, followUp: 'Courier arranged' }
];

const prepResources = [
    { id: 'measurements', label: 'Measurement sheet', detail: 'Updated 3h ago', icon: Ruler },
    { id: 'lookbook', label: 'Lookbook PDF', detail: '14 curated looks', icon: FileText },
    { id: 'link', label: 'Share call link', detail: 'daily.co/luxe/noor', icon: Link2 }
];

export default function VideoCallsPage() {
    const { data: session } = useSession();
    const [activeCall, setActiveCall] = useState(null);
    const [loadingCallId, setLoadingCallId] = useState(null);

    const startCall = async (payload = {}) => {
        const callId = payload.id || 'instant';
        setLoadingCallId(callId);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            setActiveCall({
                url: 'https://luxe-atelier.daily.co/demo-room',
                token: 'demo-token',
                client: payload.client || 'Instant guest',
                service: payload.service || 'Instant consultation',
                bookingId: callId,
                slot: payload.slot || 'Now',
                platform: payload.platform || 'Daily room',
                notes: payload.notes || ['Share moodboard inside chat'],
                tags: payload.tags || ['Drop-in'],
                timezone: payload.timezone || session?.user?.timezone || 'GMT+1'
            });
        } catch (error) {
            console.error('Failed to start call:', error);
        } finally {
            setLoadingCallId(null);
        }
    };

    if (activeCall) {
        return (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
                <div className="xl:col-span-3 h-full min-h-[520px]">
                    <VideoCallFrame
                        url={activeCall.url}
                        token={activeCall.token}
                        onLeave={() => setActiveCall(null)}
                    />
                </div>
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Session</p>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Consultation with {activeCall.client}</h2>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">In progress</span>
                        </div>
                        <dl className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-between">
                                <dt>Service</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">{activeCall.service}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Booking ID</dt>
                                <dd>#{activeCall.bookingId}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Platform</dt>
                                <dd>{activeCall.platform}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Timezone</dt>
                                <dd>{activeCall.timezone}</dd>
                            </div>
                        </dl>
                        <div className="mt-6 space-y-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Prep notes</p>
                            {activeCall.notes?.map((note, index) => (
                                <div key={`${note}-${index}`} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm">
                                    {note}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {activeCall.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Button variant="outline">Share lookbook</Button>
                            <Button variant="secondary">Send follow-up</Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Connection telemetry</h3>
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-gray-500">Latency</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">210 ms</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-gray-500">Bitrate</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">4.2 Mbps</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-gray-500">Recording</dt>
                                <dd className="font-medium text-gray-900 dark:text-white">Enabled</dd>
                            </div>
                        </dl>
                        <p className="text-xs text-gray-500 mt-4">Auto-saving to designer vault after call ends.</p>
                    </div>
                </div>
            </div>
        );
    }

    const nextCall = upcomingConsultations[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Real-time concierge</p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Calls</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Plan, rehearse, and host fittings without leaving the dashboard.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Open calendar
                    </Button>
                    <Button onClick={() => startCall()} disabled={loadingCallId === 'instant'} className="gap-2">
                        {loadingCallId === 'instant' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                        {loadingCallId === 'instant' ? 'Preparing room' : 'Start instant call'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Next consultation</p>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{nextCall.client}</h2>
                                <p className="text-sm text-gray-500">{nextCall.service}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {nextCall.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {nextCall.slot}</p>
                                <p className="flex items-center gap-2 mt-1"><MapPin className="h-4 w-4" /> {nextCall.location}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => startCall(nextCall)}
                                    disabled={loadingCallId === nextCall.id}
                                    className="gap-2"
                                >
                                    {loadingCallId === nextCall.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                                    {loadingCallId === nextCall.id ? 'Connecting...' : 'Join rehearsal'}
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Send reminder
                                </Button>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[{
                                label: 'Prep kit',
                                value: 'Delivered',
                                trend: '+2 assets',
                                icon: CheckCircle2,
                                trendPositive: true
                            }, {
                                label: 'Attendees',
                                value: '2 confirmed',
                                trend: 'Stylist added',
                                icon: User,
                                trendPositive: true
                            }, {
                                label: 'Follow-ups',
                                value: 'Draft ready',
                                trend: 'Auto after call',
                                icon: Sparkles,
                                trendPositive: true
                            }].map(metric => (
                                <div key={metric.label} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{metric.label}</span>
                                        <metric.icon className="h-4 w-4" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">{metric.value}</p>
                                    <p className={`text-xs mt-1 ${metric.trendPositive ? 'text-green-600' : 'text-gray-500'}`}>{metric.trend}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming consultations</h2>
                                <p className="text-xs text-gray-500">Hand off to stylists or start calls directly</p>
                            </div>
                            <CalendarDays className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {upcomingConsultations.map(consult => (
                                <div key={consult.id} className="p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{consult.client}</p>
                                        <p className="text-sm text-gray-500">{consult.service}</p>
                                        <p className="text-xs text-gray-400 mt-1">{consult.slot}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <span>Duration: {consult.duration}</span>
                                        <span>Status: {consult.status}</span>
                                        <span>Platform: {consult.platform}</span>
                                        <span>Timezone: {consult.timezone}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startCall(consult)}
                                        disabled={loadingCallId === consult.id}
                                        className="gap-2"
                                    >
                                        {loadingCallId === consult.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                                        Join
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Call queue</h3>
                                    <p className="text-xs text-gray-500">Prep in sequence</p>
                                </div>
                                <Headphones className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {callQueue.map(item => (
                                    <div key={item.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-semibold text-gray-900 dark:text-white">{item.stage}</span>
                                            <span>{item.eta}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{item.client}</p>
                                        <p className="text-sm text-gray-500">{item.service}</p>
                                        <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">{item.channel}</span>
                                            <Button size="sm" variant="outline" onClick={() => startCall(upcomingConsultations.find(c => c.id === item.id))}>
                                                Prep room
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prep resources</h3>
                                    <p className="text-xs text-gray-500">Drop directly into chat</p>
                                </div>
                                <Sparkles className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="space-y-3">
                                {prepResources.map(resource => (
                                    <button key={resource.id} className="w-full p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-left">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{resource.label}</p>
                                            <p className="text-xs text-gray-500">{resource.detail}</p>
                                        </div>
                                        <resource.icon className="h-5 w-5 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick actions</h3>
                                <p className="text-xs text-gray-500">For stylists + clients</p>
                            </div>
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            {[{
                                label: 'Send prep kit',
                                detail: 'Measurement sheet, reference deck',
                                icon: CheckCircle2
                            }, {
                                label: 'Share secure link',
                                detail: 'daily.co/atelier/noor',
                                icon: Link2
                            }, {
                                label: 'Invite stylist',
                                detail: 'CC head stylist or buyer',
                                icon: User
                            }].map(action => (
                                <button key={action.label} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-left flex items-center gap-3">
                                    <action.icon className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.label}</p>
                                        <p className="text-xs text-gray-500">{action.detail}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent sessions</h3>
                                <p className="text-xs text-gray-500">Auto-synced notes + ratings</p>
                            </div>
                            <Star className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="space-y-4">
                            {callHistory.map(call => (
                                <div key={call.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{call.client}</p>
                                        <span className="text-xs text-gray-500">{call.duration}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{call.result}</p>
                                    <p className="text-xs text-gray-400">Follow-up: {call.followUp}</p>
                                    <div className="flex items-center gap-1 mt-2 text-amber-500">
                                        {Array.from({ length: call.rating }).map((_, index) => (
                                            <Star key={index} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
