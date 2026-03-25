import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../../services/publication.service';
import { Publication } from '../../../models/publication';

@Component({
  selector: 'app-publication-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-form.component.html',
  styleUrl: './publication-form.component.css'
})
export class PublicationFormComponent {
  publication: Publication = { title: '', abstractText: '', publicationDate: '', pdfUrl: '', doi: '' };

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(private publicationService: PublicationService) { }

  onSubmit() {
    this.publicationService.create(this.publication).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.publication = { title: '', abstractText: '', publicationDate: '', pdfUrl: '', doi: '' };
      },
      error: (err) => console.error('Error creating publication', err)
    });
  }
}
