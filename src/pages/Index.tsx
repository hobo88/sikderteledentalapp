import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showLoading, dismissToast, showError } from "@/utils/toast";
import TitleHeader from "@/components/TitleHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [selectedCall, setSelectedCall] = useState<{ type: 'video' | 'audio'; amount: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProceed = async () => {
    if (!patientName.trim() || !selectedCall) {
      showError("Please enter your name.");
      return;
    }
    setIsSubmitting(true);
    const toastId = showLoading("Generating your room...");

    const roomId = `DENTAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { error } = await supabase
      .from("waiting_list")
      .insert([{
          patient_name: patientName,
          room_id: roomId,
          status: "pending_payment",
          call_type: selectedCall.type
      }]);

    dismissToast(toastId);
    setIsSubmitting(false);

    if (error) {
      showError("Could not generate your room. Please try again.");
      console.error("Error inserting into waiting list:", error);
    } else {
      setIsDialogOpen(false);
      setPatientName("");
      navigate(`/payment-instructions?roomId=${roomId}&type=${selectedCall.type}&amount=${selectedCall.amount}`);
    }
  };

  const openDialog = (callType: 'video' | 'audio', amount: number) => {
    setSelectedCall({ type: callType, amount });
    setIsDialogOpen(true);
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
              <Button className="w-full" size="lg" onClick={() => openDialog('video', 800)}>
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
              <Button className="w-full" size="lg" onClick={() => openDialog('audio', 500)}>
                Proceed to Consultation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <DialogDescription>
              Please provide your name for the doctor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="col-span-3"
                placeholder="Your full name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleProceed} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;