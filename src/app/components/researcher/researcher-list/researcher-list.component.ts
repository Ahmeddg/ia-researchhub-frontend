import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearcherService } from '../../../services/researcher.service';
import { Researcher } from '../../../models/researcher';
import { ResearcherFormComponent } from '../researcher-form/researcher-form.component';

@Component({
  selector: 'app-researcher-list',
  standalone: true,
  imports: [CommonModule, ResearcherFormComponent],
  templateUrl: './researcher-list.component.html',
  styles: ``
})
export class ResearcherListComponent implements OnInit {
  researchers: Researcher[] = [];
  constructor(private researcherService: ResearcherService) { }

  ngOnInit(): void { this.loadResearchers(); }

  loadResearchers(): void {
    this.researcherService.getAll().subscribe(data => this.researchers = data);
  }

  onSaveSuccess(): void {
    this.loadResearchers();
    const closeBtn = document.getElementById('closeAddResearcherModal');
    if (closeBtn) closeBtn.click();
  }
}
