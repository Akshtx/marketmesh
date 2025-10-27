import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartModal } from './cart-modal';

describe('CartModal', () => {
  let component: CartModal;
  let fixture: ComponentFixture<CartModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
