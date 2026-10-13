import './../../testing-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq';
import { FAQ_DATA } from './faq.data';

function commands(fixture: ComponentFixture<FaqComponent>): HTMLButtonElement[] {
  const root = fixture.nativeElement as HTMLElement;
  return Array.from(root.querySelectorAll<HTMLButtonElement>('button[id]')).filter((b) =>
    (b.id ?? '').startsWith('faq-q-'),
  );
}

describe('FaqComponent', () => {
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Destrói para limpar os timers de datilografia pendentes.
    fixture.destroy();
  });

  it('renderiza um comando (pergunta) por item da FAQ', () => {
    expect(commands(fixture).length).toBe(FAQ_DATA.length);
  });

  it('exibe todos os comandos CLI esperados', () => {
    const text = fixture.nativeElement.textContent;
    for (const item of FAQ_DATA) {
      expect(text).toContain(`./m4gns ${item.command}`);
    }
  });

  it('abre a primeira pergunta por padrão com a resposta completa', () => {
    const first = commands(fixture)[0];
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain(FAQ_DATA[0].answer);
  });

  it('alterna a resposta ao clicar no comando', () => {
    const first = commands(fixture)[0];

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('false');

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('true');
  });

  it('mantém todas as respostas no DOM (AEO: crawlers leem o HTML cru)', () => {
    const text = fixture.nativeElement.textContent;
    for (const item of FAQ_DATA) {
      expect(text).toContain(item.answer);
    }
  });

  it('o comando --help abre o manual com todos os flags + dicas', () => {
    const root = fixture.nativeElement as HTMLElement;
    const helpButton = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => (b.textContent ?? '').includes('--help'),
    )!;
    expect(helpButton).toBeDefined();

    expect(helpButton.getAttribute('aria-expanded')).toBe('false');
    helpButton.click();
    fixture.detectChanges();

    expect(helpButton.getAttribute('aria-expanded')).toBe('true');
    const region = document.getElementById('faq-help');
    expect(region?.classList.contains('hidden')).toBe(false);

    const text = fixture.nativeElement.textContent;
    for (const item of FAQ_DATA) {
      expect(text).toContain(item.command);
      expect(text).toContain(item.hint);
    }
  });
});