import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockWaitingList = [
  { id: 1, name: "John Doe", roomId: "DENTAL-1A2B", joinedAt: "10:45 AM" },
  { id: 2, name: "Jane Smith", roomId: "DENTAL-3C4D", joinedAt: "10:42 AM" },
  { id: 3, name: "Sam Wilson", roomId: "DENTAL-5E6F", joinedAt: "10:38 AM" },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const handleJoinCall = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <Button variant="outline">Logout</Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Patient Waiting List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Room ID</TableHead>
                <TableHead>Joined At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWaitingList.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{patient.roomId}</Badge>
                  </TableCell>
                  <TableCell>{patient.joinedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleJoinCall(patient.roomId)}>Join Call</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockWaitingList.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No patients in the waiting list.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;