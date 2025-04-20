import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-container',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './app-container.component.html',
  styleUrl: './app-container.component.scss'
})
export class AppContainerComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() sizeIcon = 25; 

}
