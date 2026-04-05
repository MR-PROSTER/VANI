'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebRTCCallReturn {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    startCall: (sessionId: string) => Promise<void>;
    joinCall: (sessionId: string) => Promise<void>;
    endCall: () => void;
    isConnected: boolean;
    error: string | null;
}

const STUN_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTCCall(): UseWebRTCCallReturn {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<any>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setLocalStream(null);
        setRemoteStream(null);
        setIsConnected(false);
    }, []);

    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('call:ice', {
                    sessionId: socketRef.current.sessionId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                remoteStreamRef.current = event.streams[0];
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                setIsConnected(true);
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setIsConnected(false);
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, []);

    const startCall = useCallback(async (sessionId: string) => {
        try {
            setError(null);

            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            // Initialize Socket.io
            const ioFn = (window as any).io;
            if (!ioFn) {
                throw new Error('Socket.io not available');
            }

            const socket = ioFn('http://localhost:3001');
            socketRef.current = socket;
            socket.sessionId = sessionId;

            socket.on('connect', () => {
                console.log('Connected to signaling server');
                socket.emit('call:initiate', { sessionId, role: 'doctor' });
            });

            // Listen for patient joining
            socket.on('call:patient-joined', async () => {
                console.log('Patient joined, creating offer...');

                const pc = initializePeerConnection();

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                // Create and send offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit('call:offer', { sessionId, offer: pc.localDescription });
            });

            // Handle answer from patient
            socket.on('call:answer', async (data: { answer: RTCSessionDescriptionInit }) => {
                if (peerConnectionRef.current && data.answer) {
                    await peerConnectionRef.current.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                }
            });

            // Handle ICE candidates from patient
            socket.on('call:ice', async (data: { candidate: RTCIceCandidateInit }) => {
                if (peerConnectionRef.current && data.candidate) {
                    await peerConnectionRef.current.addIceCandidate(
                        new RTCIceCandidate(data.candidate)
                    );
                }
            });

            // Handle call ended
            socket.on('call:ended', () => {
                console.log('Call ended by patient');
                cleanup();
            });

        } catch (err) {
            console.error('Error starting call:', err);
            setError(err instanceof Error ? err.message : 'Failed to start call');
            cleanup();
        }
    }, [cleanup, initializePeerConnection]);

    const joinCall = useCallback(async (sessionId: string) => {
        try {
            setError(null);

            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            // Initialize Socket.io
            const ioFn = (window as any).io;
            if (!ioFn) {
                throw new Error('Socket.io not available');
            }

            const socket = ioFn('http://localhost:3001');
            socketRef.current = socket;
            socket.sessionId = sessionId;

            socket.on('connect', () => {
                console.log('Connected to signaling server');
                socket.emit('call:join', { sessionId, role: 'patient' });
            });

            // Handle offer from doctor
            socket.on('call:offer', async (data: { offer: RTCSessionDescriptionInit }) => {
                if (!data.offer) return;

                const pc = initializePeerConnection();

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('call:answer', { sessionId, answer: pc.localDescription });
            });

            // Handle ICE candidates from doctor
            socket.on('call:ice', async (data: { candidate: RTCIceCandidateInit }) => {
                if (peerConnectionRef.current && data.candidate) {
                    await peerConnectionRef.current.addIceCandidate(
                        new RTCIceCandidate(data.candidate)
                    );
                }
            });

            // Handle call ended
            socket.on('call:ended', () => {
                console.log('Call ended by doctor');
                cleanup();
            });

        } catch (err) {
            console.error('Error joining call:', err);
            setError(err instanceof Error ? err.message : 'Failed to join call');
            cleanup();
        }
    }, [cleanup, initializePeerConnection]);

    const endCall = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('call:end', { sessionId: socketRef.current.sessionId });
        }
        cleanup();
    }, [cleanup]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        localStream,
        remoteStream,
        startCall,
        joinCall,
        endCall,
        isConnected,
        error,
    };
}

export default useWebRTCCall;
