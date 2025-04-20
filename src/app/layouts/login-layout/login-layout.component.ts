import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { LoginComponent } from '../../../auth/login/login.component';
import { ScreenService } from '../../shared/services/screen.service';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './login-layout.component.html',
  styleUrl: './login-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginLayoutComponent {
    @HostBinding('class') get getClass() {
      const sizeClassName = Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
      return `${sizeClassName} app` ;
    }

    constructor(private screen: ScreenService){}

    
 }
