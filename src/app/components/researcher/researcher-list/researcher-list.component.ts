import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ResearcherService } from '../../../services/researcher.service';
import { Researcher } from '../../../models/researcher';
import { ResearcherFormComponent } from '../researcher-form/researcher-form.component';
import { NotificationService } from '../../../services/notification.service';
import { JoinUsModalComponent } from '../../shared/join-us-modal/join-us-modal.component';

@Component({
  selector: 'app-researcher-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ResearcherFormComponent, JoinUsModalComponent],
  templateUrl: './researcher-list.component.html',
  styleUrl: './researcher-list.component.css'
})
export class ResearcherListComponent implements OnInit {
  private researcherService = inject(ResearcherService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  researchers = signal<Researcher[]>([]);
  selectedResearcher = signal<Researcher | null>(null);
  isEditMode = signal<boolean>(false);
  readonly joinUsImage = 'https://images.unsplash.com/photo-1766297247924-6638d54e7c89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

  userClosedModal = false;

  closeJoinUsModal(): void {
    this.userClosedModal = true;
  }

  canSeeResearchers(): boolean {
    return this.authService.isLoggedIn() || this.userClosedModal;
  }

  ngOnInit(): void {
    this.loadResearchers();
  }

  loadResearchers(): void {
    this.researcherService.getAll().subscribe({
      next: (data) => {
        this.researchers.set(data);
      },
      error: (err) => {
        console.error('Error loading researchers', err);
        if (this.authService.isLoggedIn()) {
          this.notificationService.error('Failed to load researchers');
        }
      }
    });
  }

  openAddResearcherModal(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    if (!this.authService.canManageResearchers()) {
      this.notificationService.error('You do not have permission to add researchers');
      return;
    }

    this.selectedResearcher.set(null);
    this.isEditMode.set(false);
  }

  deleteResearcher(researcher: Researcher): void {
    if (!researcher.id) return;
    
    if (confirm(`Are you sure you want to delete "${researcher.fullName}"?`)) {
      this.researcherService.delete(researcher.id).subscribe({
        next: () => {
          this.notificationService.success(`Researcher "${researcher.fullName}" deleted successfully`);
          this.loadResearchers();
        },
        error: (err) => {
          console.error('Error deleting researcher', err);
          this.notificationService.error('Failed to delete researcher');
        }
      });
    }
  }

  editResearcher(researcher: Researcher): void {
    this.selectedResearcher.set(researcher);
    this.isEditMode.set(true);
  }

  closeEditModal(): void {
    this.selectedResearcher.set(null);
    this.isEditMode.set(false);
  }

  onSaveSuccess(): void {
    this.loadResearchers();
    this.closeEditModal();
    const closeAdd = document.getElementById('closeAddResearcherModal');
    if (closeAdd) closeAdd.click();
    const closeEdit = document.getElementById('closeEditResearcherModal');
    if (closeEdit) closeEdit.click();
    this.notificationService.success('Researcher saved successfully');
  }
}
