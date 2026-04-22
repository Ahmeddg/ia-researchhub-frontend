import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewsService } from '../../../services/news.service';
import { News } from '../../../models/news';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css'
})
export class NewsDetailComponent implements OnInit {
  article: News | null = null;
  relatedArticles: News[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadArticle(Number(id));
      }
    });
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    this.error = null;
    this.newsService.getById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.isLoading = false;
        this.loadRelated(data);
        window.scrollTo(0, 0);
      },
      error: (err) => {
        console.error('Error loading article', err);
        this.error = "Article not found or server error.";
        this.isLoading = false;
      }
    });
  }

  loadRelated(current: News): void {
    this.newsService.getAll().subscribe(data => {
      // Filter by category, exclude current, limit to 3
      this.relatedArticles = data
        .filter(n => n.id !== current.id && n.category === current.category)
        .slice(0, 3);
        
      // If not enough related, add some others
      if (this.relatedArticles.length < 3) {
        const others = data
          .filter(n => n.id !== current.id && n.category !== current.category)
          .slice(0, 3 - this.relatedArticles.length);
        this.relatedArticles = [...this.relatedArticles, ...others];
      }
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'SR';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/news']);
  }
}
