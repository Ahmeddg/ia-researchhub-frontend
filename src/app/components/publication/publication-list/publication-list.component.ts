import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PublicationService } from '../../../services/publication.service';
import { DomainService } from '../../../services/domain.service';
import { Publication } from '../../../models/publication';
import { Domain } from '../../../models/domain';
import { PublicationFormComponent } from '../publication-form/publication-form.component';
import { JoinUsModalComponent } from '../../shared/join-us-modal/join-us-modal.component';

@Component({
  selector: 'app-publication-list',
  standalone: true,
  imports: [CommonModule, PublicationFormComponent, RouterLink, JoinUsModalComponent],
  templateUrl: './publication-list.component.html',
  styleUrl: './publication-list.component.css'
})
export class PublicationListComponent implements OnInit {
  publications: Publication[] = [];
  domains: Domain[] = [];
  activeSort: string = 'recommended';
  selectedDomainId: number | null = null;
  showJoinUsModal = false;

  constructor(
    private publicationService: PublicationService,
    private domainService: DomainService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPublications();
    this.loadDomains();
  }

  loadPublications(): void {
    this.publications = []; // Clear list before loading new results to avoid "confused" UI
    
    if (this.selectedDomainId) {
      this.publicationService.findByDomainId(this.selectedDomainId).subscribe({
        next: (data) => this.publications = data,
        error: (err) => console.error('Error loading by domain', err)
      });
    } else {
      switch (this.activeSort) {
        case 'recommended':
          if (this.authService.isLoggedIn()) {
            this.publicationService.getPersonalized().subscribe({
              next: (data) => this.publications = data,
              error: (err) => {
                console.error('Personalized feed failed', err);
                // Fallback to all publications on error
                this.publicationService.getAll().subscribe({
                  next: (all) => this.publications = all,
                  error: () => this.publications = []
                });
              }
            });
          } else {
            // Not logged in — show all publications as default
            this.publicationService.getAll().subscribe({
              next: (data) => this.publications = data,
              error: (err) => console.error('Default feed failed', err)
            });
          }
          break;
        case 'new':
          this.publicationService.getNew().subscribe({
            next: (data) => this.publications = data,
            error: (err) => console.error('New feed failed', err)
          });
          break;
        case 'top':
          this.publicationService.getTop().subscribe({
            next: (data) => this.publications = data,
            error: (err) => console.error('Top feed failed', err)
          });
          break;
        case 'hot':
          this.publicationService.getHot().subscribe({
            next: (data) => this.publications = data,
            error: (err) => console.error('Hot feed failed', err)
          });
          break;
        default:
          this.publicationService.getAll().subscribe({
            next: (data) => this.publications = data,
            error: (err) => console.error('Default feed failed', err)
          });
      }
    }
  }

  loadDomains(): void {
    this.domainService.getAll().subscribe((data: Domain[]) => this.domains = data);
  }

  selectDomain(id: number | null): void {
    this.selectedDomainId = id;
    this.loadPublications();
  }

  setSort(sort: string): void {
    this.activeSort = sort;
    this.selectedDomainId = null; // Clear domain filter when switching global feeds
    this.loadPublications();
  }

  getAuthors(pub: Publication): string {
    if (!pub.researchers) return 'Unknown Authors';
    return pub.researchers.map(r => r.fullName).join(', ');
  }

  getYear(pub: Publication): string {
    if (!pub.publicationDate) return 'N/A';
    return new Date(pub.publicationDate).getFullYear().toString();
  }

  onSaveSuccess(): void {
    this.loadPublications();
    const closeBtn = document.getElementById('closeAddPublicationModal');
    if (closeBtn) closeBtn.click();
  }

  closeJoinUsModal(): void {
    this.showJoinUsModal = false;
  }

  upvote(id: number): void {
    if (!this.authService.isLoggedIn()) {
      this.showJoinUsModal = true;
      return;
    }
    this.publicationService.upvote(id).subscribe({
      next: (updated) => {
        const index = this.publications.findIndex(p => p.id === id);
        if (index !== -1) {
          this.publications[index].upvotes = updated.upvotes;
          this.publications[index].downvotes = updated.downvotes;
          if (this.publications[index].upvotedByUser) {
             this.publications[index].upvotedByUser = false;
          } else {
             this.publications[index].upvotedByUser = true;
          }
        }
      },
      error: (err) => alert('Erreur lors du vote. Êtes-vous connecté ?')
    });
  }

  downvote(id: number): void {
    if (!this.authService.isLoggedIn()) {
      this.showJoinUsModal = true;
      return;
    }
    this.publicationService.downvote(id).subscribe({
      next: (updated) => {
        const index = this.publications.findIndex(p => p.id === id);
        if (index !== -1) {
           this.publications[index].upvotes = updated.upvotes;
           this.publications[index].downvotes = updated.downvotes;
           this.publications[index].upvotedByUser = false; 
        }
      },
      error: (err) => alert('Erreur lors du vote. Êtes-vous connecté ?')
    });
  }
}
