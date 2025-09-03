import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import TitleHeader from "@/components/TitleHeader";

const Index = () => {
  const navigate = useNavigate();

  const handleProceed = async (callType: 'video' | 'audio', amount: number) => {
    const toastId = showLoading("Generating your room...");

    // 1. Generate a unique room ID and patient name
    const roomId = `DENTAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const patientName = `Patient-${Math.random().toString(36).substring(2, 6)}`;

    // 2. Insert into the waiting list table with 'pending_payment' status
    const { error } = await supabase
      .from("waiting_list")
      .insert([{ 
          patient_name: patientName, 
          room_id: roomId, 
          status: "pending_payment",
          call_type: callType 
      }]);

    dismissToast(toastId);

    if (error) {
      showError("Could not generate your room. Please try again.");
      console.error("Error inserting into waiting list:", error);
    } else {
      // 3. Redirect to the payment instructions page
      navigate(`/payment-instructions?roomId=${roomId}&type=${callType}&amount=${amount}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TitleHeader />
      <div className="flex-grow flex flex-col items-center justify-center p-4">
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
              <p className="text-4xl font-bold">tk. 800</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={() => handleProceed('video', 800)}>
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
              <p className="text-4xl font-bold">tk. 500</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={() => handleProceed('audio', 500)}>
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