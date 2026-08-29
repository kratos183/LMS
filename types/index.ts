export type UserRole = 'student' | 'instructor' | 'admin';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  role?: UserRole;
  avatar_url?: string;
  status?: string;
  created_at?: string;
}

export interface UserSummary {
  id: string;
  email?: string;
  username?: string;
  role: UserRole;
  createdAt?: string;
  lastSignIn?: string;
}

export interface Lesson {
  id: string | number;
  course_id: string | number;
  title: string;
  description?: string;
  video_url?: string;
  duration?: string;
  sort_order?: number;
  is_free?: boolean;
  created_at?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Review {
  id?: string | number;
  user: string;
  rating?: number;
  date?: string;
  text: string;
}

export interface CurriculumSection {
  id?: string;
  title: string;
  count?: string;
  time?: string;
  lessons?: {
    title: string;
    duration?: string;
    preview?: boolean;
    locked?: boolean;
  }[];
}

export interface Course {
  id: string | number;
  title: string;
  description?: string;
  overview?: string;
  category?: string;
  price?: number | string;
  original_price?: number | string | null;
  originalPrice?: number | string | null;
  level?: string;
  instructor?: string;
  instructor_name?: string;
  instructor_title?: string;
  instructor_bio?: string;
  instructor_image?: string;
  image?: string;
  thumbnail_url?: string;
  status?: 'published' | 'draft' | string;
  what_you_learn?: string[];
  requirements?: string[];
  rating?: number;
  students?: number | string;
  lessons?: Lesson[] | number | string;
  curriculum?: CurriculumSection[];
  faqs?: FaqItem[];
  reviews?: Review[];
  featured?: boolean;
  duration?: string;
  created_at?: string;
}

export interface BlogCommentReply {
  id: string | number;
  user: string;
  avatar: string;
  date: string;
  text: string;
}

export interface BlogComment {
  id: string | number;
  user: string;
  avatar: string;
  date: string;
  text: string;
  replies?: BlogCommentReply[];
}

export interface BlogContentBlock {
  type?: 'heading' | 'paragraph' | string;
  text?: string;
  content?: (BlogContentBlock | string)[];
}

export interface BlogPost {
  id: string | number;
  title: string;
  author: string;
  category?: string;
  excerpt?: string;
  image: string;
  featuredImage?: string;
  date: string;
  content?: string[] | BlogContentBlock[] | string;
  tags?: string[];
  comments?: BlogComment[];
  comments_count?: number;
  commentsCount?: number;
  created_at?: string;
  featured?: boolean;
}
