import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Calendar as CalIcon, Download, Clock, TrendingUp, Loader2, AlertCircle, Upload,
  Calculator, ChevronUp, ChevronDown, HelpCircle
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { Course, Resource, Assignment, User, UserRole } from '../types';

interface AcademicsProps {
  user: User;
}

const Academics: React.FC<AcademicsProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Faculty Resource Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [resData, setResData] = useState({ title: '', type: 'PDF' });
  const [uploading, setUploading] = useState(false);

  // Destiny Predictor State
  const [predictorOpen, setPredictorOpen] = useState(false);
  const [creditsDone, setCreditsDone] = useState(85); 
  const [creditsNext, setCreditsNext] = useState(20); 
  const [targetGoal, setTargetGoal] = useState<number>(user.cgpa ? user.cgpa + 0.5 : 8.5);

  const isFaculty = user.role === UserRole.FACULTY;
  const currentCGPA = user.cgpa || 7.0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: coursesData } = await supabase.from('courses').select('*');
    const { data: resourcesData } = await supabase.from('resources').select('*');
    const { data: assignmentsData } = await supabase.from('assignments').select('*').order('due_date', { ascending: true });

    if (coursesData) {
      setCourses(coursesData.map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        attendance: c.attendance, 
        totalClasses: c.total_classes
      })));
    }

    if (resourcesData) setResources(resourcesData as Resource[]);
    if (assignmentsData) setAssignments(assignmentsData as Assignment[]);

    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    // Simulate upload - in real app would upload file to storage bucket
    const newRes = {
      title: resData.title,
      type: resData.type,
      size: '1.2 MB', // Mock size
      uploaded_by: user.name,
      url: '#'
    };

    const { error } = await supabase.from('resources').insert([newRes]);
    setUploading(false);

    if(!error) {
       setShowUpload(false);
       setResData({ title: '', type: 'PDF' });
       alert("Resource archived in the Vault of Knowledge.");
       // Refresh resources
       const { data } = await supabase.from('resources').select('*');
       if(data) setResources(data as Resource[]);
    } else {
       alert("Upload failed.");
    }
  };

  // Calculator Logic variables
  const totalCurrentPoints = currentCGPA * creditsDone;
  const totalCreditsNew = creditsDone + creditsNext;
  const requiredTotalPoints = targetGoal * totalCreditsNew;
  const requiredSemPoints = requiredTotalPoints - totalCurrentPoints;
  const reqSGPA = requiredSemPoints / creditsNext;
  
  const isPossible = reqSGPA <= 10;
  const displaySGPA = reqSGPA < 0 ? 0 : reqSGPA.toFixed(2);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">The Destiny Manager</h2>
        <p className="text-slate-500">Track your academic fate and resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            {isFaculty ? "Monitored Courses" : "Active Courses"}
          </h3>
          
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-sky-600" /></div>
          ) : courses.length === 0 ? (
             <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 flex flex-col items-center gap-2">
               <AlertCircle className="w-8 h-8 text-slate-300" />
               <p>No courses enrolled in the database.</p>
               <p className="text-xs text-slate-400">Contact admin to populate 'courses' table.</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => {
                const hasAttendanceData = course.totalClasses && course.totalClasses > 0;
                const attendancePercent = hasAttendanceData 
                  ? Math.round((course.attendance / course.totalClasses) * 100) 
                  : 0;
                
                const color = attendancePercent > 75 ? 'bg-emerald-500' : attendancePercent > 60 ? 'bg-amber-500' : 'bg-red-500';
                
                return (
                  <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">{course.code}</span>
                        <span className="text-xs text-slate-400">{course.credits} Credits</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">{course.name}</h4>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">{isFaculty ? "Avg Attendance" : "Attendance"}</p>
                        {hasAttendanceData ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-slate-800">{attendancePercent}%</span>
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${color}`} style={{ width: `${attendancePercent}%` }}></div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{course.attendance}/{course.totalClasses} Classes</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400 italic">No data logged</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Vault of Knowledge */}
          <div className="mt-8 pt-8 border-t border-slate-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Download className="w-5 h-5 text-sky-600" />
                  The Vault of Knowledge (Resources)
                </h3>
                {isFaculty && (
                   <button 
                     onClick={() => setShowUpload(!showUpload)}
                     className="text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg font-bold border border-sky-100 hover:bg-sky-100 transition-colors flex items-center gap-1"
                   >
                     <Upload className="w-3 h-3" /> Upload
                   </button>
                )}
             </div>

             {showUpload && (
                <div className="bg-white p-4 mb-4 rounded-xl border border-sky-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                   <form onSubmit={handleUpload} className="flex gap-2 items-end">
                      <div className="flex-1">
                         <label className="text-xs font-bold text-slate-500">Resource Title</label>
                         <input required value={resData.title} onChange={e => setResData({...resData, title: e.target.value})} className="w-full p-2 border rounded-lg text-sm mt-1" placeholder="Lecture Notes..." />
                      </div>
                      <div className="w-24">
                         <label className="text-xs font-bold text-slate-500">Type</label>
                         <select value={resData.type} onChange={e => setResData({...resData, type: e.target.value})} className="w-full p-2 border rounded-lg text-sm mt-1">
                            <option>PDF</option>
                            <option>DOC</option>
                            <option>PPT</option>
                         </select>
                      </div>
                      <button disabled={uploading} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-700 h-10">
                        {uploading ? '...' : 'Add'}
                      </button>
                   </form>
                </div>
             )}

             <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex gap-2 mb-4">
                   <input type="text" placeholder="Search papers, notes..." className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                   <button className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-100">Filter</button>
                </div>
                {resources.length === 0 ? (
                  <p className="text-center text-slate-400 py-4 text-sm">The vault is empty.</p>
                ) : (
                  <div className="space-y-2">
                    {resources.map((res) => (
                      <div key={res.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 hover:border-sky-300 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 font-bold text-xs">{res.type}</div>
                            <div>
                                <p className="text-sm font-medium text-slate-800 group-hover:text-sky-600">{res.title}</p>
                                <p className="text-xs text-slate-400">Uploaded by {res.uploaded_by} • {res.size}</p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-slate-300 group-hover:text-sky-500" />
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Chronos Calendar & Predictor */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-600" />
                Chronos Calendar
             </h3>
             <div className="space-y-4">
                {assignments.length === 0 ? (
                   <p className="text-sm text-slate-400">No upcoming assignments.</p>
                ) : (
                  assignments.slice(0, 3).map((assign) => {
                    const date = new Date(assign.due_date);
                    const month = date.toLocaleString('default', { month: 'short' });
                    const day = date.getDate();
                    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={assign.id} className="flex gap-3 items-start">
                        <div className="flex-shrink-0 w-12 text-center">
                            <span className="block text-xs font-bold text-indigo-600 uppercase">{month}</span>
                            <span className="block text-2xl font-bold text-slate-800">{day}</span>
                        </div>
                        <div className="flex-1 pb-4 border-b border-slate-100">
                            <p className="font-medium text-slate-800 text-sm">{assign.title}</p>
                            <p className="text-xs text-slate-500">{assign.course_code} • {time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
             <button className="w-full mt-4 text-sm text-indigo-600 font-medium hover:bg-indigo-50 py-2 rounded-lg transition-colors">
               View Full Schedule
             </button>
          </div>
          
          {/* Interactive Destiny Predictor */}
          {!isFaculty && (
            <div className={`bg-emerald-900 text-white rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 ${predictorOpen ? 'p-6' : 'p-6 hover:shadow-xl'}`}>
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Destiny Predictor
                            </h3>
                            {!predictorOpen && <p className="text-emerald-200 text-sm mt-1">Calculate your path to glory.</p>}
                        </div>
                        <button 
                            onClick={() => setPredictorOpen(!predictorOpen)}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            {predictorOpen ? <ChevronUp className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                        </button>
                    </div>

                    {!predictorOpen ? (
                        <div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold">{currentCGPA.toFixed(2)}</span>
                                <span className="text-emerald-300 mb-1">Current CGPA</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2 mt-2">
                                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(currentCGPA / 10) * 100}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-emerald-200 block mb-1">Credits Done</label>
                                    <input 
                                        type="number" 
                                        value={creditsDone}
                                        onChange={(e) => setCreditsDone(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-emerald-200 block mb-1">Next Sem Credits</label>
                                    <input 
                                        type="number" 
                                        value={creditsNext}
                                        onChange={(e) => setCreditsNext(Math.max(1, Number(e.target.value)))}
                                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 text-white"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-emerald-200 block mb-1">Target CGPA Goal</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="10" 
                                        step="0.05"
                                        value={targetGoal}
                                        onChange={(e) => setTargetGoal(Number(e.target.value))}
                                        className="flex-1 accent-emerald-400 h-2 bg-emerald-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="font-bold w-12 text-right">{targetGoal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${isPossible ? 'bg-emerald-800/50 border-emerald-700' : 'bg-red-900/50 border-red-700'} mt-4`}>
                                <p className="text-xs text-emerald-200 uppercase tracking-wide mb-1">Required SGPA</p>
                                <div className="flex items-end gap-2">
                                    <span className={`text-3xl font-bold ${isPossible ? 'text-white' : 'text-red-200'}`}>
                                        {reqSGPA > 10 ? '> 10' : displaySGPA}
                                    </span>
                                    <span className="text-xs text-emerald-300 mb-1 pb-1">
                                         {reqSGPA > 10 
                                            ? "Impossible (Max 10)" 
                                            : reqSGPA <= currentCGPA 
                                                ? "You're safe!" 
                                                : "Work hard!"}
                                    </span>
                                </div>
                            </div>

                            {/* Logic Breakdown */}
                            <div className="mt-4 p-3 bg-black/20 rounded-lg text-xs font-mono text-emerald-200/80 space-y-1">
                              <div className="flex items-center gap-1 mb-2 text-emerald-100 font-bold border-b border-emerald-500/30 pb-1">
                                <HelpCircle className="w-3 h-3" /> Basis of Calculation
                              </div>
                              <div className="flex justify-between">
                                <span>Current Pts ({currentCGPA}×{creditsDone}):</span>
                                <span>{totalCurrentPoints.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Target Pts ({targetGoal.toFixed(2)}×{totalCreditsNew}):</span>
                                <span>{requiredTotalPoints.toFixed(1)}</span>
                              </div>
                              <div className="border-t border-emerald-500/30 my-1"></div>
                              <div className="flex justify-between font-bold text-emerald-100">
                                <span>Pts Needed (Diff):</span>
                                <span>{requiredSemPoints.toFixed(1)}</span>
                              </div>
                              <div className="text-right text-[10px] mt-1 text-emerald-300">
                                {requiredSemPoints.toFixed(1)} ÷ {creditsNext} Credits = {reqSGPA.toFixed(2)} SGPA
                              </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Academics;