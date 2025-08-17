import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCursoComponent } from './ver-curso.component';

describe('VerCursoComponent', () => {
  let component: VerCursoComponent;
  let fixture: ComponentFixture<VerCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerCursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerCursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
