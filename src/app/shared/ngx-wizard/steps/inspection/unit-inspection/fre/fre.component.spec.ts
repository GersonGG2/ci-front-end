import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreComponent } from './fre.component';

describe('FreComponent', () => {
  let component: FreComponent;
  let fixture: ComponentFixture<FreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
