// User Roles
export type UserRole = 'CONTRACTOR' | 'SUBCONTRACTOR' | 'ADMIN';

// Verification Tiers (Section 4 of PDF)
export enum VerificationTier {
  TIER_1_COMPANY = 'TIER_1_COMPANY', // Gold - Onaylı Firma
  TIER_2_INDIVIDUAL = 'TIER_2_INDIVIDUAL', // Silver - Onaylı Usta
  TIER_3_COMMUNITY = 'TIER_3_COMMUNITY', // Bronze - Topluluk Onaylı
  UNVERIFIED = 'UNVERIFIED'
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tier: VerificationTier;
  location: string;
  avatarUrl?: string;
  rating: number; // 0-5
  email: string;
  phone: string;
  about?: string;
  services?: string[];
  completedJobs?: number;
  yearsOfExperience?: number;
  portfolioImages?: string[];
  reviews?: Review[];
}

// Job Categories
export enum CategoryType {
  STRUCTURAL = 'Kaba İnşaat',
  FINISHING = 'İnce İşler',
  MECHANICAL = 'Mekanik Tesisat',
  ELECTRICAL = 'Elektrik Tesisat',
  EXTERIOR = 'Dış Cephe & Yalıtım',
  OTHER = 'Diğer'
}

export interface Bid {
  id: string;
  jobId: string;
  subcontractorId: string;
  subcontractorName: string;
  subcontractorTier: VerificationTier;
  amount: number;
  materialsIncluded: boolean;
  estimatedDuration: string; 
  proposalText: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  isSealed: boolean; // For blind tender logic
}

export interface Job {
  id: string;
  contractorId: string;
  title: string;
  description: string;
  category: CategoryType;
  subCategory: string; 
  location: string; 
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'PENDING_APPROVAL';
  bids: Bid[];
  createdAt: string;
  deadline: string;
  viewCount: number;
  files?: string[];
  imageUrls?: string[]; // New: Images support
}

// Messaging System
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'audio';
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  jobId?: string;
  jobTitle?: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Notification System
export interface Notification {
  id: string;
  type: 'BID_RECEIVED' | 'JOB_MATCH' | 'MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string; // e.g., "job:j1"
}