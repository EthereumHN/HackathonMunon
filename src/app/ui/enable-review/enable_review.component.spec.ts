import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableReviewComponent } from './enable_review.component';

describe('EnableReviewComponent', () => {
  let component: EnableReviewComponent;
  let fixture: ComponentFixture<EnableReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnableReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
