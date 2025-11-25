import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { ensureUserDocument } from '../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, AlertTriangle, User } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract referral code from URL query params
  const getReferralCode = () => {
    const params = new URLSearchParams(location.search);
    return params.get('ref');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const refCode = getReferralCode();

      // Create or Fetch user in Firestore
      await ensureUserDocument(
        user.uid,
        user.email || "",
        user.displayName || "Anonymous",
        user.photoURL || "",
        refCode
      );

      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login Failed", err);
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = `Domain Unauthorized: ${window.location.hostname}. Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains.`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = "Only one popup request is allowed at one time.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Set a local storage flag to indicate demo mode
    localStorage.setItem('astra_demo_mode', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full flex-grow px-6 py-12 bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-sm text-center space-y-8">
        
        {/* Logo / Branding */}
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Astar Lakh</h1>
          <p className="text-gray-500 text-sm">Your Network, Your Net Worth.</p>
        </div>

        {/* Info Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left space-y-4">
          <h3 className="font-semibold text-gray-800">Why Join?</h3>
          <ul className="space-y-3 text-sm text-gray-600">
             <li className="flex items-start">
               <span className="mr-2 text-indigo-500">✓</span> 
               Earn up to 4 Levels of commission
             </li>
             <li className="flex items-start">
               <span className="mr-2 text-indigo-500">✓</span> 
               Instant Dashboard & Tracking
             </li>
             <li className="flex items-start">
               <span className="mr-2 text-indigo-500">✓</span> 
               One-time activation of ₹800
             </li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-left animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800">Login Failed</h4>
              <p className="text-xs text-red-600 mt-1 leading-relaxed break-words font-mono bg-white/50 p-1 rounded mt-1">
                {error}
              </p>
              {error.includes("Domain Unauthorized") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Tip: Use Guest Mode below to test the app without configuring Firebase.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 <span>Sign in with Google</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-indigo-50 to-white text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 active:scale-95"
          >
            <User className="w-5 h-5" />
            <span>Enter as Guest (Demo)</span>
          </button>

          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;