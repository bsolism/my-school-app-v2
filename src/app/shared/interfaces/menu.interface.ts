export interface Menu {
    icon: string;
    text: string;// Opcional, solo para elementos con submenús
    path?:string;
    items?: Menu[]; // Submenú anidado
  }
  