import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../../services/news.service';
import { News } from '../../../models/news';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.css'
})
export class NewsFormComponent {
  news: News = { title: '', content: '' };

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(private newsService: NewsService) { }

  onSubmit() {
    this.newsService.create(this.news).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.news = { title: '', content: '' };
      },
      error: (err) => console.error('Error creating news', err)
    });
  }
}
