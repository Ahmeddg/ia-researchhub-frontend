import { Domain } from './domain';
import { Researcher } from './researcher';

export interface Publication {
    id?: number;
    title: string;
    abstractText: string;
    publicationDate: string;
    pdfUrl: string;
    doi: string;
    domain?: Domain;
    researchers?: Researcher[];
}
