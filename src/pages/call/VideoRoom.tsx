import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Peer from "peerjs";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import TitleHeader from "@/components/TitleHeader";

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callType = searchParams.get('type') || 'video';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isDoctor, setIsDoctor] = useState<boolean | undefined>(undefined);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsDoctor(!!session);
    };
    checkUserRole();
  }, []);

  useEffect(() => {
    if (!roomId || isDoctor === undefined) return;

    let localStream: MediaStream;
    let connectionInterval: NodeJS.Timeout;

    const initializePeer = async () => {
      try {
        const constraints = callType === 'video'
          ? { video: true, audio: true }
          : { video: false, audio: true };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = localStream;
        }

        const peerId = isDoctor ? `doctor-${roomId}` : `patient-${roomId}`;
        const peerInstance = new Peer(peerId);
        peerRef.current = peerInstance;

        // Doctor logic: wait for a call
        if (isDoctor) {
          peerInstance.on('call', (call) => {
            call.answer(localStream);
            call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            });
            call.on('error', (err) => console.error("Doctor: Call error:", err));
          });
        }

        // Patient logic: Poll until the doctor is found
        if (!isDoctor) {
          let callInProgress = false;
          peerInstance.on('open', () => {
            connectionInterval = setInterval(() => {
              if (callInProgress || peerInstance.disconnected) return;

              callInProgress = true;
              const call = peerInstance.call(`doctor-${roomId}`, localStream);

              call.on('stream', (remoteStream) => {
                clearInterval(connectionInterval);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
              });

              call.on('error', () => {
                callInProgress = false; // Allow retry
              });
              
              call.on('close', () => {
                callInProgress = false; // Allow retry
              });

            }, 3000); // Try to connect every 3 seconds
          });
        }

      } catch (err) {
        console.error("Failed to get media stream", err);
        showError("Could not access camera/microphone. Please check permissions.");
      }
    };

    initializePeer();

    return () => {
      clearInterval(connectionInterval);
      peerRef.current?.destroy();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, isDoctor, callType]);

  const handleEndCall = async () => {
    peerRef.current?.destroy();
    if (isDoctor) {
      await supabase.from('waiting_list').update({ status: 'completed' }).eq('room_id', roomId);
      navigate("/doctor/dashboard");
    } else {
      navigate("/");
    }
  };

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (callType !== 'video' || !localVideoRef.current?.srcObject) return;
    const stream = localVideoRef.current.srcObject as MediaStream;
    stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setIsVideoOff(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <TitleHeader theme="dark" />
      <div className="flex-grow flex flex-col p-4">
        <header className="flex justify-between items-center">
          <h1 className="text-xl">Room: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{roomId}</span></h1>
        </header>

        <main className="flex-1 relative flex items-center justify-center my-4">
          {callType === 'video' ? (
            <>
              <div className="bg-black w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <p className="absolute text-gray-400">Waiting for other user...</p>
              </div>
              <Card className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 border-2 border-gray-600">
                <CardContent className="p-0 w-full h-full">
                  <div className="bg-black w-full h-full rounded-lg overflow-hidden">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <UserCircle className="h-32 w-32 text-gray-500 mb-4" />
              <h2 className="text-2xl font-bold">Audio Consultation</h2>
              <p className="text-gray-400 mt-2">Waiting for other user to join...</p>
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
            </div>
          )}
        </main>

        <footer className="flex justify-center items-center gap-4 p-4 bg-gray-800 rounded-lg">
          <Button variant="outline" size="icon" onClick={toggleAudio} className="bg-transparent hover:bg-gray-700 text-white">
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          {callType === 'video' && (
            <Button variant="outline" size="icon" onClick={toggleVideo} className="bg-transparent hover:bg-gray-700 text-white">
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}
          <Button variant="destructive" size="lg" onClick={handleEndCall}>
            <PhoneOff className="mr-2 h-5 w-5" /> End Call
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default VideoRoom;