import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TitleHeader from "@/components/TitleHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const PaymentInstructions = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const roomId = searchParams.get("roomId");
  const callType = searchParams.get("type");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const checkPaymentStatus = async () => {
      console.log(`[Patient] Polling for payment status for room: ${roomId}`);
      const { data, error } = await supabase
        .from('waiting_list')
        .select('status')
        .eq('room_id', roomId)
        .limit(1); // Use limit(1) to get an array instead of a single object

      if (error) {
        console.error('[Patient] Error polling for status:', error);
        return; // Don't stop polling on error, just try again next interval
      }

      // Check if we got a result and if the status is 'waiting'
      if (data && data.length > 0 && data[0].status === 'waiting') {
        console.log('[Patient] Payment confirmed via polling. Navigating to room...');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        navigate(`/room/${roomId}?type=${callType}`);
      }
    };

    // Check immediately and then start polling every 5 seconds
    checkPaymentStatus();
    intervalRef.current = setInterval(checkPaymentStatus, 5000);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomId, callType, navigate]);

  if (!roomId || !callType || !amount) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TitleHeader />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <p>Invalid payment details. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TitleHeader />
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
            <CardDescription>Complete the payment to join the queue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg">Please send</p>
              <p className="text-4xl font-bold">tk. {amount}</p>
              <p className="text-lg">to the bKash number below:</p>
              <p className="text-2xl font-mono bg-gray-100 p-2 rounded-md my-2">01234567890</p>
            </div>
            <div>
              <p className="font-semibold text-red-600">IMPORTANT:</p>
              <p>You must use your Room ID as the payment reference.</p>
              <p className="text-xl font-mono bg-gray-100 p-2 rounded-md my-2 text-center">{roomId}</p>
            </div>
            <div className="flex items-center justify-center pt-4 text-gray-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <p>Waiting for payment confirmation...</p>
            </div>
            <p className="text-xs text-center text-gray-500 pt-2">
              This page will automatically redirect you once payment is confirmed by the doctor. Do not close this window.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentInstructions;