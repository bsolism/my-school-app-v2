import { Component, Input, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import {DxDrawerModule, DxDrawerTypes} from 'devextreme-angular/ui/drawer'
import { DxScrollViewModule, DxScrollViewComponent } from 'devextreme-angular/ui/scroll-view';
import { SideNavigationComponent } from '../../shared/components/side-navigation/side-navigation.component';
import { NavigationEnd, Router } from '@angular/router';
import { ThemeService } from '../../shared/services/theme.service';
import { ScreenService } from '../../shared/services/screen.service';
import { DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DxDrawerModule, DxScrollViewModule, SideNavigationComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  @ViewChild(DxScrollViewComponent, { static: true }) scrollView!: DxScrollViewComponent;
  selectedRoute = '';
  
  @Input() title!: string;
  menuOpened!: boolean;
  shaderEnabled = false;
  temporaryMenuOpened = false;
  menuMode: DxDrawerTypes.OpenedStateMode = 'shrink';
  menuRevealMode: DxDrawerTypes.RevealMode = 'expand';
  minMenuSize = 0;

  swatchClassName = 'dx-swatch-additional';

  constructor(protected themeService: ThemeService, private screen: ScreenService, private router: Router){}
  ngOnInit() {
    this.menuOpened = this.screen.sizes['screen-large'];

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.selectedRoute = val.urlAfterRedirects.split('?')[0];
      }
    });

    this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 60;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  navigationChanged(event: DxTreeViewTypes.ItemClickEvent) {
    const path = (event.itemData as any).path;
    const pointerEvent = event.event;

    if (path && this.menuOpened) {
      if (event.node?.selected) {
        pointerEvent?.preventDefault();
      } else {
        this.router.navigate([path]);
        this.scrollView.instance.scrollTo(0);
      }

      if (this.hideMenuAfterNavigation) {
        this.temporaryMenuOpened = false;
        this.menuOpened = false;
        pointerEvent?.stopPropagation();
      }
    } else {
      pointerEvent?.preventDefault();
    }
  }

  navigationClick() {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }


}
