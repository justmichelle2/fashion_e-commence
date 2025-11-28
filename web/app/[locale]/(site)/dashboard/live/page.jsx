"use client";
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    Radio,
    Calendar,
    CalendarClock,
    Users,
    Activity,
    Gauge,
    Sparkles,
    Mic,
    Video,
    Volume2,
    Layers,
    CheckCircle2,
    Circle,
    MessageSquare,
    ArrowRight,
    Wifi,
    Play
} from 'lucide-react';
import Button from '@/components/Button';

const scenePresets = [
    {
        id: 'atelier',
        label: 'Atelier Cam',
        description: 'Wide shot with detail overlay',
        gradient: 'from-purple-500/30 via-slate-900 to-black'
    },
    {
        id: 'details',
        label: 'Detail Cam',
        description: 'Macro lens for beadwork',
        gradient: 'from-amber-500/30 via-zinc-900 to-black'
    },
    {
        id: 'runway',
        label: 'Runway Loop',
        description: 'Pre-recorded looks with CTA',
        gradient: 'from-blue-500/30 via-slate-900 to-black'
    }
];

const scheduledStreams = [
    { id: 1, title: 'Bespoke bridal fittings', platform: 'Instagram Live', date: 'Thu, Mar 14', time: '7:00 PM' },
    { id: 2, title: 'Designer AMA', platform: 'TikTok Live', date: 'Sat, Mar 16', time: '9:30 PM' },
    { id: 3, title: 'Atelier tour', platform: 'YouTube Live', date: 'Tue, Mar 19', time: '6:00 PM' }
];

const defaultChat = [
    { id: 1, name: 'Sienna', badge: 'VIP', message: 'Can we see the back of the Aurora gown again?', time: '4s ago' },
    { id: 2, name: 'Noor', badge: 'Pinned', message: 'How long is the made-to-order timeline?', time: '27s ago' },
    { id: 3, name: 'Alex', badge: 'New', message: 'Is there a way to customize the neckline?', time: '1m ago' }
];

const showFlow = [
    { id: 'intro', label: 'Backstage intro', duration: '02 min', status: 'done' },
    { id: 'lookbook', label: 'Lookbook walkthrough', duration: '08 min', status: 'live' },
    { id: 'qna', label: 'VIP Q&A', duration: '05 min', status: 'next' },
    { id: 'cta', label: 'Custom order CTA', duration: '02 min', status: 'queued' }
];

const checklistTemplate = [
    { id: 'camera', label: 'Camera white balance locked', done: true },
    { id: 'audio', label: 'Audio levels calibrated', done: true },
    { id: 'products', label: 'Product spotlight queued', done: false },
    { id: 'links', label: 'Shop links synced', done: false }
];

const formatDuration = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

export default function LiveStreamPage() {
    const [isLive, setIsLive] = useState(false);
    const [liveStart, setLiveStart] = useState(null);
    const [elapsed, setElapsed] = useState('00:00:00');
    const [selectedScene, setSelectedScene] = useState(scenePresets[0].id);
    const [controls, setControls] = useState({ mic: true, camera: true, overlays: true, music: false, recording: true });
    const [chatMessages, setChatMessages] = useState(defaultChat);
    const [chatDraft, setChatDraft] = useState('');
    const [checklist, setChecklist] = useState(checklistTemplate);

    useEffect(() => {
        if (!liveStart) return;
        const tick = () => setElapsed(formatDuration(Date.now() - liveStart));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [liveStart]);

    const liveStats = useMemo(() => ({
        viewers: isLive ? '248' : '—',
        likes: isLive ? '652' : '—',
        conversions: isLive ? '12' : '—',
        retention: isLive ? '82%' : '—'
    }), [isLive]);

    const checklistProgress = useMemo(() => {
        const completed = checklist.filter(item => item.done).length;
        return Math.round((completed / checklist.length) * 100);
    }, [checklist]);

    const toggleLive = () => {
        if (isLive) {
            setIsLive(false);
            setLiveStart(null);
            setElapsed('00:00:00');
            return;
        }
        setIsLive(true);
        setLiveStart(Date.now());
    };

    const toggleControl = useCallback((key) => {
        setControls(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const handleChecklistToggle = (id) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (!chatDraft.trim()) return;
        setChatMessages(prev => [
            { id: Date.now(), name: 'You', badge: 'Host', message: chatDraft.trim(), time: 'Just now' },
            ...prev
        ]);
        setChatDraft('');
    };

    const currentScene = scenePresets.find(scene => scene.id === selectedScene);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Real-time studio</p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Streaming</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stage immersive runway drops and bespoke fittings directly from your atelier.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Schedule Broadcast
                    </Button>
                    <Button
                        className={`${isLive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} gap-2`}
                        onClick={toggleLive}
                    >
                        <Radio className="h-4 w-4" />
                        {isLive ? 'End Broadcast' : 'Go Live Now'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="relative bg-gray-950 rounded-2xl overflow-hidden aspect-video border border-gray-800">
                        <div className={`absolute inset-0 bg-gradient-to-br ${currentScene?.gradient || 'from-slate-800 to-black'}`} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)]" />
                        <div className="absolute top-4 left-4 flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${isLive ? 'bg-red-500 text-white' : 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/40'}`}>
                                {isLive ? 'LIVE' : 'STANDBY'}
                            </span>
                            <span className="text-sm font-mono text-white/90">{isLive ? elapsed : '00:00:00'}</span>
                        </div>
                        <div className="absolute top-4 right-4 flex items-center gap-3 text-xs text-white/80">
                            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm flex items-center gap-2">
                                <Wifi className={`h-4 w-4 ${isLive ? 'text-green-300' : 'text-gray-300'}`} />
                                <span>{isLive ? 'Excellent signal' : 'Health check ready'}</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{liveStats.viewers === '—' ? 'Waiting room' : `${liveStats.viewers} viewers`}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white space-y-2">
                            <p className="text-lg font-semibold">{currentScene?.label}</p>
                            <p className="text-sm text-white/70">{currentScene?.description}</p>
                        </div>
                        <div className="absolute bottom-4 right-4 w-64 bg-black/50 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between text-xs text-white/70 mb-3">
                                <span>Spotlight queue</span>
                                <span>Live sync</span>
                            </div>
                            <div className="space-y-2">
                                {['Aurora Gown', 'Tuileries Suit'].map((product, index) => (
                                    <div key={product} className="flex items-center justify-between text-sm text-white">
                                        <div>
                                            <p className="font-medium">{product}</p>
                                            <p className="text-xs text-white/60">{index === 0 ? 'Champagne silk' : 'Graphite wool'}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-white/80 hover:text-white px-3 py-1">
                                            Feature
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center text-center text-white">
                                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <Play className="h-8 w-8" />
                                </div>
                                <p className="text-sm text-white/80">{isLive ? 'Broadcasting to multi-platform destinations' : 'Preview feed ready. Run preflight checklist before going live.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Pulse</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Live chat, pinned questions, and VIP requests.</p>
                                </div>
                                <MessageSquare className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-h-64">
                                {chatMessages.map(message => (
                                    <div key={message.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{message.name}</span>
                                                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-900 text-white">{message.badge}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{message.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{message.message}</p>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                                <input
                                    value={chatDraft}
                                    onChange={(e) => setChatDraft(e.target.value)}
                                    placeholder="Drop a host reply..."
                                    className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                <Button type="submit" size="sm" disabled={!chatDraft.trim()}>
                                    Send
                                </Button>
                            </form>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Go-live checklist</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{checklistProgress}% verified</p>
                                </div>
                                <Sparkles className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${checklistProgress}%` }} />
                            </div>
                            <div className="mt-5 space-y-3">
                                {checklist.map(item => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => handleChecklistToggle(item.id)}
                                        className="w-full flex items-start gap-3 text-left"
                                    >
                                        {item.done ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                        )}
                                        <span className={`text-sm ${item.done ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Studio controls</h2>
                                <p className="text-xs text-gray-500">Signal routing & safety toggles</p>
                            </div>
                            <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[{
                                key: 'mic',
                                label: 'Mic',
                                icon: Mic,
                                description: 'Spatial audio'
                            }, {
                                key: 'camera',
                                label: 'Camera',
                                icon: Video,
                                description: '4K feed'
                            }, {
                                key: 'music',
                                label: 'Music bed',
                                icon: Volume2,
                                description: 'Lo-fi mix'
                            }, {
                                key: 'overlays',
                                label: 'Overlays',
                                icon: Layers,
                                description: 'CTAs & captions'
                            }].map(control => (
                                <button
                                    key={control.key}
                                    type="button"
                                    onClick={() => toggleControl(control.key)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition ${controls[control.key]
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <control.icon className="h-5 w-5" />
                                        <span className={`text-xs font-medium ${controls[control.key] ? 'text-green-300' : 'text-gray-400'}`}>
                                            {controls[control.key] ? 'On' : 'Off'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold mt-4">{control.label}</p>
                                    <p className="text-xs text-gray-400 mt-1">{control.description}</p>
                                </button>
                            ))}
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Scene presets</p>
                            <div className="flex flex-wrap gap-2">
                                {scenePresets.map(scene => (
                                    <button
                                        key={scene.id}
                                        type="button"
                                        onClick={() => setSelectedScene(scene.id)}
                                        className={`px-4 py-2 rounded-full text-sm border ${selectedScene === scene.id
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                    >
                                        {scene.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance telemetry</h2>
                                <p className="text-xs text-gray-500">Auto-refreshing every 5s</p>
                            </div>
                            <Gauge className="h-5 w-5 text-emerald-500" />
                        </div>
                        <dl className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <dt className="text-xs text-gray-500">Live viewers</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{liveStats.viewers}</dd>
                                <p className="text-xs text-green-600 mt-1">+12% vs avg</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <dt className="text-xs text-gray-500">Engagement</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{liveStats.likes}</dd>
                                <p className="text-xs text-gray-500 mt-1">Tap & chat events</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <dt className="text-xs text-gray-500">Conversions</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{liveStats.conversions}</dd>
                                <p className="text-xs text-green-600 mt-1">+3 new carts</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <dt className="text-xs text-gray-500">Retention</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{liveStats.retention}</dd>
                                <p className="text-xs text-gray-500 mt-1">Avg watch time 7m</p>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Run of show</h2>
                                <p className="text-xs text-gray-500">Next up: VIP Q&A</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {showFlow.map(step => (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${step.status === 'live'
                                        ? 'bg-red-100 text-red-600'
                                        : step.status === 'next'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {step.duration}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{step.label}</p>
                                        <p className="text-xs text-gray-500">Status: {step.status}</p>
                                    </div>
                                    <Button size="sm" variant="outline">Cue</Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming broadcasts</h2>
                                <p className="text-xs text-gray-500">Keep your runway calendar full</p>
                            </div>
                            <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {scheduledStreams.map(stream => (
                                <div key={stream.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{stream.title}</p>
                                        <span className="text-xs text-gray-500">{stream.platform}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-3">
                                        <span>{stream.date}</span>
                                        <span>{stream.time}</span>
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
