import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const themes = ['light', 'dark'] as const;
const themeClassNamePrefix = 'dx-swatch-';

type Theme = typeof themes[number];

function getNextTheme(theme?: Theme) {
  return (theme && themes[themes.indexOf(theme) + 1]) || themes[0];
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme: Theme = getNextTheme();

  constructor(@Inject(DOCUMENT) private document: Document) {
    if (!this.document.body.className.includes(themeClassNamePrefix)) {
      this.document.body.classList.add(themeClassNamePrefix + this.currentTheme);
    }

    this.updateSidenavTheme();
  }

  isDark = new BehaviorSubject<boolean>(this.currentTheme === 'dark');

  switchTheme() {
    const currentTheme = this.currentTheme;
    const newTheme = getNextTheme(this.currentTheme);
    const isCurrentThemeDark = currentTheme === 'dark';

    this.document.body.classList.replace(
      themeClassNamePrefix + currentTheme,
      themeClassNamePrefix + newTheme
    );

    const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
    const additionalClassNamePostfix = isCurrentThemeDark ? '-' + currentTheme : '';
    const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

    this.document.body
      .querySelector(`.${additionalClassName}`)?.classList
      .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

    this.currentTheme = newTheme;
    this.isDark.next(this.currentTheme === 'dark');
  }

  private updateSidenavTheme() {
    // Asegúrate de que el sidenav cambie de acuerdo con el tema
    const sidenav = this.document.querySelector('.sidenav'); // Ajusta el selector si es necesario
    if (sidenav) {
      if (this.currentTheme === 'dark') {
        sidenav.classList.add('dark-theme'); // Agrega clase para el tema oscuro
        sidenav.classList.remove('light-theme'); // Elimina la clase para el tema claro
      } else {
        sidenav.classList.add('light-theme'); // Agrega clase para el tema claro
        sidenav.classList.remove('dark-theme'); // Elimina la clase para el tema oscuro
      }
    }
  }

}
