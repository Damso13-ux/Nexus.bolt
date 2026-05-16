export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_premium: boolean;
  subscription_plan: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  avatar_url: string | null;
  bio: string;
  preferred_categories: string[];
  dark_mode: boolean;
  author_slug: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string;
  category_id: string;
  author_id: string;
  is_premium: boolean;
  is_published: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  read_time: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Profile;
  tags?: Tag[];
  view_count?: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article?: Article;
}

export interface Newsletter {
  id: string;
  subject: string;
  body: string;
  is_premium: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  read_at: string;
  progress: number;
  article?: Article;
}

export const CATEGORIES_META: Record<string, { icon: string; color: string }> = {
  'finance-marches': { icon: 'TrendingUp', color: '#0ea5e9' },
  'crypto-web3': { icon: 'Bitcoin', color: '#f59e0b' },
  'intelligence-artificielle': { icon: 'Brain', color: '#10b981' },
  'cybersecurite': { icon: 'Shield', color: '#c8102e' },
};
