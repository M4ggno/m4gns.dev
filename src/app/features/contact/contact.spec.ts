import './../../testing-setup';
import { TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact';
import { SITE } from '@core/site.config';

describe('ContactComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ContactComponent] }).compileComponents();
  });

  it('expõe o canal primário de conversão (mailto)', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('a[href^="mailto:"]');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toContain(SITE.email.address);
    expect(anchor.textContent).toContain(SITE.email.address);
  });

  it('expõe o canal secundário de conversão (Instagram)', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector(`a[href="${SITE.social.instagram.url}"]`);
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toContain('noopener');
  });
});