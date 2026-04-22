import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsService } from '../../../services/news.service';
import { News } from '../../../models/news';
import { NewsFormComponent } from '../news-form/news-form.component';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsFormComponent, RouterLink],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent implements OnInit, OnDestroy {
  private newsService = inject(NewsService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  newsList = signal<News[]>([]);
  featuredArticles = signal<News[]>([]);
  currentFeaturedIndex = signal<number>(0);
  filteredNews = signal<News[]>([]);
  activeCategory = signal<string>('All');
  categories: string[] = ['All', 'Research', 'Technology', 'Policy', 'Events', 'Funding'];
  selectedNews = signal<News | null>(null);
  isEditMode = signal<boolean>(false);
  showAddForm = signal<boolean>(false);

  // Signals pour gérer la direction et l'état de la transition
  slideDirection = signal<'right' | 'left'>('right');
  isTransitioning = signal<boolean>(false);

  private autoRotationInterval: any = null;
  private readonly AUTO_ROTATION_INTERVAL = 10000; // 10 secondes

  constructor() {
    effect(() => {
      if (this.featuredArticles().length > 1) {
        this.startAutoRotation();
      } else {
        this.stopAutoRotation();
      }
    });
  }

  ngOnInit(): void {
    this.loadNews();
  }

  ngOnDestroy(): void {
    this.stopAutoRotation();
  }

  loadNews(): void {
    this.newsService.getAll().subscribe({
      next: (data) => {
        const sorted = data.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        this.newsList.set(sorted);
        const featured = sorted.filter(n => n.featured);
        this.featuredArticles.set(featured);
        this.currentFeaturedIndex.set(0);
        this.filterNews();
      },
      error: (err) => {
        console.error('Error loading news', err);
        this.notificationService.error('Failed to load news articles');
      }
    });
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
    this.filterNews();
  }

  filterNews(): void {
    const featuredIds = this.featuredArticles().map(n => n.id);
    let rest = this.newsList().filter(n => !featuredIds.includes(n.id));
    if (this.activeCategory() === 'All') {
      this.filteredNews.set(rest);
    } else {
      this.filteredNews.set(rest.filter(n => n.category === this.activeCategory()));
    }
  }

  private startAutoRotation(): void {
    this.stopAutoRotation();
    this.autoRotationInterval = setInterval(() => {
      this.nextFeatured();
    }, this.AUTO_ROTATION_INTERVAL);
  }

  private stopAutoRotation(): void {
    if (this.autoRotationInterval) {
      clearInterval(this.autoRotationInterval);
      this.autoRotationInterval = null;
    }
  }

  private restartAutoRotation(): void {
    this.startAutoRotation();
  }

  /**
   * Déclenche la transition animée puis met à jour l'index.
   * On force un reset (false → true) pour relancer l'animation CSS même
   * si la direction ne change pas.
   */
  private triggerTransition(updateIndex: () => void): void {
    this.isTransitioning.set(false);
    // Micro-délai pour laisser Angular retirer la classe CSS avant de la remettre
    setTimeout(() => {
      updateIndex();
      this.isTransitioning.set(true);
      // On retire la classe après la durée de l'animation (500ms)
      setTimeout(() => this.isTransitioning.set(false), 500);
    }, 10);
  }

  nextFeatured(): void {
    const featured = this.featuredArticles();
    if (featured.length === 0) return;
    this.slideDirection.set('right');
    this.triggerTransition(() => {
      const nextIndex = (this.currentFeaturedIndex() + 1) % featured.length;
      this.currentFeaturedIndex.set(nextIndex);
    });
    this.restartAutoRotation();
  }

  previousFeatured(): void {
    const featured = this.featuredArticles();
    if (featured.length === 0) return;
    this.slideDirection.set('left');
    this.triggerTransition(() => {
      const prevIndex = (this.currentFeaturedIndex() - 1 + featured.length) % featured.length;
      this.currentFeaturedIndex.set(prevIndex);
    });
    this.restartAutoRotation();
  }

  goToFeatured(index: number): void {
    const current = this.currentFeaturedIndex();
    if (index === current) return;
    this.slideDirection.set(index > current ? 'right' : 'left');
    this.triggerTransition(() => this.currentFeaturedIndex.set(index));
    this.restartAutoRotation();
  }

  getCurrentFeatured(): News | undefined {
    const featured = this.featuredArticles();
    if (featured.length === 0) return undefined;
    return featured[this.currentFeaturedIndex()];
  }

  deleteNews(news: News): void {
    if (!news.id) return;
    if (confirm(`Are you sure you want to delete "${news.title}"?`)) {
      this.newsService.delete(news.id).subscribe({
        next: () => {
          this.notificationService.success(`Article "${news.title}" deleted successfully`);
          this.loadNews();
        },
        error: (err) => {
          console.error('Error deleting news', err);
          this.notificationService.error('Failed to delete article. You must be an admin or moderator.');
        }
      });
    }
  }

  editNews(news: News): void {
    this.selectedNews.set(news);
    this.isEditMode.set(true);
  }

  closeEditModal(): void {
    this.selectedNews.set(null);
    this.isEditMode.set(false);
  }

  openAddModal(): void {
    this.showAddForm.set(true);
  }

  closeAddModal(): void {
    this.showAddForm.set(false);
  }

  getTagsArray(tags?: string): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim());
  }

  getArticleCount(cat: string): number {
    const featuredIds = this.featuredArticles().map(n => n.id);
    if (cat === 'All') return this.newsList().length - this.featuredArticles().length;
    return this.newsList().filter(n => n.category === cat && !featuredIds.includes(n.id)).length;
  }

  onSaveSuccess(): void {
    this.loadNews();
    this.closeEditModal();
    this.closeAddModal();
    const closeBtn = document.getElementById('closeAddNewsModal');
    if (closeBtn) closeBtn.click();
    this.notificationService.success('News article saved successfully');
  }
}