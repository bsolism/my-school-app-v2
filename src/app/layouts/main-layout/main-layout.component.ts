import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AppInfoService } from '../../shared/services/app-info.service';
import { Router, RouterModule } from '@angular/router';
import { ScreenService } from '../../shared/services/screen.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SideNavComponent, FooterComponent, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent { 
    @HostBinding('class') get getClass() {
      const sizeClassName = Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
      return `${sizeClassName} app` ;
    }


  constructor(public appInfo: AppInfoService, private screen: ScreenService) {}
}
