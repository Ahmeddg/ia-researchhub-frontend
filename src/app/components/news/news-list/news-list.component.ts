import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';
import { News } from '../../../models/news';
import { NewsFormComponent } from '../news-form/news-form.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, NewsFormComponent],
  templateUrl: './news-list.component.html',
  styles: ``
})
export class NewsListComponent implements OnInit {
  newsList: News[] = [];
  constructor(private newsService: NewsService) { }

  ngOnInit(): void { this.loadNews(); }

  loadNews(): void {
    this.newsService.getAll().subscribe(data => this.newsList = data);
  }

  onSaveSuccess(): void {
    this.loadNews();
    const closeBtn = document.getElementById('closeAddNewsModal');
    if (closeBtn) closeBtn.click();
  }
}
