import { Domain } from './domain';

export interface Project {
    id?: number;
    title: string;
    description: string;
    aiCategory: string;
    domain?: Domain;
}
