import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/** Route `title`s are i18n keys; the tab title follows the active language. */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly translate = inject(TranslateService);
  private readonly title = inject(Title);
  private key: string | undefined;

  private readonly relabelOnLangChange = this.translate.onLangChange
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.apply();
    });

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key = this.buildTitle(snapshot);
    this.apply();
  }

  private apply(): void {
    const app = this.translate.instant('app.title') as string;
    const page = this.key ? (this.translate.instant(this.key) as string) : '';
    this.title.setTitle(page && page !== app ? `${page} · ${app}` : app);
  }
}
