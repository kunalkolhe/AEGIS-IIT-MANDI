import React, { ReactNode } from 'react';
import { 
  Menu, X, Shield, LayoutDashboard, ScrollText, GraduationCap, 
  Briefcase, Map, Users, LogOut 
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onChangeView }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'High Command', icon: LayoutDashboard, role: [UserRole.ADMIN, UserRole.AUTHORITY, UserRole.FACULTY, UserRole.STUDENT] },
    { id: 'grievances', label: 'The Silent Scroll', icon: ScrollText, role: [UserRole.STUDENT, UserRole.ADMIN, UserRole.AUTHORITY] },
    { id: 'academics', label: 'Destiny Manager', icon: GraduationCap, role: [UserRole.STUDENT, UserRole.FACULTY] },
    { id: 'opportunities', label: "Professor's Call", icon: Briefcase, role: [UserRole.STUDENT, UserRole.FACULTY] },
    { id: 'map', label: "Pathfinder's Map", icon: Map, role: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN] },
    { id: 'community', label: 'Hall of Echoes', icon: Users, role: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN, UserRole.AUTHORITY] },
  ];

  const filteredNav = navItems.filter(item => item.role.includes(user.role));

  return (
    <div className="min-h-screen bg-aegis-50 flex font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-aegis-900 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col shadow-2xl
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 bg-aegis-800 border-b border-aegis-700">
          <Shield className="w-8 h-8 text-sky-400 mr-3" />
          <div>
            <h1 className="text-xl font-bold tracking-wider">AEGIS</h1>
            <p className="text-xs text-aegis-200">Protocol v1.0</p>
          </div>
          <button 
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Mini */}
        <div className="p-6 border-b border-aegis-700 bg-aegis-800/50">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-sky-400"
            />
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-sky-300 uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNav.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onChangeView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200
                    ${currentView === item.id 
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                      : 'text-slate-300 hover:bg-aegis-800 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-aegis-700">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Mobile Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center px-4 lg:hidden z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-semibold text-slate-800">IIT Mandi</span>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;