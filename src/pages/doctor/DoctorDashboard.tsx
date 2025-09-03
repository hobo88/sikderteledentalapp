import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { showSuccess } from "@/utils/toast";

type Patient = {
  id: string;
  created_at: string;
  patient_name: string;
  room_id: string;
  status: string;
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [waitingList, setWaitingList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/doctor/login");
      }
    };
    checkSession();

    const fetchWaitingList = async () => {
      const { data, error } = await supabase
        .from("waiting_list")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching waiting list:", error);
      } else {
        setWaitingList(data);
      }
      setLoading(false);
    };

    fetchWaitingList();

    const channel = supabase
      .channel('public:waiting_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiting_list' }, () => {
        fetchWaitingList();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleJoinCall = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("You have been logged out.");
    navigate("/doctor/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : waitingList.length > 0 ? (
                waitingList.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.patient_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{patient.room_id}</Badge>
                    </TableCell>
                    <TableCell>{new Date(patient.created_at).toLocaleTimeString()}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleJoinCall(patient.room_id)}>Join Call</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                    No patients in the waiting list.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;