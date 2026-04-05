"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stethoscope, CheckCircle2, AlertCircle } from "lucide-react";
import { useWebRTCCall } from "@/hooks/useWebRTCCall";
import useRecordingStore from "@/store/useRecordingStore";

// Mock doctor data - replace with real data from backend
const MOCK_DOCTOR = {
    name: "Dr. Priya Sharma",
    hospital: "Apollo Hospitals",
};

const PatientJoinPage = () => {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [status, setStatus] = useState<"loading" | "ready" | "connected" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    const { joinCall, endCall, isConnected, error: webrtcError } = useWebRTCCall();

    const setCallStatus = useRecordingStore((state) => state.setCallStatus);
    const setSessionId = useRecordingStore((state) => state.setSessionId);

    useEffect(() => {
        // Validate session ID format
        if (!sessionId || sessionId.length < 36) {
            setStatus("error");
            setErrorMsg("This link has expired or is invalid.");
            return;
        }

        setSessionId(sessionId);
        setStatus("ready");
    }, [sessionId, setSessionId]);

    useEffect(() => {
        if (webrtcError) {
            setStatus("error");
            setErrorMsg(webrtcError);
        }
    }, [webrtcError]);

    useEffect(() => {
        if (isConnected) {
            setStatus("connected");
            setCallStatus("connected");
        }
    }, [isConnected, setCallStatus]);

    const handleJoinCall = async () => {
        try {
            setStatus("loading");
            await joinCall(sessionId);
        } catch (err) {
            setStatus("error");
            setErrorMsg(err instanceof Error ? err.message : "Failed to join call");
        }
    };

    const handleCancel = () => {
        endCall();
        router.push("/");
    };

    if (status === "error") {
        return (
            <div className="w-full min-h-screen bg-[#080708] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#0f0e10] rounded-2xl p-8 border border-[#dc2626]/30 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-[#dc2626]/20 flex items-center justify-center">
                        <AlertCircle size={32} className="text-[#dc2626]" />
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                        <h2 className="text-white text-xl font-bold font-oxanium">Link Expired</h2>
                        <p className="text-[#9d9d9d] text-sm font-lexend">{errorMsg}</p>
                    </div>

                    <button
                        onClick={handleCancel}
                        className="w-full py-3 rounded-xl text-white font-semibold font-outfit transition-all duration-200 bg-[#1f1f1f] hover:bg-[#2b2b2b]"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (status === "connected") {
        return (
            <div className="w-full min-h-screen bg-[#080708] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#0f0e10] rounded-2xl p-8 border border-[#1f1f1f] flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                        <h2 className="text-white text-xl font-bold font-oxanium">Connected</h2>
                        <p className="text-[#9d9d9d] text-sm font-lexend">You are now talking with {MOCK_DOCTOR.name}</p>
                    </div>

                    <div className="w-full rounded-lg p-4 bg-[#0e0e0e] border-[#717171]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-[#6b6b6b] tracking-widest">CALL DURATION</span>
                            <span className="text-sm font-oxanium text-[#10b981]">Live</span>
                        </div>
                        <p className="text-[#dadada] text-sm font-lexend">
                            The call is being recorded and transcribed for medical documentation purposes.
                        </p>
                    </div>

                    <button
                        onClick={handleCancel}
                        className="w-full py-3 rounded-xl text-white font-semibold font-outfit transition-all duration-200 bg-[#dc2626] hover:bg-[#b91c1c]"
                    >
                        End Call
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#080708] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0f0e10] rounded-2xl p-8 border border-[#1f1f1f] flex flex-col items-center gap-6">
                {/* VANI Logo */}
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-lg font-bold text-teal-500 font-oxanium">V</span>
                </div>

                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-white text-2xl font-bold font-oxanium">Your Doctor is Calling</h1>
                    <p className="text-[#9d9d9d] text-sm font-lexend">Please join the call when ready</p>
                </div>

                {/* Doctor Info Card */}
                <div className="w-full rounded-lg p-4 bg-[#0e0e0e] border-[#717171] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-teal-500/50 flex items-center justify-center">
                        <Stethoscope size={20} className="text-teal-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold font-lexend text-sm">{MOCK_DOCTOR.name}</span>
                        <span className="text-[#6b6b6b] text-xs font-lexend">{MOCK_DOCTOR.hospital}</span>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500 text-xs font-mono tracking-widest">Ready to connect</span>
                </div>

                {/* Join Button */}
                <button
                    onClick={handleJoinCall}
                    disabled={status !== "ready"}
                    className="w-full py-4 rounded-xl text-white font-semibold text-lg font-outfit transition-all duration-200 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === "loading" ? "Connecting..." : "Join Call"}
                </button>

                {/* Consent Notice */}
                <p className="text-[#6b6b6b] text-[11px] font-lexend text-center leading-relaxed">
                    By joining, you consent to this call being recorded and transcribed
                    for medical documentation.
                </p>

                {/* Cancel Link */}
                <button
                    onClick={handleCancel}
                    className="text-[#6b6b6b] text-xs font-lexend hover:text-[#9d9d9d] transition-colors"
                >
                    Not ready? Close this page
                </button>
            </div>
        </div>
    );
};

export default PatientJoinPage;
