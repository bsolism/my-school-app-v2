import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {DxTreeViewComponent, DxTreeViewModule, DxTreeViewTypes} from 'devextreme-angular/ui/tree-view'
// import { navigation } from '../../../navigation';

import * as events from 'devextreme/events';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../interfaces/menu.interface';
import { AlertService } from '../../services/alert.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-side-navigation',
  standalone: true,
  imports: [DxTreeViewModule],
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.scss'
})
export class SideNavigationComponent {
  @ViewChild(DxTreeViewComponent, { static: true }) menu!: DxTreeViewComponent;

  @Output() selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();
  @Output() openMenu = new EventEmitter<any>();

  navigation:Array<any> = [];
  items: Record<string, unknown>[] = [];

  private _selectedItem!: String;

  @Input() set selectedItem(value: String) {
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }
    this.menu.instance.selectItem(value);
  }

  private _items!: Record <string, unknown>[];


  // get items() {
  //   if (!this._items) {
  //     this._items = navigation.map((item) => {
  //       if(item.path && !(/^\//.test(item.path))){
  //         item.path = `/${item.path}`;
  //       }
  //        return { ...item, expanded: !this._compactMode }
  //       });
  //   }
  //   return this._items;
  // }

  constructor(private elementRef: ElementRef, private service: MenuService, 
    private _alert:AlertService, private userStore: UserStoreService) {
    const home ={
      text: 'Home',
      path: '/home',
      icon: 'home'
    }
    this.navigation.push(home);
    this.loadMenu();
   }

  private async loadMenu() {
    try {
      this._alert.loading('Cargando...')
      const response = await this.userStore.getUser();      
      const menu = this.convertToNavigation(response?.menus || []);
      this.navigation.push(...menu);
      this.items = this.navigation.map((item) => ({
        ...item,
        expanded: !this._compactMode,
      }));

      if (this.menu?.instance) {
        this.menu.instance.option('items', this.items); 
      }

      this.reordenMenu();
      this._alert.close();
    } catch (error) {
      this._alert.warning('Error al cargar configuracion inicial')
      console.error('Error al cargar el menú:', error);
    }
  }

  private reordenMenu():void{
    const treeItems = this.elementRef.nativeElement.querySelectorAll('.dx-item.dx-treeview-item');
      treeItems.forEach((item: HTMLElement) => {
        const toggleButton = item.nextElementSibling;
        const hasChildren = toggleButton && toggleButton.classList.contains('dx-treeview-toggle-item-visibility');
  
        if (hasChildren) {
          item.appendChild(toggleButton);
        }
      });
      

  }

  private convertToNavigation(input: any[]): Menu[] {
    return input.map(item => ({
      text: item.Name,   // Cambia 'name' por 'text'
      path: item.Path ? `/${item.Path}` : '',   // Formatea 'path' como string
      icon: item.Icon, // Mantén el 'icon'
      items: item.SubMenu && item.SubMenu.length > 0 ? this.convertToNavigation(item.SubMenu) : [] // Recursión para submenús
    }));
  }

  private _compactMode = false;

  @Input() get compactMode() {
    return this._compactMode;
  }

  set compactMode(val) {
    this._compactMode = val;

    if (!this.menu.instance) {
      return;
    }

    if (val) {
      this.menu.instance.collapseAll();
    } else {
      this.menu.instance.expandItem(this._selectedItem);
    }
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    this.selectedItemChanged.emit(event);
  }

  onItemExpanded(event: any) {
    const itemElement = event.itemElement; 
    const toggleButton = itemElement.querySelector('.dx-treeview-toggle-item-visibility');

    if (toggleButton) {
      toggleButton.classList.add('dx-treeview-toggle-item-visibility-opened');
    }
  }

  onItemCollapsed(event: any) {
    const itemElement = event.itemElement;
    const toggleButton = itemElement.querySelector('.dx-treeview-toggle-item-visibility');

    if (toggleButton) {
      toggleButton.classList.remove('dx-treeview-toggle-item-visibility-opened');
    }
  }

  ngAfterViewInit() {
    // const treeItems = this.elementRef.nativeElement.querySelectorAll('.dx-item.dx-treeview-item');

    // treeItems.forEach((item: HTMLElement) => {
    //   const toggleButton = item.nextElementSibling;
    //   const hasChildren = toggleButton && toggleButton.classList.contains('dx-treeview-toggle-item-visibility');

    //   if (hasChildren) {
    //     item.appendChild(toggleButton);
    //   }
    // });
    this.reordenMenu();

    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }
}
