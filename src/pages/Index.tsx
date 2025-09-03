import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, User } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Welcome to Emergency Tele-Dental
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Instant dental consultations, right when you need them.
        </p>
      </header>
      <main className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">For Patients</CardTitle>
            <CardDescription>
              Get immediate help from a qualified dental professional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link to="/patient">Start Consultation</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit">
              <Stethoscope className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">For Doctors</CardTitle>
            <CardDescription>
              Provide care and manage your patient consultations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full" variant="outline">
              <Link to="/doctor/login">Doctor Portal</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;