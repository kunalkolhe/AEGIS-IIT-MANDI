import React, { useEffect, useState } from 'react';
import { Briefcase, Beaker, GraduationCap, ChevronRight, Loader2, AlertTriangle, PlusCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Opportunity, User, UserRole } from '../types';

interface OpportunitiesProps {
  user: User;
}

const Opportunities: React.FC<OpportunitiesProps> = ({ user }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Faculty Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Research',
    deadline: '',
    stipend: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const isFaculty = user.role === UserRole.FACULTY;

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    
    // Sort by deadline to show upcoming opportunities first
    const { data, error: err } = await supabase
      .from('opportunities')
      .select('*')
      .order('deadline', { ascending: true }); 
    
    if (err) {
      console.error("Failed to fetch opportunities", err);
      setError("Unable to connect to the Professor's Call frequency. Please check your network connection.");
    } else if (data) {
      setOpportunities(data as Opportunity[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const newOp = {
       title: formData.title,
       professor: user.name,
       type: formData.type,
       deadline: formData.deadline,
       stipend: formData.stipend || 'Unpaid',
       tags: tagsArray
    };

    const { error } = await supabase.from('opportunities').insert([newOp]);
    
    setSubmitting(false);
    
    if (error) {
       alert("Failed to publish opportunity. " + error.message);
       console.error(error);
    } else {
       setShowForm(false);
       setFormData({ title: '', type: 'Research', deadline: '', stipend: '', tags: '' });
       fetchOpportunities();
       alert("Opportunity Published Successfully.");
    }
  };

  const handleApply = (title: string) => {
    // In a real app, this would write to an 'applications' table
    alert(`Application protocol initiated for: "${title}".\nThe professor has been notified of your interest.`);
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'Research': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'Internship': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Project': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
     switch(type) {
      case 'Research': return <Beaker className="w-5 h-5" />;
      case 'Internship': return <Briefcase className="w-5 h-5" />;
      case 'Project': return <GraduationCap className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">The Professor's Call</h2>
          <p className="text-slate-500 mt-1">Research fellowships, internships, and project grants.</p>
        </div>
        {isFaculty && (
          <button 
             onClick={() => setShowForm(!showForm)}
             className="bg-aegis-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-aegis-800 transition-all shadow-lg shadow-aegis-900/20 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            {showForm ? 'Cancel Posting' : 'Post Opportunity'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Faculty Posting Form */}
      {showForm && isFaculty && (
        <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-900/5 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
           
           <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
             <PlusCircle className="w-5 h-5 text-indigo-500" />
             Create New Position
           </h3>
           
           <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                    placeholder="e.g. Advanced AI for Remote Healthcare Monitoring" 
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opportunity Type</label>
                  <div className="relative">
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})} 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                    >
                       <option>Research</option>
                       <option>Internship</option>
                       <option>Project</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Application Deadline</label>
                  <input 
                    required 
                    type="date" 
                    value={formData.deadline} 
                    onChange={e => setFormData({...formData, deadline: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stipend / Grant (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.stipend} 
                    onChange={e => setFormData({...formData, stipend: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                    placeholder="e.g. ₹5000/mo or Unpaid" 
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags (Comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.tags} 
                    onChange={e => setFormData({...formData, tags: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                    placeholder="ML, Python, React" 
                  />
               </div>
             </div>
             
             <div className="pt-2 flex justify-end">
               <button 
                 disabled={submitting} 
                 type="submit" 
                 className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:shadow-none flex items-center gap-2"
               >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {submitting ? 'Publishing...' : 'Publish to Network'}
               </button>
             </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Cards */}
         {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
                <p>Scanning Citadel frequencies...</p>
             </div>
         ) : opportunities.length === 0 && !error ? (
             <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500 font-medium text-lg">No open positions detected.</p>
               <p className="text-slate-400 text-sm">Faculty have not broadcasted any calls yet.</p>
             </div>
         ) : opportunities.map((opp) => (
            <div key={opp.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 group relative flex flex-col h-full">
               {/* Decorative Gradient Blob */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none"></div>
               
               <div className="relative z-10 flex-1">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl border ${getTypeStyles(opp.type)} bg-opacity-50`}>
                       {getTypeIcon(opp.type)}
                    </div>
                    <div className="text-right">
                       <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Deadline</span>
                       <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">{opp.deadline}</span>
                    </div>
                 </div>

                 <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-sky-700 transition-colors leading-tight">{opp.title}</h3>
                 <p className="text-sm text-slate-500 mb-4 font-medium">{opp.professor}</p>

                 <div className="flex flex-wrap gap-2 mb-6">
                    {opp.tags && opp.tags.map(tag => (
                       <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-500 uppercase tracking-wide">
                          {tag}
                       </span>
                    ))}
                 </div>
               </div>

               <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{opp.stipend || 'Unpaid'}</span>
                  <button 
                    onClick={() => handleApply(opp.title)}
                    className="flex items-center text-sm font-bold text-white bg-slate-900 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors shadow-md shadow-slate-900/10"
                  >
                     Apply <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
               </div>
            </div>
         ))}

         {/* Create Your Own Mock Card */}
         {!loading && !isFaculty && (
           <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all cursor-pointer min-h-[300px] group">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:bg-white group-hover:text-sky-500 group-hover:shadow-md transition-all">
                 <PlusCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-600 group-hover:text-sky-700 transition-colors">Propose a Project</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">
                Don't see what you like? Draft a proposal to a professor directly through the Ledger.
              </p>
           </div>
         )}
      </div>
    </div>
  );
};

export default Opportunities;