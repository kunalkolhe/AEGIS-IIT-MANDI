import React, { useState } from 'react';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Grievances from './components/Grievances';
import Academics from './components/Academics';
import Opportunities from './components/Opportunities';
import MapComponent from './components/Map';
import Community from './components/Community';
import SOSButton from './components/SOSButton';
import { User, UserRole } from './types';
import { login } from './services/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const userData = await login(selectedRole);
      setUser(userData);
    } catch (error) {
      console.error("Login failed", error);
      setErrorMsg("Connection to Citadel failed. Check database credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-aegis-900 skew-y-3 transform origin-top-left"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-aegis-900 p-8 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-aegis-800 to-aegis-900 z-0"></div>
             <div className="relative z-10">
               <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
                 <Shield className="w-8 h-8 text-sky-400" />
               </div>
               <h1 className="text-3xl font-bold tracking-tight mb-1">AEGIS PROTOCOL</h1>
               <p className="text-sky-200 text-sm">Unified Digital Citadel • IIT Mandi</p>
             </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Select Identity Access Level</label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.values(UserRole) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedRole === role 
                      ? 'border-sky-500 bg-sky-50 text-sky-700' 
                      : 'border-slate-200 hover:border-sky-300 text-slate-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-aegis-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-900/20 hover:bg-aegis-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Enter The Iron Gate
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-slate-400">
              Restricted Access. Authorized Personnel Only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // View Router
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'grievances': return <Grievances user={user} />;
      case 'academics': return <Academics user={user} />;
      case 'opportunities': return <Opportunities user={user} />;
      case 'map': return <MapComponent />;
      case 'community': return <Community user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={() => setUser(null)}
      currentView={currentView}
      onChangeView={setCurrentView}
    >
      {renderView()}
      <SOSButton />
    </Layout>
  );
};

export default App;