import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import TitleHeader from "@/components/TitleHeader";

const DoctorLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // This function checks for a session and redirects if found.
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted && session) {
        return true; // Session found
      }
      return false; // No session
    };

    // Poll for the session status.
    const intervalId = setInterval(async () => {
      const hasSession = await checkSessionAndRedirect();
      if (hasSession) {
        clearInterval(intervalId);
        navigate("/doctor/dashboard");
      }
    }, 1500); // Check every 1.5 seconds

    // Perform an initial check immediately on component mount.
    checkSessionAndRedirect().then(hasSession => {
      if (hasSession) {
        clearInterval(intervalId);
        navigate("/doctor/dashboard");
      }
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
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