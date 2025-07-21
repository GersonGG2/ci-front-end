import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchSelectionModalComponent } from './branch-selection-modal.component';

describe('BranchSelectionModalComponent', () => {
  let component: BranchSelectionModalComponent;
  let fixture: ComponentFixture<BranchSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchSelectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
