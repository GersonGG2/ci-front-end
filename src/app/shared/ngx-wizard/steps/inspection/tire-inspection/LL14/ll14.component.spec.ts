import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL14Component } from './ll14.component';

describe('LL14Component', () => {
  let component: LL14Component;
  let fixture: ComponentFixture<LL14Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL14Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL14Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
