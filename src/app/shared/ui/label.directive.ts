import { Directive, HostBinding } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[hlmLabel]',
  standalone: true,
})
export class HlmLabelDirective {
  @HostBinding('class')
  readonly classes =
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
}
