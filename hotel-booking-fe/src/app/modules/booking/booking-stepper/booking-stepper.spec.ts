import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStepper } from './booking-stepper';

describe('BookingStepper', () => {
  let component: BookingStepper;
  let fixture: ComponentFixture<BookingStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingStepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
