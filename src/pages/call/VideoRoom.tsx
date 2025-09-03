import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Peer from "peerjs";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsDoctor(!!session);
    };
    checkUserRole();
  }, []);

  useEffect(() => {
    if (!roomId) return;

    let localStream: MediaStream;

    const initializePeer = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const peerId = isDoctor ? `doctor-${roomId}` : `patient-${roomId}`;
        const peerInstance = new Peer(peerId);
        setPeer(peerInstance);

        peerInstance.on('open', (id) => {
          if (!isDoctor) {
            // Patient calls the doctor
            const call = peerInstance.call(`doctor-${roomId}`, localStream);
            call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            });
          }
        });

        if (isDoctor) {
          // Doctor listens for calls
          peerInstance.on('call', (call) => {
            call.answer(localStream);
            call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            });
          });
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
        showError("Could not access camera and microphone. Please check permissions.");
      }
    };

    // We need to wait for isDoctor to be set before initializing the peer
    if (isDoctor !== undefined) {
        initializePeer();
    }

    return () => {
      peer?.destroy();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [roomId, isDoctor]);

  const handleEndCall = async () => {
    peer?.destroy();
    if (isDoctor) {
      // Update patient status in DB
      const { error } = await supabase
        .from('waiting_list')
        .update({ status: 'completed' })
        .eq('room_id', roomId);
      if (error) {
        console.error("Failed to update patient status", error);
      }
      navigate("/doctor/dashboard");
    } else {
      navigate("/");
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <header className="flex justify-between items-center">
        <h1 className="text-xl">Room: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{roomId}</span></h1>
        <Button variant="destructive" onClick={handleEndCall}>
          <PhoneOff className="mr-2 h-4 w-4" /> End Call
        </Button>
      </header>

      <main className="flex-1 relative flex items-center justify-center my-4">
        {/* Remote Video */}
        <div className="bg-black w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
           {!remoteVideoRef.current?.srcObject && <p className="text-gray-400">Waiting for other user to join...</p>}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <Card className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 border-2 border-gray-600">
          <CardContent className="p-0 w-full h-full">
            <div className="bg-black w-full h-full rounded-lg overflow-hidden">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="flex justify-center items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <Button variant="outline" size="icon" onClick={toggleAudio} className="bg-transparent hover:bg-gray-700 text-white">
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button variant="outline" size="icon" onClick={toggleVideo} className="bg-transparent hover:bg-gray-700 text-white">
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </Button>
        <Button variant="destructive" size="lg" onClick={handleEndCall}>
          <PhoneOff className="mr-2 h-5 w-5" /> End Call
        </Button>
      </footer>
    </div>
  );
};

export default VideoRoom;