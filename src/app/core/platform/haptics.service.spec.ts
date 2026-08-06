import { TestBed } from '@angular/core/testing';
import { HapticsService } from './haptics.service';

describe('HapticsService', () => {
  let service: HapticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HapticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call impactLight without crashing in browser environment', async () => {
    await expectAsync(service.impactLight()).toBeResolved();
  });
});
