import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TolComponent } from './tol.component';

describe('TolComponent', () => {
  let component: TolComponent;
  let fixture: ComponentFixture<TolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
