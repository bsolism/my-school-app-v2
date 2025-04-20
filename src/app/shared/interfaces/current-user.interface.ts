import { Menu } from "./menu.interface";

export interface CurrentUser {
    usuario: string;
    email: string;
    name: string;
    rolId: string;
    menus: Menu[]; // Asegúrate de tener definido MenuDto
  }