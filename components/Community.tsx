import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, Heart, Share2, ShieldAlert, Trash2, 
  UserX, Flag, Send, Loader2, AlertTriangle, Lock, MoreHorizontal,
  BadgeCheck, Pin
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { User, UserRole, Post, Comment } from '../types';

interface CommunityProps {
  user: User;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  
  // Post Creation
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  // Comments & Interaction
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const isAdminOrAuth = user.role === UserRole.ADMIN || user.role === UserRole.AUTHORITY;

  useEffect(() => {
    checkBanStatus();
    fetchPosts();
  }, []);

  const checkBanStatus = async () => {
    const { data } = await supabase.from('banned_users').select('*').eq('email', user.email).single();
    if (data) setIsBanned(true);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data as Post[]);
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) return;
    setPosting(true);

    const post = {
      title: newPostTitle,
      content: newPostContent,
      author_id: user.id,
      author_name: user.name,
      author_role: user.role,
      likes: 0
    };

    const { error } = await supabase.from('posts').insert([post]);
    
    setPosting(false);
    if (!error) {
      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdminOrAuth) return;
    if (window.confirm('Are you sure you want to purge this echo?')) {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (!error) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    }
  };

  const handleFlagPost = async (postId: string) => {
    if (isBanned) return;
    const { error } = await supabase.from('posts').update({ is_flagged: true }).eq('id', postId);
    if (!error) {
      setPosts(posts.map(p => p.id === postId ? { ...p, is_flagged: true } : p));
      alert("Post flagged for moderation review.");
    }
  };

  const executeBan = async (authorId: string) => {
     if (!isAdminOrAuth) return;
     const { data: profile } = await supabase.from('profiles').select('email').eq('id', authorId).single();
     
     if (profile && profile.email) {
        const reason = prompt("Enter reason for banishment:", "Violation of Citadel Protocols");
        if (reason) {
          await supabase.from('banned_users').insert([{
            email: profile.email,
            reason: reason,
            banned_by: user.name
          }]);
          alert("Protocol executed. User banished.");
        }
     } else {
       alert("Could not locate user signature.");
     }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
      if (data) {
        setComments(prev => ({ ...prev, [postId]: data as Comment[] }));
      }
    }
  };

  const handlePostComment = async (postId: string) => {
    if (!newComment.trim() || isBanned) return;
    setCommenting(true);
    
    const comment = {
      post_id: postId,
      content: newComment,
      author_id: user.id,
      author_name: user.name
    };

    const { data, error } = await supabase.from('comments').insert([comment]).select().single();
    
    setCommenting(false);
    if (!error && data) {
      setNewComment('');
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data as Comment]
      }));
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
     if (!isAdminOrAuth) return;
     const { error } = await supabase.from('comments').delete().eq('id', commentId);
     if(!error) {
       setComments(prev => ({
         ...prev,
         [postId]: prev[postId].filter(c => c.id !== commentId)
       }));
     }
  };

  // --- UI Helpers ---

  const getRoleStyles = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100' };
      case UserRole.AUTHORITY:
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100' };
      case UserRole.FACULTY:
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', badge: 'bg-sky-100 text-sky-700' };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (isBanned) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 animate-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 rounded-full"></div>
          <div className="relative w-24 h-24 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-slate-500 max-w-md mt-2">
            Your connection to the Hall of Echoes has been severed due to Citadel Protocol violations.
          </p>
        </div>
        <div className="bg-slate-900 text-red-400 px-4 py-2 rounded font-mono text-sm border border-red-900/50">
           ERROR_CODE: USER_BLACKLISTED
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-aegis-900 to-aegis-800 rounded-3xl p-8 overflow-hidden text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                Hall of Echoes
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-sky-200 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  Live Feed
                </span>
              </h2>
              <p className="text-sky-100/80 max-w-lg text-sm leading-relaxed">
                The unified public forum of IIT Mandi. Share ideas, discuss campus life, and connect with the Citadel network.
              </p>
            </div>
            {isAdminOrAuth && (
              <div className="hidden md:flex bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-2 rounded-xl items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-300" />
                <span className="text-xs font-bold text-red-100 uppercase tracking-wide">Admin Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group focus-within:ring-2 focus-within:ring-sky-100 transition-all">
        <form onSubmit={handleCreatePost} className="p-1">
           <input 
             value={newPostTitle}
             onChange={(e) => setNewPostTitle(e.target.value)}
             placeholder="What's on your mind?"
             className="w-full px-5 pt-5 pb-2 text-lg font-bold text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 bg-transparent"
           />
           <textarea 
             value={newPostContent}
             onChange={(e) => setNewPostContent(e.target.value)}
             placeholder="Share details with the community..."
             className="w-full px-5 py-2 h-20 resize-none border-none focus:ring-0 text-slate-600 placeholder:text-slate-300 bg-transparent"
           />
           <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex gap-2">
                 {/* Formatting icons could go here */}
                 <div className="text-xs text-slate-400 italic">
                   Be respectful. Your voice matters.
                 </div>
              </div>
              <button 
                disabled={posting || !newPostTitle || !newPostContent}
                className="bg-sky-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                Echo
              </button>
           </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
             <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
             <p className="text-sm">Synchronizing with Citadel...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
             <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
             <p className="text-slate-500 font-medium">Silence fills the hall.</p>
             <p className="text-slate-400 text-sm">Be the first to break the quiet.</p>
          </div>
        ) : (
          posts.map(post => {
            const roleStyle = getRoleStyles(post.author_role);
            return (
              <div key={post.id} className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md group ${post.is_flagged ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
                 
                 {/* Post Header */}
                 <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white ${
                           post.author_role === UserRole.ADMIN ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : 
                           post.author_role === UserRole.AUTHORITY ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
                           post.author_role === UserRole.FACULTY ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 
                           'bg-gradient-to-br from-sky-400 to-sky-500 text-white'
                         }`}>
                           {post.author_name.charAt(0)}
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <h3 className="font-bold text-slate-800 text-base">{post.title}</h3>
                             {post.is_flagged && (
                               <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                 <AlertTriangle className="w-3 h-3"/> Flagged
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-2 text-xs mt-0.5">
                             <span className="font-medium text-slate-700">{post.author_name}</span>
                             <span className="text-slate-300">•</span>
                             <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${roleStyle.badge}`}>
                               {post.author_role}
                             </span>
                             <span className="text-slate-300">•</span>
                             <span className="text-slate-400">{getTimeAgo(post.created_at)}</span>
                           </div>
                         </div>
                      </div>
                      
                      {/* Non-Admin Actions */}
                      <button 
                        onClick={() => handleFlagPost(post.id)}
                        className="text-slate-300 hover:text-amber-500 p-2 rounded-full hover:bg-amber-50 transition-colors"
                        title="Report"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="pl-[60px]">
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
                   </div>

                   {/* Admin Control Bar - Only Visible to Authorities */}
                   {isAdminOrAuth && (
                      <div className="mt-4 ml-[60px] bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-4 text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Moderation</span>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <button onClick={() => handleDeletePost(post.id)} className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors font-medium">
                           <Trash2 className="w-3 h-3" /> Delete
                        </button>
                        <button onClick={() => executeBan(post.author_id)} className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors font-medium">
                           <UserX className="w-3 h-3" /> Ban User
                        </button>
                      </div>
                   )}
                 </div>

                 {/* Action Bar */}
                 <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-6 rounded-b-2xl">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-medium group">
                       <div className="p-1.5 rounded-full group-hover:bg-rose-50 transition-colors">
                         <Heart className="w-4 h-4" /> 
                       </div>
                       {post.likes > 0 && <span>{post.likes}</span>}
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-2 transition-colors text-sm font-medium group ${expandedPostId === post.id ? 'text-sky-600' : 'text-slate-400 hover:text-sky-600'}`}
                    >
                       <div className="p-1.5 rounded-full group-hover:bg-sky-50 transition-colors">
                         <MessageSquare className="w-4 h-4" /> 
                       </div>
                       {comments[post.id] ? comments[post.id].length : 'Comment'}
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium ml-auto group">
                       <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                         <Share2 className="w-4 h-4" /> 
                       </div>
                    </button>
                 </div>

                 {/* Threaded Comments Section */}
                 {expandedPostId === post.id && (
                   <div className="bg-slate-50/80 border-t border-slate-100 p-6 rounded-b-2xl animate-in slide-in-from-top-1">
                      <div className="space-y-5 mb-6 pl-2">
                         {comments[post.id]?.map(comment => (
                           <div key={comment.id} className="flex gap-3 relative">
                              {/* Thread Line */}
                              <div className="absolute left-4 top-10 bottom-[-20px] w-0.5 bg-slate-200 last:hidden"></div>
                              
                              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm z-10">
                                {comment.author_name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                 <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold text-slate-700">{comment.author_name}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400">{getTimeAgo(comment.created_at)}</span>
                                        {isAdminOrAuth && (
                                          <button onClick={() => handleDeleteComment(comment.id, post.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-600">{comment.content}</p>
                                 </div>
                              </div>
                           </div>
                         ))}
                         {(!comments[post.id] || comments[post.id].length === 0) && (
                           <div className="text-center py-4">
                             <p className="text-xs text-slate-400 italic">No echoes yet. Start the conversation.</p>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex gap-2 items-end">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {user.name.charAt(0)}
                         </div>
                         <div className="flex-1 relative">
                           <textarea
                             value={newComment}
                             onChange={(e) => setNewComment(e.target.value)}
                             placeholder="Write a reply..."
                             className="w-full rounded-2xl border border-slate-200 pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none h-12 min-h-[48px] overflow-hidden"
                           />
                           <button 
                             onClick={() => handlePostComment(post.id)}
                             disabled={commenting || !newComment.trim()}
                             className="absolute right-2 top-2 p-1.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:bg-slate-300"
                           >
                             {commenting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-3 h-3" />}
                           </button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Community;