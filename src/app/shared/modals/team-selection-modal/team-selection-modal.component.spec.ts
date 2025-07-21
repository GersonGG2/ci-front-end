import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSelectionModalComponent } from './team-selection-modal.component';

describe('TeamSelectionModalComponent', () => {
  let component: TeamSelectionModalComponent;
  let fixture: ComponentFixture<TeamSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSelectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
