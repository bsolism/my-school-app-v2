export interface Contact{
    id?:number;
    fullName?:string;
    dni?:string;
    phone?:string;
    email?:string;
    parent?:string;
    isEdit?: boolean;
  }