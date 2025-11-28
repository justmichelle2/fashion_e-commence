"use client";
import React, { useEffect, useState, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, useCallObject, useDaily, useDailyEvent } from '@daily-co/daily-react';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Settings } from 'lucide-react';
import Button from '@/components/Button';

// Call Controls Component
const CallControls = ({ onLeave }) => {
    const callObject = useCallObject();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    useDailyEvent('participant-updated', useCallback(() => {
        const local = callObject?.participants()?.local;
        if (local) {
            setIsMicOn(local.audio);
            setIsCamOn(local.video);
            setIsScreenSharing(local.screen);
        }
    }, [callObject]));

    const toggleMic = () => callObject?.setLocalAudio(!isMicOn);
    const toggleCam = () => callObject?.setLocalVideo(!isCamOn);
    const toggleScreenShare = () => {
        if (isScreenSharing) {
            callObject?.stopScreenShare();
        } else {
            callObject?.startScreenShare();
        }
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 z-50">
            <button
                onClick={toggleMic}
                className={`p-3 rounded-xl transition-all ${isMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                title={isMicOn ? 'Mute' : 'Unmute'}
            >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            <button
                onClick={toggleCam}
                className={`p-3 rounded-xl transition-all ${isCamOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
            >
                {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-xl transition-all ${isScreenSharing ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                title="Share screen"
            >
                <Monitor className="h-5 w-5" />
            </button>

            <div className="w-px h-8 bg-gray-700 mx-1" />

            <button
                onClick={onLeave}
                className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all"
                title="Leave call"
            >
                <PhoneOff className="h-5 w-5" />
            </button>
        </div>
    );
};

// Video Tile Component
const VideoTile = ({ id, isLocal }) => {
    const callObject = useCallObject();
    const [videoTrack, setVideoTrack] = useState(null);
    const [audioTrack, setAudioTrack] = useState(null);
    const [participant, setParticipant] = useState(null);
    const videoRef = React.useRef(null);
    const audioRef = React.useRef(null);

    useDailyEvent('participant-updated', useCallback(() => {
        const p = callObject?.participants()?.[id];
        setParticipant(p);
        setVideoTrack(p?.videoTrack);
        setAudioTrack(p?.audioTrack);
    }, [callObject, id]));

    useEffect(() => {
        if (videoTrack && videoRef.current) {
            videoRef.current.srcObject = new MediaStream([videoTrack]);
        }
    }, [videoTrack]);

    useEffect(() => {
        if (audioTrack && audioRef.current && !isLocal) {
            audioRef.current.srcObject = new MediaStream([audioTrack]);
        }
    }, [audioTrack, isLocal]);

    if (!participant) return null;

    return (
        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg border border-gray-700">
            {videoTrack && !participant.video ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                        {participant.user_name?.charAt(0) || '?'}
                    </div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={isLocal}
                    playsInline
                    className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
                />
            )}

            {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md text-xs font-medium text-white flex items-center gap-2">
                <span>{participant.user_name || 'Guest'} {isLocal && '(You)'}</span>
                {!participant.audio && <MicOff className="h-3 w-3 text-red-400" />}
            </div>
        </div>
    );
};

// Main Call Container
const CallContainer = ({ onLeave }) => {
    const callObject = useCallObject();
    const [participantIds, setParticipantIds] = useState([]);

    useDailyEvent('participant-joined', useCallback(() => {
        setParticipantIds(Object.keys(callObject?.participants() || {}));
    }, [callObject]));

    useDailyEvent('participant-left', useCallback(() => {
        setParticipantIds(Object.keys(callObject?.participants() || {}));
    }, [callObject]));

    useEffect(() => {
        setParticipantIds(Object.keys(callObject?.participants() || {}));
    }, [callObject]);

    const localParticipantId = participantIds.find(id => id === 'local');
    const remoteParticipantIds = participantIds.filter(id => id !== 'local');

    return (
        <div className="relative h-full bg-gray-950 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                {/* Remote Participants */}
                {remoteParticipantIds.map(id => (
                    <VideoTile key={id} id={id} isLocal={false} />
                ))}

                {/* Local Participant (if alone, show full screen, else show in grid) */}
                {localParticipantId && (
                    <VideoTile id={localParticipantId} isLocal={true} />
                )}

                {participantIds.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Connecting...</p>
                    </div>
                )}
            </div>

            <CallControls onLeave={onLeave} />
        </div>
    );
};

export default function VideoCallFrame({ url, token, onLeave }) {
    const [callObject, setCallObject] = useState(null);

    useEffect(() => {
        if (!url) return;

        const newCallObject = DailyIframe.createCallObject({
            url,
            token,
            dailyConfig: {
                experimentalChromeVideoMuteLightOff: true,
            }
        });

        setCallObject(newCallObject);
        newCallObject.join();

        return () => {
            newCallObject.destroy();
        };
    }, [url, token]);

    if (!callObject) return null;

    return (
        <DailyProvider callObject={callObject}>
            <CallContainer onLeave={onLeave} />
        </DailyProvider>
    );
}
