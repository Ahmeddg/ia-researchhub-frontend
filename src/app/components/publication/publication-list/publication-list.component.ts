import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationService } from '../../../services/publication.service';
import { Publication } from '../../../models/publication';
import { PublicationFormComponent } from '../publication-form/publication-form.component';

@Component({
  selector: 'app-publication-list',
  standalone: true,
  imports: [CommonModule, PublicationFormComponent],
  templateUrl: './publication-list.component.html',
  styles: ``
})
export class PublicationListComponent implements OnInit {
  publications: Publication[] = [];
  constructor(private publicationService: PublicationService) { }

  ngOnInit(): void { this.loadPublications(); }

  loadPublications(): void {
    this.publicationService.getAll().subscribe(data => this.publications = data);
  }

  onSaveSuccess(): void {
    this.loadPublications();
    const closeBtn = document.getElementById('closeAddPublicationModal');
    if (closeBtn) closeBtn.click();
  }
}
