import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Video, Phone, CheckCircle } from "lucide-react";
import TitleHeader from "@/components/TitleHeader";

type Patient = {
  id: string;
  created_at: string;
  patient_name: string;
  room_id: string;
  status: 'pending_payment' | 'waiting' | 'completed';
  call_type: 'video' | 'audio';
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [pendingPatients, setPendingPatients] = useState<Patient[]>([]);
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

    const fetchLists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("waiting_list")
        .select("*")
        .in("status", ["pending_payment", "waiting"])
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching lists:", error);
        showError("Could not fetch patient lists.");
      } else {
        const allPatients = data as Patient[];
        setPendingPatients(allPatients.filter(p => p.status === 'pending_payment'));
        setWaitingList(allPatients.filter(p => p.status === 'waiting'));
      }
      setLoading(false);
    };

    fetchLists();

    const channel = supabase
      .channel('public:waiting_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiting_list' }, () => {
        fetchLists();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleConfirmPayment = async (patientId: string) => {
    const toastId = showLoading("Confirming payment...");
    const { error } = await supabase
      .from('waiting_list')
      .update({ status: 'waiting' })
      .eq('id', patientId);
    
    dismissToast(toastId);
    if (error) {
      showError("Failed to confirm payment.");
      console.error("Payment confirmation error:", error);
    } else {
      showSuccess("Payment confirmed. Patient moved to waiting list.");
    }
  };

  const handleJoinCall = (roomId: string, callType: 'video' | 'audio') => {
    navigate(`/room/${roomId}?type=${callType}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("You have been logged out.");
    navigate("/doctor/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TitleHeader />
      <div className="flex-grow p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </header>
        
        <div className="grid gap-8 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Room ID</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                  ) : pendingPatients.length > 0 ? (
                    pendingPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.patient_name}</TableCell>
                        <TableCell><Badge variant="secondary">{patient.room_id}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleConfirmPayment(patient.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center py-12 text-gray-500">No pending payments.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Waiting List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Call Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                  ) : waitingList.length > 0 ? (
                    waitingList.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.patient_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {patient.call_type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                            <span className="capitalize">{patient.call_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => handleJoinCall(patient.room_id, patient.call_type)}>Join Call</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center py-12 text-gray-500">No patients in the waiting list.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;