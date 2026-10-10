import './../../testing-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StackComponent } from './stack';
import { STACK_DATA } from './stack.data';

describe('StackComponent', () => {
  let fixture: ComponentFixture<StackComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StackComponent);
    fixture.detectChanges();
  });

  it('renderiza todos os itens do stack como linhas do acordeão', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(STACK_DATA.length);
  });

  it('expandir e recolher um item alterna o estado do acordeão', () => {
    const first = fixture.nativeElement.querySelectorAll('button')[0];
    const component = fixture.componentInstance;

    first.click();
    fixture.detectChanges();
    expect(component.expandedIndex()).toBe(0);

    first.click();
    fixture.detectChanges();
    expect(component.expandedIndex()).toBeNull();
  });
});