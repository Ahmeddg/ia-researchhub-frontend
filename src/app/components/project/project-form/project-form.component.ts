import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { ResearcherService } from '../../../services/researcher.service';
import { DomainService } from '../../../services/domain.service';
import { Project } from '../../../models/project';
import { Researcher } from '../../../models/researcher';
import { Domain } from '../../../models/domain';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent implements OnInit {
  private projectService = inject(ProjectService);
  private researcherService = inject(ResearcherService);
  private domainService = inject(DomainService);

  project: Project = { title: '', description: '', aiCategory: '', domain: undefined };
  allResearchers = signal<Researcher[]>([]);
  allDomains = signal<Domain[]>([]);
  filteredResearchers = signal<Researcher[]>([]);
  selectedResearchers = signal<Researcher[]>([]);
  searchQuery: string = '';
  selectedDomainId: number | undefined;

  @Output() saveSuccess = new EventEmitter<void>();

  ngOnInit(): void {
    this.researcherService.getAll().subscribe(data => {
      this.allResearchers.set(data);
    });

    this.domainService.getAll().subscribe(data => {
      this.allDomains.set(data);
    });
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredResearchers.set([]);
      return;
    }

    const filtered = this.allResearchers().filter(r => 
      (r.fullName?.toLowerCase().includes(query) || 
       r.affiliation?.toLowerCase().includes(query)) &&
      !this.selectedResearchers().some(selected => selected.id === r.id)
    );
    this.filteredResearchers.set(filtered);
  }

  addResearcher(researcher: Researcher): void {
    this.selectedResearchers.set([...this.selectedResearchers(), researcher]);
    this.searchQuery = '';
    this.filteredResearchers.set([]);
  }

  removeResearcher(id: number): void {
    this.selectedResearchers.set(this.selectedResearchers().filter(r => r.id !== id));
  }

  onSubmit() {
    if (!this.selectedDomainId) {
      console.error('Domain is required');
      return;
    }

    // Prepare request with only IDs (matching backend CreateProjectRequest DTO)
    const requestData = {
      title: this.project.title,
      description: this.project.description,
      aiCategory: this.project.aiCategory,
      domainId: this.selectedDomainId,
      researcherIds: this.selectedResearchers().map(r => r.id).filter(id => id !== undefined)
    };

    this.projectService.create(requestData as any).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating project:', err);
        if (err.error?.message) {
          console.error('Backend message:', err.error.message);
        }
      }
    });
  }

  private resetForm() {
    this.project = { title: '', description: '', aiCategory: '', domain: undefined };
    this.selectedResearchers.set([]);
    this.searchQuery = '';
    this.filteredResearchers.set([]);
    this.selectedDomainId = undefined;
  }
}
