import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { LanguageService, isLanguage } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideTranslateTesting()] });
  });

  it('switches language, updates <html lang> and persists the choice', async () => {
    const service = TestBed.inject(LanguageService);
    await firstValueFrom(service.use('de'));
    TestBed.tick();

    expect(service.current()).toBe('de');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('de');
    expect(localStorage.getItem('ael.lang')).toBe('de');
    expect(TestBed.inject(TranslateService).instant('nav.home')).toBe('Überblick');
  });

  it('prefers the stored language, then the browser language', () => {
    const service = TestBed.inject(LanguageService);
    localStorage.setItem('ael.lang', 'es');
    expect(service.initialLanguage()).toBe('es');

    localStorage.clear();
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('de-AT');
    expect(service.initialLanguage()).toBe('de');

    jest.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    expect(service.initialLanguage()).toBe('en');
  });

  it('survives unavailable storage', async () => {
    const service = TestBed.inject(LanguageService);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(service.initialLanguage()).toBe('en');
    await expect(firstValueFrom(service.use('es'))).resolves.toBeDefined();
    expect(service.current()).toBe('es');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

describe('isLanguage', () => {
  it('narrows only supported languages', () => {
    expect(isLanguage('de')).toBe(true);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});
