export interface Country{
    id: number;
    name: string;
    code:string;
}

export interface State{
    id: number;
    name: string;
    countryId: number;
    countryCode: string;
    countryName: string;
    stateCode: string;
}

export interface City{
    id: number;
    name: string;
  }