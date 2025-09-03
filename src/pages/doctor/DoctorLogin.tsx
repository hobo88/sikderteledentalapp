import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import TitleHeader from "@/components/TitleHeader";

const DoctorLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/doctor/dashboard");
      }
    };

    checkSessionAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate("/doctor/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TitleHeader />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h2 className="text-center text-2xl font-bold mb-4">Doctor Portal</h2>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;