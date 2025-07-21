import { TestBed } from '@angular/core/testing';

import { AcademiasService } from './academias.service';

describe('AcademiasService', () => {
  let service: AcademiasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcademiasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
