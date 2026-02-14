import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

const SOSButton: React.FC = () => {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sent, setSent] = useState(false);

  const handleSOS = () => {
    setActive(true);
    setSent(false);
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerEmergency = () => {
    setSent(true);
    // Simulate API call to security
    if ("geolocation" in navigator) {
       navigator.geolocation.getCurrentPosition((position) => {
         console.log("Emergency at:", position.coords);
       });
    }
  };

  const cancelSOS = () => {
    setActive(false);
    setCountdown(5);
  };

  if (active && !sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/80 backdrop-blur-sm animate-pulse">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full mx-4 border-4 border-red-500">
          <AlertTriangle className="w-24 h-24 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">SOS TRIGGERED</h2>
          <p className="text-gray-600 mb-6">Security will be notified in {countdown} seconds.</p>
          <button 
            onClick={cancelSOS}
            className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-colors"
          >
            CANCEL ALERT
          </button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full mx-4">
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Sent</h2>
          <p className="text-gray-600 mb-6">Security has been dispatched to your location.</p>
          <button 
            onClick={() => setActive(false)}
            className="w-full py-3 bg-aegis-700 text-white font-bold rounded-xl"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOS}
      className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 group flex items-center gap-2 pr-6"
    >
      <div className="relative">
        <AlertTriangle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
      </div>
      <span className="font-bold">SOS</span>
    </button>
  );
};

export default SOSButton;