import React, { useState, useMemo } from 'react';
import { User, UserRole, Job, VerificationTier, CategoryType, Bid, Conversation, Notification } from './types';
import { CONTRACTOR_USER, SUBCONTRACTOR_USER, ADMIN_USER, MOCK_JOBS, CATEGORY_SUB_MAP, MOCK_CONVERSATIONS, MOCK_NOTIFICATIONS } from './constants';
import { DashboardHeader } from './components/DashboardHeader';
import { ChatWindow } from './components/ChatWindow';
import { VerificationBadge, CategoryBadge, Input, Select, Modal, EmptyState, Button } from './components/Shared';
import { 
  Briefcase, MapPin, Clock, PlusCircle, Eye, Search, Filter, 
  BarChart3, CheckCircle, TrendingUp, Hammer, Lock, MessageSquare, 
  User as UserIcon, Calendar, ArrowRight, UploadCloud, AlertTriangle, Shield,
  Image as ImageIcon, X, FileCheck, Star, Pencil, Award, ThumbsUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function App() {
  // --- Global State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  // --- UI State ---
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false); // Chat Drawer
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'JOBS' | 'BIDS' | 'PROFILE' | 'ADMIN'>('DASHBOARD');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null); // For Detail View
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  
  // --- Form/Modal State ---
  const [isJobModalOpen, setJobModalOpen] = useState(false);
  const [isBidModalOpen, setBidModalOpen] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [jobSuccessMessage, setJobSuccessMessage] = useState<string | null>(null);
  
  const [newJobData, setNewJobData] = useState({
    title: '', description: '', category: CategoryType.STRUCTURAL, subCategory: '', location: '', deadline: ''
  });
  const [bidData, setBidData] = useState({ amount: '', duration: '', notes: '', materials: false });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Profile Edit State
  const [editProfileData, setEditProfileData] = useState<Partial<User>>({});

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.includes('admin')) {
        setCurrentUser(ADMIN_USER);
        setCurrentView('ADMIN');
    } else if (loginEmail.includes('yilmaz')) {
        setCurrentUser(CONTRACTOR_USER);
        setCurrentView('DASHBOARD');
    } else {
        setCurrentUser(SUBCONTRACTOR_USER);
        setCurrentView('DASHBOARD');
    }
  };

  const handleCreateJob = () => {
    const newJob: Job = {
      id: `j${Date.now()}`,
      contractorId: currentUser!.id,
      title: newJobData.title,
      description: newJobData.description,
      category: newJobData.category,
      subCategory: newJobData.subCategory || 'Genel',
      location: newJobData.location,
      status: 'PENDING_APPROVAL', // New jobs pending by default
      createdAt: new Date().toISOString().split('T')[0],
      deadline: newJobData.deadline,
      viewCount: 0,
      bids: [],
      files: [], 
      imageUrls: [] // Placeholder
    };
    setJobs([newJob, ...jobs]);
    setJobModalOpen(false);
    setNewJobData({ title: '', description: '', category: CategoryType.STRUCTURAL, subCategory: '', location: '', deadline: '' });
    
    // Show success message
    setJobSuccessMessage("İlanınız oluşturuldu ve editör onayına gönderildi. Onaylandığında yayına alınacaktır.");
    setTimeout(() => setJobSuccessMessage(null), 5000);
  };

  const handleApproveJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'OPEN' } : j));
  };

  const handleRejectJob = (jobId: string) => {
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  const handleSubmitBid = () => {
    if (!selectedJobId || !currentUser) return;
    const newBid: Bid = {
      id: `b${Date.now()}`,
      jobId: selectedJobId,
      subcontractorId: currentUser.id,
      subcontractorName: currentUser.name,
      subcontractorTier: currentUser.tier,
      amount: Number(bidData.amount),
      materialsIncluded: bidData.materials,
      estimatedDuration: bidData.duration,
      proposalText: bidData.notes,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      isSealed: true
    };
    const updatedJobs = jobs.map(job => job.id === selectedJobId ? { ...job, bids: [...job.bids, newBid] } : job);
    setJobs(updatedJobs);
    setBidModalOpen(false);
    setBidData({ amount: '', duration: '', notes: '', materials: false });
  };

  const handleSendMessage = (text: string, conversationId: string) => {
    if (!currentUser) return;
    const newMessage = {
        id: `m${Date.now()}`,
        senderId: currentUser.id,
        content: text,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isRead: true,
        type: 'text' as const
    };
    const updatedConversations = conversations.map(c => 
        c.id === conversationId ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastMessageTime: newMessage.timestamp } : c
    );
    setConversations(updatedConversations);
  };

  const handleNotificationClick = (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if(notif) {
        setNotifications(notifications.map(n => n.id === id ? {...n, isRead: true} : n));
        if(notif.link?.startsWith('job:')) {
            const jid = notif.link.split(':')[1];
            setSelectedJobId(jid);
            setCurrentView('JOBS');
        }
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({...n, isRead: true})));
  };

  const handleEditProfileOpen = () => {
      setEditProfileData({...currentUser});
      setEditProfileModalOpen(true);
  };

  const handleUpdateProfile = () => {
      if(!currentUser) return;
      setCurrentUser({...currentUser, ...editProfileData});
      setEditProfileModalOpen(false);
  };

  // --- Derived Data ---
  const isContractor = currentUser?.role === 'CONTRACTOR';
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Job Filters
  const myJobs = useMemo(() => jobs.filter(j => j.contractorId === currentUser?.id), [jobs, currentUser]);
  const openJobs = useMemo(() => jobs.filter(j => j.status === 'OPEN' && j.contractorId !== currentUser?.id), [jobs, currentUser]);
  const pendingJobs = useMemo(() => jobs.filter(j => j.status === 'PENDING_APPROVAL'), [jobs]);
  const myBids = useMemo(() => jobs.filter(j => j.bids.some(b => b.subcontractorId === currentUser?.id)), [jobs, currentUser]);
  
  // Chat Filtering
  const myConversations = useMemo(() => {
    if (isAdmin) return []; 
    return conversations.filter(c => c.otherUserId !== currentUser?.id);
  }, [conversations, currentUser, isAdmin]);


  // --- Views Components ---

  const AuthScreen = () => (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
       {/* Left Brand Section */}
       <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
             <h1 className="text-3xl font-bold mb-6 text-primary-400">inşaateklif</h1>
             <h2 className="text-5xl font-bold leading-tight mb-6">İnşaat Sektörünün<br/>Dijital Geleceği</h2>
             <p className="text-xl text-gray-400 max-w-md">Kapalı usul ihale sistemi ile güvenli, şeffaf ve rekabetçi teklifler alın.</p>
          </div>
          <div className="relative z-10 space-y-6 mt-12">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400"><Lock /></div>
                <div><h3 className="font-bold">Kapalı İhale Güvenliği</h3><p className="text-sm text-gray-500">Teklifleriniz ihale bitimine kadar şifrelenir.</p></div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center text-secondary-400"><CheckCircle /></div>
                <div><h3 className="font-bold">Doğrulanmış Profesyoneller</h3><p className="text-sm text-gray-500">NVI ve Vergi Levhası kontrolü yapılmış üyeler.</p></div>
             </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-900/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
       </div>

       {/* Right Login Section */}
       <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
             <h3 className="text-2xl font-bold text-gray-900 mb-1">Giriş Yap</h3>
             <p className="text-gray-500 text-sm mb-8">Hesabınıza erişmek için bilgilerinizi girin.</p>
             
             <form onSubmit={handleLogin} className="space-y-4">
                <Input label="E-posta Adresi" type="email" placeholder="ornek@firma.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                <Input label="Şifre" type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                
                <div className="flex justify-between items-center text-sm">
                   <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" /> Beni Hatırla
                   </label>
                   <a href="#" className="text-primary-600 font-medium hover:underline">Şifremi Unuttum</a>
                </div>

                <Button type="submit" className="w-full">Giriş Yap</Button>
             </form>

             <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-semibold">Hızlı Erişim (Demo)</p>
                <div className="flex gap-2 justify-center flex-wrap">
                   <button onClick={() => {setLoginEmail('info@yilmazyapi.com.tr'); setLoginPass('123');}} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-md font-medium border border-blue-200">Müteahhit Doldur</button>
                   <button onClick={() => {setLoginEmail('ahmet@usta.com'); setLoginPass('123');}} className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-md font-medium border border-amber-200">Usta Doldur</button>
                   <button onClick={() => {setLoginEmail('admin@insaateklif.com'); setLoginPass('123');}} className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-md font-medium border border-red-200">Admin Doldur</button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const ProfileView = () => (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-10">
          {/* Cover & Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group relative">
              <div className="h-48 bg-gradient-to-r from-slate-700 to-slate-900 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200')] bg-cover bg-center opacity-30"></div>
              </div>
              
              <div className="px-6 md:px-10 pb-8 relative">
                  <div className="flex flex-col md:flex-row justify-between items-end -mt-16 gap-4">
                      <div className="flex items-end gap-5">
                          <div className="relative">
                             <img src={currentUser?.avatarUrl} className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-white object-cover" />
                             {currentUser?.role !== 'ADMIN' && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Çevrimiçi">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                             )}
                          </div>
                          <div className="mb-2">
                              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                  {currentUser?.name}
                                  <VerificationBadge tier={currentUser?.tier || VerificationTier.UNVERIFIED} showLabel={false} />
                              </h2>
                              <p className="text-gray-500 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {currentUser?.location} <span className="text-gray-300">|</span> <span className="text-primary-600 font-medium">{currentUser?.role === 'CONTRACTOR' ? 'Müteahhit Firma' : 'Profesyonel Usta'}</span></p>
                          </div>
                      </div>
                      <div className="flex gap-2 mb-2 w-full md:w-auto">
                          <Button variant="outline" className="flex-1 md:flex-none" onClick={handleEditProfileOpen}>
                              <Pencil className="w-4 h-4" /> Profili Düzenle
                          </Button>
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Stats & Info */}
              <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                          <div className="text-yellow-500 flex justify-center mb-1"><Star className="w-6 h-6 fill-yellow-500" /></div>
                          <div className="font-bold text-xl text-gray-900">{currentUser?.rating || '0.0'}</div>
                          <div className="text-xs text-gray-500">Ortalama Puan</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                          <div className="text-blue-500 flex justify-center mb-1"><Award className="w-6 h-6" /></div>
                          <div className="font-bold text-xl text-gray-900">{currentUser?.completedJobs || '0'}</div>
                          <div className="text-xs text-gray-500">Tamamlanan İş</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center col-span-2">
                          <div className="text-green-500 flex justify-center mb-1"><Briefcase className="w-6 h-6" /></div>
                          <div className="font-bold text-xl text-gray-900">{currentUser?.yearsOfExperience || '1'}+ Yıl</div>
                          <div className="text-xs text-gray-500">Sektör Deneyimi</div>
                      </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">İletişim Bilgileri</h4>
                      <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-50">
                              <span className="text-gray-500">E-posta</span>
                              <span className="font-medium text-gray-900">{currentUser?.email}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                              <span className="text-gray-500">Telefon</span>
                              <span className="font-medium text-gray-900">{currentUser?.phone}</span>
                          </div>
                          <div className="flex justify-between py-2">
                              <span className="text-gray-500">Konum</span>
                              <span className="font-medium text-gray-900">{currentUser?.location}</span>
                          </div>
                      </div>
                  </div>

                  {/* Verification Status */}
                  <div className={`rounded-xl border p-6 ${currentUser?.tier === VerificationTier.TIER_1_COMPANY ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                       <h4 className={`font-bold mb-2 flex items-center gap-2 ${currentUser?.tier === VerificationTier.TIER_1_COMPANY ? 'text-yellow-800' : 'text-gray-700'}`}>
                          <Shield className="w-5 h-5" /> Rozet Durumu
                       </h4>
                       <p className="text-sm mb-4 opacity-80">
                           {currentUser?.tier === VerificationTier.TIER_1_COMPANY 
                            ? 'Hesabınız doğrulanmış ve "Güvenilir Firma" rozetine sahiptir.' 
                            : 'Onaylı üye olarak güvenilirliğinizi artırın ve daha fazla iş alın.'}
                       </p>
                       {currentUser?.tier !== VerificationTier.TIER_1_COMPANY && (
                           <Button size="sm" className="w-full" onClick={() => setVerificationModalOpen(true)}>Rozet Yükselt</Button>
                       )}
                  </div>
              </div>

              {/* Middle & Right Column: Content */}
              <div className="md:col-span-2 space-y-6">
                  {/* About */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">Hakkında</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                          {currentUser?.about || "Henüz kendinizden bahsetmediniz. Profilinizi düzenleyerek bir açıklama ekleyin."}
                      </p>
                      
                      <div className="mt-6">
                          <h4 className="font-bold text-gray-900 mb-3 text-sm">Hizmet Alanları</h4>
                          <div className="flex flex-wrap gap-2">
                              {currentUser?.services?.length ? currentUser.services.map(s => (
                                  <span key={s} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>
                              )) : <span className="text-sm text-gray-400">Hizmet eklenmemiş.</span>}
                          </div>
                      </div>
                  </div>

                  {/* Portfolio Gallery */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-900 text-lg">Portfolyo & Projeler</h3>
                          <Button variant="ghost" className="text-xs h-8">Tümünü Gör</Button>
                      </div>
                      
                      {currentUser?.portfolioImages && currentUser.portfolioImages.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {currentUser.portfolioImages.map((img, idx) => (
                                  <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer">
                                      <img src={img} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                          <Eye className="w-6 h-6 text-white" />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Henüz proje fotoğrafı yüklemediniz.</p>
                          </div>
                      )}
                  </div>

                  {/* Reviews */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Değerlendirmeler ({currentUser?.reviews?.length || 0})</h3>
                      <div className="space-y-4">
                          {currentUser?.reviews && currentUser.reviews.length > 0 ? currentUser.reviews.map(review => (
                              <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                                              {review.author.charAt(0)}
                                          </div>
                                          <span className="font-semibold text-sm text-gray-900">{review.author}</span>
                                      </div>
                                      <span className="text-xs text-gray-400">{review.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-2">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                      ))}
                                  </div>
                                  <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                              </div>
                          )) : (
                              <div className="text-center text-sm text-gray-500 py-4">Henüz değerlendirme yok.</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const AdminView = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel - İlan Onayları</h2>
          <div className="grid grid-cols-1 gap-4">
              {pendingJobs.map(job => (
                  <div key={job.id} className="bg-white p-6 rounded-xl border border-l-4 border-l-yellow-500 border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">ONAY BEKLİYOR</span>
                                  <CategoryBadge category={job.category} />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                              <p className="text-gray-600 mb-4">{job.description}</p>
                              <div className="flex gap-4 text-sm text-gray-500">
                                  <span>Konum: {job.location}</span>
                                  <span>Tarih: {job.createdAt}</span>
                              </div>
                          </div>
                          <div className="flex flex-col gap-2">
                              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveJob(job.id)}>
                                  <CheckCircle className="w-4 h-4" /> Onayla & Yayınla
                              </Button>
                              <Button variant="danger" onClick={() => handleRejectJob(job.id)}>
                                  <X className="w-4 h-4" /> Reddet
                              </Button>
                          </div>
                      </div>
                  </div>
              ))}
              {pendingJobs.length === 0 && <EmptyState message="Onay bekleyen ilan yok." />}
          </div>
      </div>
  );

  const JobDetailView = ({ job }: { job: Job }) => {
    // Blind tender logic
    const isDeadlinePassed = new Date(job.deadline) < new Date(); 
    const [forceReveal, setForceReveal] = useState(false);
    const areBidsVisible = isDeadlinePassed || forceReveal;

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSelectedJobId(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-2">
           <ArrowRight className="w-4 h-4 rotate-180" /> Listeye Dön
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100">
             <div className="flex justify-between items-start gap-4">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      <CategoryBadge category={job.category} />
                      <span className="text-xs font-mono text-gray-400">#{job.id.toUpperCase()}</span>
                      {job.status === 'PENDING_APPROVAL' && <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Onay Bekliyor</span>}
                      {job.status === 'OPEN' && <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Aktif İhale</span>}
                   </div>
                   <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                   <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {job.location}</div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Son Tarih: <span className="font-semibold text-gray-900">{job.deadline}</span></div>
                      <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /> {job.viewCount} Görüntülenme</div>
                   </div>
                </div>
                {!isContractor && !isAdmin && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center min-w-[150px]">
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Kalan Süre</p>
                     <p className="text-xl font-bold text-gray-900">3 Gün</p>
                     <Button className="w-full mt-3 text-sm" onClick={() => setBidModalOpen(true)}>Teklif Ver</Button>
                  </div>
                )}
             </div>
          </div>
          
          <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
             <div className="md:col-span-2 space-y-6">
                <div>
                   <h3 className="font-bold text-gray-900 mb-3">İş Tanımı ve Gereksinimler</h3>
                   <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
                {job.files && (
                   <div>
                      <h3 className="font-bold text-gray-900 mb-3">Proje Dosyaları</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {job.files.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition cursor-pointer group">
                               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white text-gray-500 group-hover:text-primary-600"><UploadCloud className="w-5 h-5" /></div>
                               <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{f}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             {/* Right Sidebar for Detail View */}
             <div className="space-y-6">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                   <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> Kapalı İhale Kuralları</h4>
                   <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                      <li>Teklifler ihale süresi bitene kadar gizlidir.</li>
                      <li>Diğer firmaların fiyatlarını göremezsiniz.</li>
                      <li>Sadece bir kez teklif verebilirsiniz (revize edilebilir).</li>
                   </ul>
                </div>
                {isContractor && (
                   <div className="border border-gray-200 rounded-xl p-5">
                      <h4 className="font-bold text-gray-900 mb-4">İhale Yönetimi</h4>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm"><span className="text-gray-600">Toplam Teklif:</span> <span className="font-bold">{job.bids.length}</span></div>
                         <div className="flex justify-between text-sm"><span className="text-gray-600">Durum:</span> <span className="font-medium text-green-600">{job.status}</span></div>
                         <div className="pt-3 border-t">
                            <Button variant="outline" className="w-full text-xs" onClick={() => setForceReveal(!forceReveal)}>
                               {areBidsVisible ? 'Teklifleri Gizle (Demo)' : 'İhaleyi Sonlandır & Aç (Demo)'}
                            </Button>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* Bids Section for Contractor */}
          {isContractor && (
             <div className="border-t border-gray-200 bg-gray-50 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                   Gelen Teklifler
                   {!areBidsVisible && <span className="text-xs font-normal bg-gray-200 px-2 py-1 rounded text-gray-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Şifreli & Kilitli</span>}
                </h3>
                
                {job.bids.length > 0 ? (
                   <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                            <tr>
                               <th className="px-6 py-4 font-medium">Firma / Usta</th>
                               <th className="px-6 py-4 font-medium">Doğrulama</th>
                               <th className="px-6 py-4 font-medium">Teklif Tutarı</th>
                               <th className="px-6 py-4 font-medium">Süre</th>
                               <th className="px-6 py-4 font-medium">Detay</th>
                               <th className="px-6 py-4 font-medium">İşlem</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {job.bids.map(bid => (
                               <tr key={bid.id} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-4 font-medium text-gray-900">
                                     {areBidsVisible ? bid.subcontractorName : <span className="blur-sm select-none text-gray-400">Gizli İsim</span>}
                                  </td>
                                  <td className="px-6 py-4">
                                     {areBidsVisible ? <VerificationBadge tier={bid.subcontractorTier} /> : <span className="text-gray-400">-</span>}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-gray-900">
                                     {areBidsVisible ? `${bid.amount.toLocaleString()} ₺` : <span className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-1 rounded w-fit"><Lock className="w-3 h-3" /> Kilitli</span>}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">
                                     {areBidsVisible ? bid.estimatedDuration : '---'}
                                  </td>
                                  <td className="px-6 py-4 max-w-xs truncate text-gray-500">
                                     {areBidsVisible ? bid.proposalText : '****************'}
                                  </td>
                                  <td className="px-6 py-4">
                                     <Button variant="outline" className="py-1.5 px-3 text-xs" disabled={!areBidsVisible}>İncele</Button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                ) : (
                   <EmptyState message="Henüz bu ilana teklif gelmedi." subMessage="Teklifler geldiğinde burada şifrelenmiş olarak listelenecektir." />
                )}
             </div>
          )}
        </div>
      </div>
    );
  };

  // --- Main Render ---

  if (!currentUser) return <AuthScreen />;

  // View Routing
  let content;
  if (selectedJobId) {
     const job = jobs.find(j => j.id === selectedJobId);
     content = job ? <JobDetailView job={job} /> : <div>Job not found</div>;
  } else if (currentView === 'ADMIN') {
      content = <AdminView />
  } else if (currentView === 'PROFILE') {
      content = <ProfileView />
  } else if (currentView === 'DASHBOARD') {
     // ... (Stats Logic) ...
     const stats = isContractor ? [
        { label: 'Aktif İlanlar', value: myJobs.filter(j => j.status === 'OPEN').length },
        { label: 'Onay Bekleyen', value: myJobs.filter(j => j.status === 'PENDING_APPROVAL').length },
        { label: 'Bekleyen Teklifler', value: myJobs.reduce((acc, j) => acc + j.bids.length, 0) },
      ] : [
        { label: 'Verilen Teklifler', value: myBids.length },
        { label: 'Kazanılan İhaleler', value: 0 },
        { label: 'Profil Puanı', value: '4.9/5' },
      ];
      
     content = (
        <div className="space-y-8 animate-in fade-in duration-500">
            {jobSuccessMessage && (
               <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                   <CheckCircle className="w-5 h-5" /> {jobSuccessMessage}
               </div>
            )}
           <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-2xl font-bold text-gray-900">Hoşgeldin, {currentUser.name}</h2>
                 <p className="text-gray-500">İşte bugünkü özet raporun.</p>
              </div>
              {isContractor && <Button onClick={() => setJobModalOpen(true)}><PlusCircle className="w-4 h-4" /> Yeni İlan</Button>}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <p className="text-sm text-gray-500 font-medium mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                 </div>
              ))}
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 mb-6">Aylık Aktivite</h3>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={isContractor ? myJobs.map(j => ({name: j.id, val: j.bids.length})) : myBids.map(j => ({name: j.id, val: j.bids[0]?.amount/1000}))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" hide />
                          <YAxis />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="val" fill={isContractor ? '#0ea5e9' : '#f59e0b'} radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{isContractor ? 'Son İlanlar' : 'Sizin İçin Önerilenler'}</h3>
                    <button onClick={() => setCurrentView('JOBS')} className="text-sm text-primary-600 font-medium hover:underline">Tümünü Gör</button>
                 </div>
                 <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
                    {(isContractor ? myJobs : openJobs).slice(0, 4).map(job => (
                       <div key={job.id} onClick={() => setSelectedJobId(job.id)} className="p-4 bg-gray-50 hover:bg-white hover:shadow-md transition rounded-lg border border-gray-100 cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition">{job.title}</h4>
                             <CategoryBadge category={job.category} />
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                             <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.deadline}</span>
                          </div>
                       </div>
                    ))}
                    {(isContractor ? myJobs : openJobs).length === 0 && <EmptyState message="Veri bulunamadı." />}
                 </div>
              </div>
           </div>
        </div>
     );
  } else if (currentView === 'JOBS') {
     content = (
        <div className="space-y-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-end">
              <div>
                 <h2 className="text-2xl font-bold text-gray-900">{isContractor ? 'İlanlarım' : 'İş Fırsatları'}</h2>
                 <p className="text-gray-500 mt-1">{isContractor ? 'Yayınladığınız tüm ihaleleri buradan yönetin.' : 'Türkiye genelindeki açık ihalelere teklif verin.'}</p>
              </div>
              {isContractor && <Button onClick={() => setJobModalOpen(true)}><PlusCircle className="w-4 h-4" /> Yeni İlan</Button>}
           </div>

           {/* Job Cards */}
           <div className="grid grid-cols-1 gap-4">
              {(isContractor ? myJobs : openJobs).map(job => (
                 <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    {job.status === 'PENDING_APPROVAL' && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl">ONAY BEKLİYOR</div>}
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                          <CategoryBadge category={job.category} />
                          <span className="text-xs text-gray-400">#{job.id}</span>
                       </div>
                       <h3 className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-primary-600" onClick={() => setSelectedJobId(job.id)}>{job.title}</h3>
                       <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>
                       <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><MapPin className="w-3 h-3" /> {job.location}</span>
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar className="w-3 h-3" /> {job.deadline}</span>
                       </div>
                    </div>
                    <div className="flex md:flex-col items-center justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                       <div className="text-center mb-0 md:mb-4">
                          <span className="block text-2xl font-bold text-gray-900">{job.bids.length}</span>
                          <span className="text-xs text-gray-500 font-medium">Teklif</span>
                       </div>
                       <Button variant={isContractor ? "outline" : "primary"} className="w-full text-sm" onClick={() => setSelectedJobId(job.id)}>
                          {isContractor ? 'Yönet' : 'İncele'}
                       </Button>
                    </div>
                 </div>
              ))}
              {(isContractor ? myJobs : openJobs).length === 0 && <EmptyState message="Listelenecek iş bulunamadı." />}
           </div>
        </div>
     );
  } else if (currentView === 'BIDS') {
      content = (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tekliflerim</h2>
              {myBids.map(job => {
                  const myBid = job.bids.find(b => b.subcontractorId === currentUser.id);
                  return (
                      <div key={job.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between mb-2">
                              <h3 className="font-bold text-gray-900 cursor-pointer hover:text-primary-600" onClick={() => setSelectedJobId(job.id)}>{job.title}</h3>
                              <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded h-fit">Değerlendiriliyor</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-100 flex justify-between items-center">
                              <div>
                                  <p className="text-xs text-gray-500">Teklifiniz</p>
                                  <p className="font-bold text-lg">{myBid?.amount.toLocaleString()} ₺</p>
                              </div>
                              <div className="text-sm text-gray-600">
                                  {myBid?.estimatedDuration}
                              </div>
                          </div>
                      </div>
                  )
              })}
              {myBids.length === 0 && <EmptyState message="Henüz teklif vermediniz." />}
          </div>
      )
  }

  // --- Layout ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <DashboardHeader 
        user={currentUser} 
        onLogout={() => setCurrentUser(null)} 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        toggleChat={() => setChatOpen(!isChatOpen)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
        unreadChatCount={myConversations.reduce((a,c) => a + c.unreadCount, 0)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:relative z-50 lg:z-auto w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-2xl lg:shadow-none`}>
          {/* Mobile Header with Close Button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 lg:hidden">
            <span className="font-bold text-lg text-gray-900">Menü</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-1 flex-1">
            {[
              { id: 'DASHBOARD', icon: Briefcase, label: 'Genel Bakış' },
              { id: 'JOBS', icon: Search, label: isContractor ? 'İlanlarım' : 'İş Fırsatları' },
              !isContractor && !isAdmin && { id: 'BIDS', icon: Hammer, label: 'Tekliflerim' },
              { id: 'PROFILE', icon: UserIcon, label: 'Profilim' },
              isAdmin && { id: 'ADMIN', icon: Shield, label: 'İlan Onayları' }
            ].filter(Boolean).map((item: any) => (
              <button 
                key={item.id}
                onClick={() => { setCurrentView(item.id); setSelectedJobId(null); setSidebarOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${currentView === item.id && !selectedJobId ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                   <item.icon className="w-5 h-5" />
                   {item.label}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-100">
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h4 className="font-bold text-sm mb-1">Onaylı Üye Ol</h4>
                   <p className="text-[10px] text-slate-300 mb-3 opacity-90">Daha fazla iş al ve güven kazan.</p>
                   <Button variant="outline" className="w-full text-xs py-1.5 h-auto bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => { setVerificationModalOpen(true); setSidebarOpen(false); }}>Başvur</Button>
                </div>
                <Shield className="absolute -bottom-4 -right-4 w-20 h-20 text-white/5 rotate-12" />
             </div>
          </div>
        </aside>
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {content}
        </main>

        {/* Chat Drawer (Right Side) */}
        {/* Overlay */}
        {isChatOpen && !isAdmin && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setChatOpen(false)}></div>}
        
        {!isAdmin && (
            <aside className={`${isChatOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 fixed top-16 right-0 bottom-0 w-full sm:w-96 bg-white border-l border-gray-200 z-40 shadow-2xl flex flex-col`}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Mesajlar</h3>
                    <button onClick={() => setChatOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                {selectedChatId ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <button onClick={() => setSelectedChatId(null)} className="p-2 text-xs text-gray-500 hover:bg-gray-100 flex items-center gap-1 border-b">
                            <ArrowRight className="w-3 h-3 rotate-180" /> Geri Dön
                        </button>
                        <div className="flex-1 overflow-hidden">
                            <ChatWindow 
                            conversation={conversations.find(c => c.id === selectedChatId)!} 
                            currentUser={currentUser} 
                            onSendMessage={(txt) => handleSendMessage(txt, selectedChatId)} 
                            onClose={() => setSelectedChatId(null)} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {myConversations.map(conv => (
                            <div key={conv.id} onClick={() => setSelectedChatId(conv.id)} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3 relative">
                                <img src={conv.otherUserAvatar} className="w-10 h-10 rounded-full bg-gray-200" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-sm text-gray-900 truncate">{conv.otherUserName}</h4>
                                        <span className="text-[10px] text-gray-400">{conv.lastMessageTime}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unreadCount > 0 && <div className="absolute right-4 bottom-4 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{conv.unreadCount}</div>}
                            </div>
                        ))}
                        {myConversations.length === 0 && <EmptyState message="Mesajınız yok." />}
                    </div>
                )}
            </aside>
        )}

      </div>

      {/* --- Modals --- */}
      <Modal isOpen={isJobModalOpen} onClose={() => setJobModalOpen(false)} title="Yeni İş İlanı Oluştur" size="lg">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <Input label="İş Başlığı" placeholder="Örn: 3 Katlı Bina Dış Cephe Mantolama" value={newJobData.title} onChange={e => setNewJobData({...newJobData, title: e.target.value})} />
            </div>
            <Select label="Kategori" value={newJobData.category} onChange={e => setNewJobData({...newJobData, category: e.target.value as CategoryType})}>
              {Object.values(CategoryType).map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Alt Kategori" value={newJobData.subCategory} onChange={e => setNewJobData({...newJobData, subCategory: e.target.value})}>
               <option value="">Seçiniz</option>
               {newJobData.category && CATEGORY_SUB_MAP[newJobData.category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </Select>
            <div className="md:col-span-2">
               <label className="text-sm font-medium text-gray-700 block mb-1.5">İş Tanımı</label>
               <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none" placeholder="Detaylı açıklama..." value={newJobData.description} onChange={e => setNewJobData({...newJobData, description: e.target.value})} />
            </div>
             <div className="md:col-span-2">
                 <label className="text-sm font-medium text-gray-700 block mb-1.5">Fotoğraf / Dosya Yükle</label>
                 <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-primary-500 transition cursor-pointer">
                     <ImageIcon className="w-8 h-8 mb-2" />
                     <span className="text-xs">Fotoğraf yüklemek için tıklayın veya sürükleyin</span>
                 </div>
             </div>
            <Input label="Konum" placeholder="İlçe, İl" value={newJobData.location} onChange={e => setNewJobData({...newJobData, location: e.target.value})} />
            <Input label="Son Tarih" type="date" value={newJobData.deadline} onChange={e => setNewJobData({...newJobData, deadline: e.target.value})} />
            
            <div className="md:col-span-2 border-t border-gray-100 pt-6 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setJobModalOpen(false)}>İptal</Button>
               <Button onClick={handleCreateJob}>İlanı Oluştur</Button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isBidModalOpen} onClose={() => setBidModalOpen(false)} title="Teklif Ver">
        <div className="space-y-6">
           <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex gap-3">
               <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
               <div className="text-sm text-amber-900">
                  <p className="font-bold">Dikkat: Kapalı İhale</p>
                  <p>Verdiğiniz fiyat ihale bitimine kadar şifrelenir. Rakipleriniz teklifinizi göremez.</p>
               </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Input label="Teklif Tutarı (TL)" type="number" placeholder="0.00" value={bidData.amount} onChange={e => setBidData({...bidData, amount: e.target.value})} />
              <Input label="Tahmini Süre" placeholder="Örn: 15 Gün" value={bidData.duration} onChange={e => setBidData({...bidData, duration: e.target.value})} />
           </div>

           <div className="flex items-center gap-2">
              <input type="checkbox" id="mat" checked={bidData.materials} onChange={e => setBidData({...bidData, materials: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="mat" className="text-sm font-medium text-gray-700">Malzeme Dahil Fiyat</label>
           </div>

           <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Teklif Notu</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-24" placeholder="İş planınızdan bahsedin..." value={bidData.notes} onChange={e => setBidData({...bidData, notes: e.target.value})} />
           </div>

           <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setBidModalOpen(false)}>Vazgeç</Button>
              <Button variant="secondary" onClick={handleSubmitBid}>Teklifi Gönder</Button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={isVerificationModalOpen} onClose={() => setVerificationModalOpen(false)} title="Onaylı Üye Başvurusu">
          <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Evraklarınızı Yükleyin</h3>
              <p className="text-sm text-gray-600">Onaylı üye rozeti almak için Vergi Levhası veya Faaliyet Belgesi yüklemeniz gerekmektedir.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition">
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Dosya seçmek için tıklayın</p>
              </div>

              <div className="pt-4">
                  <Button className="w-full" onClick={() => { setVerificationModalOpen(false); alert('Başvurunuz alındı. İnceleme sonrası bilgilendirileceksiniz.'); }}>Başvuruyu Tamamla</Button>
              </div>
          </div>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} title="Profili Düzenle">
          <div className="space-y-4">
              <Input label="Ad Soyad / Firma Adı" value={editProfileData.name || ''} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} />
              <Input label="Telefon" value={editProfileData.phone || ''} onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} />
              <Input label="Konum" value={editProfileData.location || ''} onChange={e => setEditProfileData({...editProfileData, location: e.target.value})} />
              
              <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Hakkında</label>
                  <textarea 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none"
                      value={editProfileData.about || ''}
                      onChange={e => setEditProfileData({...editProfileData, about: e.target.value})}
                  />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setEditProfileModalOpen(false)}>İptal</Button>
                  <Button onClick={handleUpdateProfile}>Değişiklikleri Kaydet</Button>
              </div>
          </div>
      </Modal>

    </div>
  );
}

export default App;