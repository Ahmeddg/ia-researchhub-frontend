import { TestBed } from '@angular/core/testing';

import { ResearcherService } from './researcher.service';

describe('ResearcherService', () => {
  let service: ResearcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResearcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
