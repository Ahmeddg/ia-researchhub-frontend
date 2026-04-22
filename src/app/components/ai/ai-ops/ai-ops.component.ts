import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationService } from '../../../services/publication.service';
import { ClosePair, ClusterInfo, HealthResponse, ReclusterResponse } from '../../../models/classification';

@Component({
  selector: 'app-ai-ops',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-ops.component.html',
  styleUrl: './ai-ops.component.css'
})
export class AiOpsComponent implements OnInit {
  private publicationService = inject(PublicationService);

  health: HealthResponse | null = null;
  clusters: ClusterInfo[] = [];
  closePairs: ClosePair[] = [];
  reclusterResult: ReclusterResponse | null = null;

  loading = true;
  error = '';
  reclustering = false;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';

    this.publicationService.getAiHealth().subscribe({
      next: (health) => {
        this.health = health;
        this.loadClustersAndPairs();
      },
      error: () => {
        this.loading = false;
        this.error = 'AI service is currently unavailable.';
      }
    });
  }

  triggerRecluster(): void {
    this.reclustering = true;
    this.publicationService.triggerRecluster().subscribe({
      next: (result) => {
        this.reclusterResult = result;
        this.reclustering = false;
        this.refresh();
      },
      error: () => {
        this.reclustering = false;
        this.error = 'Failed to trigger re-clustering.';
      }
    });
  }

  private loadClustersAndPairs(): void {
    this.publicationService.getAiClusters().subscribe({
      next: (clusters) => {
        this.clusters = clusters;
        this.publicationService.getClosePairs(0.75).subscribe({
          next: (pairs) => {
            this.closePairs = pairs;
            this.loading = false;
          },
          error: () => {
            this.closePairs = [];
            this.loading = false;
          }
        });
      },
      error: () => {
        this.clusters = [];
        this.loading = false;
      }
    });
  }
}
