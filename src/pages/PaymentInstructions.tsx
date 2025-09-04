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
      console.log(`[Patient] Polling for payment status for room: ${roomId} using RPC.`);
      
      const { data: currentStatus, error } = await supabase.rpc('get_room_status', {
        p_room_id: roomId
      });

      if (error) {
        console.error('[Patient] Error polling for status via RPC:', error);
        return;
      }

      if (currentStatus === 'waiting') {
        console.log('[Patient] Payment confirmed! Navigating to room...');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        navigate(`/room/${roomId}?type=${callType}`);
      }
    };

    checkPaymentStatus();
    intervalRef.current = setInterval(checkPaymentStatus, 3000); // Poll every 3 seconds

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
              <p className="text-2xl font-mono bg-gray-100 p-2 rounded-md my-2">01711350290</p>
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