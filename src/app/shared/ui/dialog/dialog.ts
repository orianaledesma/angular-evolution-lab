import { Component, ElementRef, effect, input, model, viewChild } from '@angular/core';
import { uniqueId } from '../../unique-id';

/** Native <dialog>: modal focus trap, Escape and inert background come from the platform. */
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  readonly heading = input.required<string>();
  readonly closeLabel = input('Close');
  readonly open = model(false);
  protected readonly headingId = uniqueId('dialog-title');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private readonly syncOpenState = effect(() => {
    const el = this.dialog().nativeElement;
    if (this.open() && !el.open) {
      el.showModal();
    } else if (!this.open() && el.open) {
      el.close();
    }
  });

  protected onClose(): void {
    this.open.set(false);
  }
}
