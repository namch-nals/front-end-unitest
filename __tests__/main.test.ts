import { vi } from 'vitest';

import { setupCounter } from '../src/counter';

vi.mock('../src/counter', () => ({
  setupCounter: vi.fn()
}));

vi.mock('../src/style.css', () => ({}));

describe('Main Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetModules();
    vi.resetAllMocks();
  });
  
  describe('Document Structure', () => {
    it('should create the correct DOM structure', async () => {
      await import('../src/main');
      
      const appDiv = document.querySelector<HTMLDivElement>('#app');
      
      expect(appDiv).not.toBeNull();
      expect(appDiv?.innerHTML).toContain('<h1>Vite + TypeScript</h1>');
      expect(appDiv?.querySelector('.card')?.innerHTML).toContain('<button id="counter" type="button"></button>');
      expect(appDiv?.querySelectorAll('a').length).toBe(2);
      expect(appDiv?.querySelectorAll('img').length).toBe(2);
    });
    
    it('should have the correct image alt attributes', async () => {
      await import('../src/main');
      
      const images = document.querySelectorAll('img');
      expect(images[0].alt).toBe('Vite logo');
      expect(images[1].alt).toBe('TypeScript logo');
    });
    
    it('should have non-empty image sources', async () => {
      await import('../src/main');
      
      const images = document.querySelectorAll('img');
      expect(images[0].src).toBeTruthy();
      expect(images[1].src).toBeTruthy();
    });
  });
  
  describe('Counter Setup', () => {
    it('should call setupCounter with the counter button', async () => {
      await import('../src/main');
      
      const counterButton = document.querySelector<HTMLButtonElement>('#counter');
      expect(setupCounter).toHaveBeenCalledTimes(1);
      expect(setupCounter).toHaveBeenCalledWith(counterButton);
    });
  });
});
