import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomainService } from '../../../services/domain.service';
import { Domain } from '../../../models/domain';

@Component({
  selector: 'app-domain-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domain-form.component.html',
  styleUrl: './domain-form.component.css'
})
export class DomainFormComponent {
  domain: Domain = { name: '', description: '' };

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(private domainService: DomainService) { }

  onSubmit() {
    this.domainService.create(this.domain).subscribe({
      next: () => {
        this.saveSuccess.emit();
        this.domain = { name: '', description: '' }; // reset form
      },
      error: (err) => console.error('Error creating domain', err)
    });
  }
}
