import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TitleHeader from "@/components/TitleHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const PaymentInstructions = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get("roomId");
  const callType = searchParams.get("type");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    console.log(`[Patient] Subscribing to real-time updates for room: ${roomId}`);

    const channel = supabase
      .channel(`payment-status-for-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'waiting_list',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[Patient] Real-time event received:', payload);
          if (payload.new && payload.new.status === 'waiting') {
            console.log('[Patient] Status is "waiting". Navigating to room...');
            navigate(`/room/${roomId}?type=${callType}`);
          } else {
            console.log(`[Patient] Status is not 'waiting'. Current status: ${payload.new?.status}`);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Patient] Successfully subscribed to real-time channel.');
        }
        if (status === 'CHANNEL_ERROR' || err) {
          console.error('[Patient] Subscription error:', err);
        }
      });

    return () => {
      console.log(`[Patient] Unsubscribing from room: ${roomId}`);
      supabase.removeChannel(channel);
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