import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MapPin, Camera, AlertOctagon, Loader2, CheckCircle, Clock 
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { Grievance, GrievanceStatus, Priority, User, UserRole } from '../types';

interface GrievancesProps {
  user: User;
}

const Grievances: React.FC<GrievancesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'track' | 'submit'>('track');
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Infrastructure',
    priority: 'Medium',
    location: '',
    description: '',
    is_anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);

  const isAuthority = user.role === UserRole.AUTHORITY || user.role === UserRole.ADMIN;

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('grievances')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGrievances(data as any); 
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, newStatus: GrievanceStatus) => {
    // Optimistic UI update
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));

    const { error } = await supabase
      .from('grievances')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error("Failed to update status", error);
      fetchGrievances(); // Revert on error
      alert("Failed to update status. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const newGrievance = {
      title: formData.title,
      category: formData.category,
      priority: formData.priority,
      status: GrievanceStatus.SUBMITTED,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      description: formData.description,
      location: formData.location,
      votes: 0,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('grievances')
      .insert([newGrievance]);

    setSubmitting(false);

    if (!error) {
      alert("Grievance Submitted to the Watcher's Eye.");
      setFormData({
        title: '', category: 'Infrastructure', priority: 'Medium', 
        location: '', description: '', is_anonymous: false
      });
      setActiveTab('track');
      fetchGrievances();
    } else {
      alert("Failed to submit grievance. Access denied or connection lost.");
      console.error(error);
    }
  };

  const getStatusColor = (status: GrievanceStatus) => {
    switch (status) {
      case GrievanceStatus.SUBMITTED: return 'bg-slate-100 text-slate-600 border-slate-200';
      case GrievanceStatus.UNDER_REVIEW: return 'bg-sky-100 text-sky-600 border-sky-200';
      case GrievanceStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-600 border-amber-200';
      case GrievanceStatus.RESOLVED: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return 'text-red-600 bg-red-50 border-red-100';
      case Priority.HIGH: return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredGrievances = filter === 'All' 
    ? grievances 
    : grievances.filter(g => g.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            The Silent Scroll
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Voice of the Citadel</span>
          </h2>
          {isAuthority && <p className="text-xs text-sky-600 font-medium mt-1">Authorized Access: Management Mode Active</p>}
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'track' ? 'bg-aegis-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Track Issues
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'submit' ? 'bg-aegis-900 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Raise Voice
          </button>
        </div>
      </div>

      {activeTab === 'track' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Submitted', 'In Progress', 'Resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                  filter === f 
                    ? 'bg-sky-50 border-sky-200 text-sky-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No grievances found. The Citadel is peaceful.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredGrievances.map((g) => (
                <div key={g.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(g.status)}`}>
                        {g.status}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(g.priority)}`}>
                        {g.priority}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {typeof g.id === 'string' && g.id.length > 8 ? g.id.substring(0,8) : g.id} • {g.date}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{g.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{g.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {g.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" />
                      {g.category}
                    </div>
                    <div className="ml-auto font-medium text-sky-600">
                      {g.votes} students impacted
                    </div>
                  </div>

                  {/* Authority Actions */}
                  {isAuthority && g.status !== GrievanceStatus.RESOLVED && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                       <button 
                          onClick={() => handleStatusUpdate(g.id, GrievanceStatus.IN_PROGRESS)}
                          className="flex-1 bg-amber-50 text-amber-700 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" /> Mark In Progress
                       </button>
                       <button 
                          onClick={() => handleStatusUpdate(g.id, GrievanceStatus.RESOLVED)}
                          className="flex-1 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Resolve Issue
                       </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Submission Form */
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <form className="space-y-6" onSubmit={handleSubmit}>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Issue Title</label>
               <input 
                 type="text" 
                 required
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                 placeholder="Briefly describe the issue..." 
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option>Infrastructure</option>
                    <option>Academics</option>
                    <option>Hostel</option>
                    <option>Food</option>
                    <option>Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select 
                     value={formData.priority}
                     onChange={(e) => setFormData({...formData, priority: e.target.value})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                 <input 
                   type="text" 
                   value={formData.location}
                   onChange={(e) => setFormData({...formData, location: e.target.value})}
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                   placeholder="e.g. Parashar Hostel, Room 102" 
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
               <textarea 
                 rows={4} 
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                 placeholder="Provide detailed information..." 
               />
             </div>

             <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
               <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
               <p className="text-sm text-slate-500">Upload Evidence (Photos/Videos)</p>
             </div>

             <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 id="anon" 
                 checked={formData.is_anonymous}
                 onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
                 className="w-4 h-4 text-sky-600 rounded" 
               />
               <label htmlFor="anon" className="text-sm text-slate-600">Submit Anonymously (Identity Hidden)</label>
             </div>

             <button 
               type="submit" 
               disabled={submitting}
               className="w-full bg-aegis-900 text-white py-4 rounded-xl font-bold hover:bg-aegis-800 transition-colors shadow-lg shadow-sky-900/10 flex justify-center items-center"
             >
               {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit to the Watcher's Eye"}
             </button>
           </form>
        </div>
      )}
    </div>
  );
};

export default Grievances;