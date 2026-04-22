import { Domain } from './domain';
import { Researcher } from './researcher';
import { User } from './user';

export interface Project {
    id?: number;
    title: string;
    description: string;
    aiCategory: string;
    domain?: Domain;
    researchers?: Researcher[];
    createdBy?: User;
}
