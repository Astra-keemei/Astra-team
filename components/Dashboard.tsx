import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { subscribeToUserProfile, subscribeToCommissions } from '../services/userService';
import { UserProfile, Commission, PLAN_PRICE, PlanType } from '../types';
import { LogOut, Copy, CheckCircle, AlertCircle, TrendingUp, MapPin, Wallet, Users, Info } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { Timestamp } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const isDemoMode = localStorage.getItem('astra_demo_mode') === 'true';
    setIsDemo(isDemoMode);

    if (isDemoMode) {
      // Load Mock Data
      setTimeout(() => {
        setUser({
          uid: 'demo-user-123',
          name: 'Guest User',
          email: 'guest@example.com',
          upline_uid: 'admin',
          is_active: false,
          plan_type: PlanType.FREE,
          total_balance: 0,
          createdAt: Timestamp.now(),
        });
        setCommissions([
          {
            id: 'comm_1',
            recipient_uid: 'demo-user-123',
            source_uid: 'downline_1',
            level: 1,
            amount: 200,
            timestamp: Timestamp.now()
          }
        ]);
        setLoading(false);
      }, 800);
      return;
    }

    // Real Firebase Authentication Logic
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate('/');
        return;
      }

      // Subscribe to User Data
      const unsubscribeUser = subscribeToUserProfile(currentUser.uid, (data) => {
        setUser(data);
        if (data) setLoading(false);
      });

      // Subscribe to Commission History
      const unsubscribeComms = subscribeToCommissions(currentUser.uid, (data) => {
        setCommissions(data);
      });

      return () => {
        unsubscribeUser();
        unsubscribeComms();
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigate]);

  const handleLogout = async () => {
    if (isDemo) {
      localStorage.removeItem('astra_demo_mode');
      navigate('/');
    } else {
      await signOut(auth);
      navigate('/');
    }
  };

  const copyReferralLink = () => {
    if (!user) return;
    const origin = window.location.origin;
    // Using HashRouter pattern: origin/#/?ref=UID
    const link = `${origin}/#/?ref=${user.uid}`;
    
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pb-12 bg-gray-50 min-h-full">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-indigo-900 text-indigo-100 px-4 py-2 text-xs font-medium text-center flex items-center justify-center space-x-2">
          <Info size={14} />
          <span>Demo Mode Enabled. Data is simulated and not saved.</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-indigo-600 text-white px-6 py-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={120} />
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-indigo-800 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{user.name}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                user.is_active ? "bg-green-400 text-green-900" : "bg-yellow-400 text-yellow-900"
              }`}>
                {user.plan_type} MEMBER
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-white/80 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        <div className="mt-8 mb-2 relative z-10">
          <p className="text-indigo-100 text-sm font-medium mb-1">Total Earnings</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-4xl font-bold">₹{user.total_balance}</span>
            <span className="text-sm opacity-75">INR</span>
          </div>
        </div>
      </header>

      <div className="px-5 -mt-6 relative z-20 space-y-5">
        
        {/* Status Card / Action Required */}
        {!user.is_active && (
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400 flex items-start space-x-3">
            <AlertCircle className="text-yellow-500 w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-800">Account Not Active</h3>
              <p className="text-xs text-gray-500 mt-1">
                You are on the FREE plan. To verify your account and start earning commissions, please complete the payment of <b>₹{PLAN_PRICE}</b>.
              </p>
              <button className="mt-3 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm active:scale-95 transition-transform">
                Request Activation
              </button>
            </div>
          </div>
        )}

        {/* Location Action Button - Prominent Requirement */}
        <a 
          href="https://maps.app.goo.gl/YourSpecificLocationLink" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 shadow-lg flex items-center justify-between text-white transform transition-all active:scale-95">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Visit Our Location</h3>
                <p className="text-xs text-teal-100">Click to open Google Maps</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-1">
               <svg className="w-5 h-5 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </div>
        </a>

        {/* Referral Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-3 text-gray-800">
            <Users size={18} className="text-indigo-600" />
            <h3 className="font-semibold">Your Referral Link</h3>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-xs text-gray-500 truncate mr-2 font-mono">
              {window.location.origin}/#/?ref={user.uid}
            </p>
            <button 
              onClick={copyReferralLink}
              className={`p-2 rounded-md transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm text-gray-600 active:bg-gray-100'}`}
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Share this link to grow your network and earn commissions.
          </p>
        </div>

        {/* Commission History */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-gray-800">
              <TrendingUp size={18} className="text-indigo-600" />
              <h3 className="font-semibold">Recent Earnings</h3>
            </div>
          </div>

          <div className="space-y-3">
            {commissions.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No commissions yet. <br/> Start referring to earn!
              </div>
            ) : (
              commissions.map((comm) => (
                <div key={comm.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Level {comm.level} Bonus</p>
                    <p className="text-[10px] text-gray-400">
                       {comm.timestamp && comm.timestamp.seconds 
                         ? new Date(comm.timestamp.seconds * 1000).toLocaleDateString() 
                         : 'Demo Date'}
                    </p>
                  </div>
                  <span className="font-bold text-green-600 text-sm">
                    +₹{comm.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;