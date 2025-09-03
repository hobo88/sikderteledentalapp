import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";

const Index = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");

  const handleProceed = async (callType: 'video' | 'audio') => {
    if (!patientName.trim()) {
      showError("Please enter your name before proceeding.");
      return;
    }

    const toastId = showLoading("Processing your request...");

    const roomId = `DENTAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { error } = await supabase
      .from("waiting_list")
      .insert([{ 
          patient_name: patientName, 
          room_id: roomId, 
          status: "waiting",
          call_type: callType 
      }]);

    dismissToast(toastId);

    if (error) {
      showError("Could not join the waiting list. Please try again.");
      console.error("Error inserting into waiting list:", error);
    } else {
      showSuccess("You have been added to the waiting list!");
      navigate(`/room/${roomId}?type=${callType}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Please enter your name to join the queue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="patient-name">Your Name</Label>
              <Input 
                id="patient-name" 
                type="text" 
                placeholder="e.g., Jane Doe" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Choose a Consultation Type</h1>
          <p className="text-md text-gray-600 mt-1">Select the type of consultation you need.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="items-center text-center">
              <Video className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Video Call</CardTitle>
              <CardDescription>Face-to-face consultation</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold">$50</p>
              <p className="text-sm text-muted-foreground">per 15-minute session</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={() => handleProceed('video')}>
                Proceed to Consultation
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="items-center text-center">
              <Phone className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Audio Call</CardTitle>
              <CardDescription>Voice-only consultation</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold">$30</p>
              <p className="text-sm text-muted-foreground">per 15-minute session</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={() => handleProceed('audio')}>
                Proceed to Consultation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;