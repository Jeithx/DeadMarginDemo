import { User, VerificationTier, Job, CategoryType, Conversation, Notification } from './types';

// Mock Users
export const CONTRACTOR_USER: User = {
  id: 'c1',
  name: 'Yılmaz Yapı İnşaat A.Ş.',
  role: 'CONTRACTOR',
  tier: VerificationTier.TIER_1_COMPANY,
  location: 'Kadıköy, İstanbul',
  rating: 4.8,
  email: 'info@yilmazyapi.com.tr',
  phone: '0212 555 0000',
  avatarUrl: 'https://ui-avatars.com/api/?name=Yilmaz+Yapi&background=0ea5e9&color=fff',
  about: '30 yıllık tecrübemizle İstanbul genelinde konut ve ticari projeler üretiyoruz. Kalite ve güven önceliğimizdir.',
  completedJobs: 45,
  yearsOfExperience: 30,
  portfolioImages: [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1590986162386-82ae1046772b?w=400&h=300&fit=crop'
  ],
  reviews: [
    { id: 'r1', author: 'Ahmet Usta', rating: 5, comment: 'Ödemeleri her zaman zamanında yaparlar. Profesyonel bir firma.', date: '10 Ekim 2023' },
    { id: 'r2', author: 'Mega Elektrik', rating: 4, comment: 'İletişimi güçlü, proje detaylarına hakimler.', date: '15 Eylül 2023' }
  ]
};

export const SUBCONTRACTOR_USER: User = {
  id: 's1',
  name: 'Ahmet Usta (Elektrik)',
  role: 'SUBCONTRACTOR',
  tier: VerificationTier.TIER_2_INDIVIDUAL,
  location: 'Ümraniye, İstanbul',
  rating: 4.5,
  email: 'ahmet.usta@email.com',
  phone: '0555 123 4567',
  avatarUrl: 'https://ui-avatars.com/api/?name=Ahmet+Usta&background=f59e0b&color=fff',
  about: 'Elektrik tesisatı, pano montajı ve arıza giderme konusunda uzmanım. İşimi temiz ve zamanında teslim ederim.',
  services: ['Elektrik Tesisatı', 'Pano Montajı', 'Aydınlatma', 'Akıllı Ev Sistemleri'],
  completedJobs: 128,
  yearsOfExperience: 15,
  portfolioImages: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558402529-d2638a7023e9?w=400&h=300&fit=crop'
  ],
  reviews: [
    { id: 'r3', author: 'Yılmaz Yapı', rating: 5, comment: 'Ahmet Usta işinin ehli, çok temiz çalıştı.', date: '1 Hafta önce' }
  ]
};

export const ADMIN_USER: User = {
  id: 'admin1',
  name: 'Sistem Yöneticisi',
  role: 'ADMIN',
  tier: VerificationTier.TIER_1_COMPANY,
  location: 'Merkez',
  rating: 5.0,
  email: 'admin@insaateklif.com',
  phone: '-',
  avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff'
};

// Sub-categories map
export const CATEGORY_SUB_MAP: Record<CategoryType, string[]> = {
  [CategoryType.STRUCTURAL]: ['Kalıp İşleri', 'Demir İşleri', 'Beton Dökümü', 'Duvar Örümü'],
  [CategoryType.FINISHING]: ['Sıva', 'Alçı', 'Boya Badana', 'Fayans / Seramik', 'Parke'],
  [CategoryType.MECHANICAL]: ['Su Tesisatı', 'Doğalgaz', 'Kalorifer', 'Klima / HVAC'],
  [CategoryType.ELECTRICAL]: ['Elektrik Tesisatı', 'Aydınlatma', 'Güvenlik Sistemleri'],
  [CategoryType.EXTERIOR]: ['Mantolama', 'Çatı Kaplama', 'Su Yalıtımı'],
  [CategoryType.OTHER]: ['Peyzaj', 'Hafriyat', 'Temizlik']
};

// Initial Mock Jobs
export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    contractorId: 'c1',
    title: '12 Dairelik Konut Projesi Elektrik Tesisatı',
    description: 'Ataşehir projemiz için anahtar teslim elektrik tesisatı işi. Malzemeli teklif veriniz. Proje dosyaları ektedir. Teknik şartnameye uygun TSE belgeli malzeme kullanılacaktır.',
    category: CategoryType.ELECTRICAL,
    subCategory: 'Elektrik Tesisatı',
    location: 'Ataşehir, İstanbul',
    status: 'OPEN',
    createdAt: '2023-10-25',
    deadline: '2023-11-05',
    viewCount: 142,
    files: ['teknik_sartname.pdf', 'proje_cizim_v2.dwg'],
    bids: [
      {
        id: 'b1',
        jobId: 'j1',
        subcontractorId: 's5',
        subcontractorName: 'Mega Elektrik Ltd.',
        subcontractorTier: VerificationTier.TIER_1_COMPANY,
        amount: 250000,
        materialsIncluded: true,
        estimatedDuration: '20 Gün',
        proposalText: 'Tüm kablolama ve pano montajı dahildir. Şartname okundu, onaylandı.',
        createdAt: '2023-10-26',
        status: 'PENDING',
        isSealed: true // Bids are sealed initially
      },
      {
        id: 'b2',
        jobId: 'j1',
        subcontractorId: 's9',
        subcontractorName: 'Mehmet Usta',
        subcontractorTier: VerificationTier.TIER_2_INDIVIDUAL,
        amount: 180000,
        materialsIncluded: false,
        estimatedDuration: '25 Gün',
        proposalText: 'Sadece işçilik fiyatıdır. Malzeme sizden. Ekibimle hemen başlayabilirim.',
        createdAt: '2023-10-27',
        status: 'PENDING',
        isSealed: true
      }
    ]
  },
  {
    id: 'j2',
    contractorId: 'c2',
    title: 'Ofis Katı Alçıpan ve Boya İşleri',
    description: '250m2 ofis katı için asma tavan, bölme duvar ve boya işleri yapılacaktır. Acil başlangıç gerekli.',
    category: CategoryType.FINISHING,
    subCategory: 'Alçı',
    location: 'Levent, İstanbul',
    status: 'OPEN',
    createdAt: '2023-10-28',
    deadline: '2023-10-31',
    viewCount: 89,
    bids: []
  },
  {
    id: 'j3',
    contractorId: 'c1',
    title: 'Villa İnşaatı Kaba Yapı',
    description: 'Beykoz bölgesindeki villa projemiz için kalıp, demir ve beton işçiliği.',
    category: CategoryType.STRUCTURAL,
    subCategory: 'Kalıp İşleri',
    location: 'Beykoz, İstanbul',
    status: 'IN_PROGRESS',
    createdAt: '2023-10-01',
    deadline: '2023-10-15',
    viewCount: 320,
    bids: [] 
  }
];

// Mock Messages
// Corrected IDs to match SUBCONTRACTOR_USER (s1)
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    otherUserId: 'c1', // Chatting with Contractor 1
    otherUserName: 'Yılmaz Yapı İnşaat A.Ş.',
    otherUserAvatar: 'https://ui-avatars.com/api/?name=Yilmaz+Yapi&background=0ea5e9&color=fff',
    jobId: 'j1',
    jobTitle: '12 Dairelik Konut Projesi...',
    unreadCount: 1,
    lastMessage: 'Şantiyeyi ne zaman görebiliriz?',
    lastMessageTime: '10:30',
    messages: [
      { id: 'm1', senderId: 's1', content: 'Merhaba, proje ile ilgileniyoruz.', timestamp: '09:00', isRead: true, type: 'text' },
      { id: 'm2', senderId: 'c1', content: 'Memnun oldum, şartnameyi incelediniz mi?', timestamp: '09:15', isRead: true, type: 'text' },
      { id: 'm3', senderId: 's1', content: 'Evet inceledik. Şantiyeyi ne zaman görebiliriz?', timestamp: '10:30', isRead: true, type: 'text' },
      { id: 'm4', senderId: 'c1', content: 'Yarın 14:00 uygun mudur?', timestamp: '10:35', isRead: false, type: 'text' }
    ]
  }
];

// Mock Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'BID_RECEIVED',
    title: 'Yeni Teklif',
    message: 'Elektrik Tesisatı işinize yeni bir teklif geldi.',
    timestamp: '2 sa önce',
    isRead: false,
    link: 'job:j1'
  },
  {
    id: 'n2',
    type: 'SYSTEM',
    title: 'Hesap Onayı',
    message: 'Kurumsal evraklarınız onaylandı. Artık Altın Rozet sahibisiniz.',
    timestamp: '1 gün önce',
    isRead: true
  }
];