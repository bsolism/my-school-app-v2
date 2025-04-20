import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {DxButtonModule} from 'devextreme-angular/ui/button'
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, DxButtonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {

  constructor(public themeService: ThemeService){}

  onButtonClick () {
    this.themeService.switchTheme();
  }

}
