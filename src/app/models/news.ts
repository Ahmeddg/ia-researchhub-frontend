import { User } from './user';

export interface News {
    id?: number;
    title: string;
    content: string;
    category?: string;
    excerpt?: string;
    imageUrl?: string;
    readTime?: number;
    featured?: boolean;
    tags?: string;
    author?: string;
    publishedAt?: string;
    createdAt?: string;
    user?: User;
}
