import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainService } from '../../../services/domain.service';
import { Domain } from '../../../models/domain';
import { DomainFormComponent } from '../domain-form/domain-form.component';

@Component({
  selector: 'app-domain-list',
  standalone: true,
  imports: [CommonModule, DomainFormComponent],
  templateUrl: './domain-list.component.html',
  styles: ``
})
export class DomainListComponent implements OnInit {
  domains: Domain[] = [];
  constructor(private domainService: DomainService) { }

  ngOnInit(): void { this.loadDomains(); }

  loadDomains(): void {
    this.domainService.getAll().subscribe(data => this.domains = data);
  }

  onSaveSuccess(): void {
    this.loadDomains();
    const closeBtn = document.getElementById('closeAddDomainModal');
    if (closeBtn) {
      closeBtn.click();
    }
  }
}
