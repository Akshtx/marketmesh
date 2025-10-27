import { TestBed } from '@angular/core/testing';

import { Promo } from './promo';

describe('Promo', () => {
  let service: Promo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Promo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
