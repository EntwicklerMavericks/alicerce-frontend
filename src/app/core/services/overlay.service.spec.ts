import { TestBed } from '@angular/core/testing';
import { OverlayService } from './overlay.service';
import { Component } from '@angular/core';

@Component({
  template: `<div>Dummy Component</div>`,
  standalone: true,
})
class DummyComponent {}

describe('OverlayService', () => {
  let service: OverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayService);
  });

  it('should open bottom sheet and return result via Observable', (done) => {
    const expectedResult = { saved: true };

    service.openBottomSheet({
      component: DummyComponent,
      data: { category: 'Casa' },
    }).subscribe((result) => {
      expect(result).toEqual(expectedResult);
      done();
    });

    expect(service.activeOverlay()).not.toBeNull();
    service.close(expectedResult);
    expect(service.activeOverlay()).toBeNull();
  });
});
