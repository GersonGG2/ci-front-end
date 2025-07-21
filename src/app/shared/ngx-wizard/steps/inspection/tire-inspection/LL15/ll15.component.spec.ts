import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL15Component } from './ll15.component';

describe('LL15Component', () => {
  let component: LL15Component;
  let fixture: ComponentFixture<LL15Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL15Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL15Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
