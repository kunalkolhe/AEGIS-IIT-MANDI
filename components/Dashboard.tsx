import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import { User, GrievanceStatus, SystemStatus } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  user: User;
}

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${color.text}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-xl ${color.bg}`}>
      <Icon className={`w-6 h-6 ${color.icon}`} />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    activeGrievances: 0,
    resolvedGrievances: 0,
    totalStudents: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Active Grievances count
      const { count: activeCount } = await supabase
        .from('grievances')
        .select('*', { count: 'exact', head: true })
        .neq('status', GrievanceStatus.RESOLVED);

      // 2. Get Resolved Grievances count
      const { count: resolvedCount } = await supabase
        .from('grievances')
        .select('*', { count: 'exact', head: true })
        .eq('status', GrievanceStatus.RESOLVED);

      // 3. Get total students
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'Student');

      setStats({
        activeGrievances: activeCount || 0,
        resolvedGrievances: resolvedCount || 0,
        totalStudents: studentCount || 0
      });

      // 4. Fetch System Health
      const { data: healthData } = await supabase
        .from('system_status')
        .select('*');
      
      if (healthData) {
        setSystemHealth(healthData as SystemStatus[]);
      }

      // 5. Calculate Chart Data (Activity last 7 days)
      const { data: recentGrievances } = await supabase
        .from('grievances')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (recentGrievances) {
        // Initialize last 7 days map
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activityMap = new Map();
        
        // Fill map with 0s for last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayName = days[d.getDay()];
          activityMap.set(dayName, { name: dayName, submissions: 0, resolved: 0 });
        }

        recentGrievances.forEach((g) => {
          const d = new Date(g.created_at);
          const dayName = days[d.getDay()];
          if (activityMap.has(dayName)) {
            const entry = activityMap.get(dayName);
            if (g.status === GrievanceStatus.RESOLVED) {
              entry.resolved++;
            } else {
              entry.submissions++;
            }
          }
        });

        setChartData(Array.from(activityMap.values()));
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">High Command</h2>
        <p className="text-slate-500">Welcome back, {user.name}. Here is the citadel overview.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Grievances" 
          value={stats.activeGrievances}
          icon={AlertCircle} 
          color={{ bg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-600' }}
          subtext="Current Open Issues"
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolvedGrievances}
          icon={CheckCircle2} 
          color={{ bg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-600' }}
          subtext="Total Solved"
        />
        <StatCard 
          title="Avg Response" 
          value="4h" 
          icon={Clock} 
          color={{ bg: 'bg-sky-100', icon: 'text-sky-600', text: 'text-sky-600' }}
          subtext="Est. Resolution Time"
        />
        <StatCard 
          title="Active Students" 
          value={stats.totalStudents}
          icon={Users} 
          color={{ bg: 'bg-indigo-100', icon: 'text-indigo-600', text: 'text-indigo-600' }}
          subtext="Registered in Citadel"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Grievance Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="submissions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#064e3b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">System Health</h3>
          <div className="h-64 flex flex-col justify-center items-center space-y-4">
             {/* Dynamic System Health from DB */}
             {systemHealth.length === 0 ? (
               <div className="text-slate-400">Loading diagnostics...</div>
             ) : (
               <div className="w-full space-y-4">
                  {systemHealth.map((sys) => (
                    <div key={sys.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-600">{sys.name}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          sys.status === 'OPERATIONAL' || sys.status === 'READY' 
                          ? 'text-emerald-600 bg-emerald-100' 
                          : 'text-red-600 bg-red-100'
                        }`}>{sys.status}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`${sys.health > 90 ? 'bg-emerald-500' : 'bg-amber-500'} h-2 rounded-full`} 
                          style={{ width: `${sys.health}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;