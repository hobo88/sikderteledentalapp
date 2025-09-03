import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";

const PatientDashboard = () => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    const toastId = showLoading("Processing your request...");

    // 1. Generate a unique room ID
    const roomId = `DENTAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const patientName = `Patient-${Math.random().toString(36).substring(2, 6)}`;

    // 2. Insert into the waiting list table
    const { error } = await supabase
      .from("waiting_list")
      .insert([{ patient_name: patientName, room_id: roomId, status: "waiting" }]);

    dismissToast(toastId);

    if (error) {
      showError("Could not join the waiting list. Please try again.");
      console.error("Error inserting into waiting list:", error);
    } else {
      showSuccess("You have been added to the waiting list!");
      // 3. Redirect to the room
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Choose a Consultation Type</h1>
        <p className="text-lg text-gray-600 mt-2">Select the type of consultation you need.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-2xl w-full">
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
            <Button className="w-full" size="lg" onClick={handlePayment}>
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
            <Button className="w-full" size="lg" onClick={handlePayment}>
              Proceed to Consultation
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;