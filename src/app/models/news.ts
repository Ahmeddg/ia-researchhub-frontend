import { User } from './user';

export interface News {
    id?: number;
    title: string;
    content: string;
    createdAt?: string;
    user?: User;
}
