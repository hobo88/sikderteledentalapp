import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndCall = () => {
    // In a real app, this would disconnect from the call and clean up resources.
    // We'll navigate back to the homepage for this demo.
    navigate("/");
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
        {/* Doctor's Video */}
        <div className="bg-black w-full h-full rounded-lg overflow-hidden">
          {/* Placeholder for video element */}
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Doctor's Video</p>
          </div>
        </div>

        {/* Patient's Video (Picture-in-Picture) */}
        <Card className="absolute bottom-4 right-4 w-48 h-36 md:w-64 md:h-48 border-2 border-gray-600">
          <CardContent className="p-0 w-full h-full">
            <div className="bg-black w-full h-full rounded-lg overflow-hidden">
              {/* Placeholder for video element */}
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">Patient's Video</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="flex justify-center items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)} className="bg-transparent hover:bg-gray-700">
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setIsVideoOff(!isVideoOff)} className="bg-transparent hover:bg-gray-700">
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