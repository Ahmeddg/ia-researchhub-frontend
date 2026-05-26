import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicationService } from '../../../services/publication.service';
import { DomainService } from '../../../services/domain.service';
import { AuthService } from '../../../services/auth.service';
import { Publication } from '../../../models/publication';
import { Domain } from '../../../models/domain';
import { RecommendationResponse } from '../../../models/classification';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './publication-detail.component.html',
  styleUrl: './publication-detail.component.css'
})
export class PublicationDetailComponent implements OnInit {
  publication?: Publication;
  loading = true;
  error = '';
  recommendations: RecommendationResponse[] = [];
  recommendationsLoading = false;
  recommendationsError = '';
  domains: Domain[] = [];
  selectedDomainId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    private domainService: DomainService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDomains();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicationService.getById(Number(id)).subscribe({
        next: (data) => {
          this.publication = data;
          this.selectedDomainId = data.domain?.id ?? null;
          this.loading = false;
          this.loadRecommendations(Number(id));
        },
        error: (err) => {
          this.error = 'Failed to load publication details';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  private loadDomains(): void {
    this.domainService.getAll().subscribe({
      next: (data) => {
        this.domains = data;
      },
      error: (err) => console.error('Error loading domains', err)
    });
  }

  private loadRecommendations(id: number): void {
    this.recommendationsLoading = true;
    this.recommendationsError = '';
    this.publicationService.getRecommendations(id, 'global', 5).subscribe({
      next: (data) => {
        this.recommendations = data;
        this.recommendationsLoading = false;
        console.log('Recommendations loaded:', data);
      },
      error: () => {
        this.recommendations = [];
        this.recommendationsLoading = false;
        this.recommendationsError = 'Recommendations are temporarily unavailable.';
      }
    });
  }

  getAuthors(): string {
    if (!this.publication?.researchers) return 'Unknown Authors';
    return this.publication.researchers.map(r => r.fullName).join(', ');
  }

  getYear(): string {
    if (!this.publication?.publicationDate) return 'N/A';
    return new Date(this.publication.publicationDate).getFullYear().toString();
  }

  upvote(): void {
    if (!this.publication?.id) return;
    this.publicationService.upvote(this.publication.id).subscribe({
      next: (updated) => {
        if (this.publication) {
          this.publication.upvotes = updated.upvotes;
        }
      },
      error: (err) => console.error('Error upvoting', err)
    });
  }

  downvote(): void {
    if (!this.publication?.id) return;
    this.publicationService.downvote(this.publication.id).subscribe({
      next: (updated) => {
        if (this.publication) {
          this.publication.downvotes = updated.downvotes;
        }
      },
      error: (err) => console.error('Error downvoting', err)
    });
  }
}
