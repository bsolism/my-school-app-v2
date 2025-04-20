export interface AlumnoContacto {
    id?: number;
    fullName?: string;
    dni?: string;
    phone?: string;
    email?: string;
    parent?: string;
}

export interface Alumno {
    id?:number;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    fullName?:string;
    dni: string;
    sex: string;
    bloodType: string;
    dateOfBirth: Date; 
    countryBirth?: string;
    stateBirth?: string;
    cityBirth?: string;
    phone?: string;
    email?: string;
    currentCountry?: string;
    currentState?: string;
    currentCity?: string;
    address: string;
    comment:string;
    imagen?:string;
    contacts?: AlumnoContacto[];
}
