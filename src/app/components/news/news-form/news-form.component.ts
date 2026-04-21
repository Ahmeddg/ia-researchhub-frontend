import { Component, Output, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../../services/news.service';
import { NotificationService } from '../../../services/notification.service';
import { News } from '../../../models/news';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.css'
})
export class NewsFormComponent implements OnInit, OnChanges {
  private newsService = inject(NewsService);
  private notificationService = inject(NotificationService);

  @Input() editingNews: News | null = null;
  @Output() saveSuccess = new EventEmitter<void>();

  news: News = {
    title: '',
    content: '',
    category: '',
    excerpt: '',
    imageUrl: '',
    readTime: undefined,
    featured: false,
    tags: '',
    author: '',
    publishedAt: ''
  };

  isEditMode = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingNews'] && !changes['editingNews'].firstChange) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.editingNews && this.editingNews.id) {
      this.isEditMode = true;
      this.news = { ...this.editingNews };
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  onSubmit() {
    // In creation mode, require title and content
    if (!this.isEditMode && (!this.news.title || !this.news.content)) {
      this.notificationService.error('Title and content are required');
      return;
    }

    // In edit mode, require at least title OR content
    if (this.isEditMode && !this.news.title && !this.news.content) {
      this.notificationService.error('Please update at least the title or content');
      return;
    }

    // Prepare request data
    const requestData = {
      title: this.news.title || undefined,
      content: this.news.content || undefined,
      category: this.news.category || undefined,
      excerpt: this.news.excerpt || undefined,
      imageUrl: this.news.imageUrl || undefined,
      readTime: this.news.readTime || undefined,
      featured: this.news.featured || false,
      tags: this.news.tags || undefined,
      author: this.news.author || undefined,
      publishedAt: this.news.publishedAt || undefined
    };

    if (this.isEditMode && this.news.id) {
      // Update existing article - solo enviar campos no vacíos
      const updateData = Object.fromEntries(
        Object.entries(requestData).filter(([_, v]) => v !== undefined && v !== '')
      );
      
      this.newsService.update(this.news.id, updateData as any).subscribe({
        next: () => {
          this.notificationService.success('Article updated successfully');
          this.saveSuccess.emit();
          this.resetForm();
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Error updating news', err);
          this.notificationService.error('Failed to update article. You must be an admin or moderator.');
        }
      });
    } else {
      // Create new article
      this.newsService.create(requestData as any).subscribe({
        next: () => {
          this.notificationService.success('Article created successfully');
          this.saveSuccess.emit();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating news', err);
          this.notificationService.error('Failed to create article');
        }
      });
    }
  }

  private resetForm() {
    this.news = {
      title: '',
      content: '',
      category: '',
      excerpt: '',
      imageUrl: '',
      readTime: undefined,
      featured: false,
      tags: '',
      author: '',
      publishedAt: ''
    };
    this.isEditMode = false;
    this.editingNews = null;
  }

  private closeEditModal(): void {
    // Close modal using Bootstrap
    const modalElement = document.getElementById('editNewsModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
