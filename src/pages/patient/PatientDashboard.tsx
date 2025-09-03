import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone } from "lucide-react";
import { showError } from "@/utils/toast";

const PatientDashboard = () => {
  const handlePayment = () => {
    // This is a placeholder. In a real app, this would integrate with a payment gateway.
    // After successful payment, we would create a room and redirect the user.
    showError("Payment gateway not implemented. This is a demo.");
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
              Proceed to Payment
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
              Proceed to Payment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;