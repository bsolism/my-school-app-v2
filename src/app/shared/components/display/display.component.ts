import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [],
  template: `<p>display works!</p>`,
  styleUrl: './display.component.css',
})
export class DisplayComponent {
  isMobile = false;

  constructor(public breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Handset])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
  }
 }
