import { Role } from './role';

export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
    enabled: boolean;
    roles?: Role[];
}
