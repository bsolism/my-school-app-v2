import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Alumno } from '../interfaces/alumn.interface';
import { Response } from '../../../shared/interfaces/response.interface';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { City, Country, State } from '../interfaces/location.interface';
import { AlumnoMatricula } from '../interfaces/alumn-enroll.interface';

const webApi = environment.webApi

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(protected httpClient: HttpClient) { }

  getAlumns(): Promise<Response<Array<Alumno>>>{
    const uri = `${webApi.application}/alumn`;
    return lastValueFrom(this.httpClient.get<Response<Array<Alumno>>>(uri));
  }

  getAlumnsWithEnroll(param:any): Promise<Response<Array<AlumnoMatricula>>>{
    const uri = `${webApi.application}/alumn/enroll?term=${param}`;
    return lastValueFrom(this.httpClient.get<Response<Array<AlumnoMatricula>>>(uri));
  }

  getCountries(): Promise<Array<Country>>{
    const uri = `${webApi.locationApi}/country/countries`;
    return lastValueFrom(this.httpClient.get<Array<Country>>(uri));
  }

  getStatesByCountryId(idCountry: number): Promise<Array<State>>{
    const uri = `${webApi.locationApi}/state/by-countryid?countryId=${idCountry}`;
    return lastValueFrom(this.httpClient.get<Array<State>>(uri));
  }

  getCityByStateId(idState: number): Promise<Array<City>>{
    const uri = `${webApi.locationApi}/city/by-stateid?stateId=${idState}`;
    return lastValueFrom(this.httpClient.get<Array<City>>(uri));
  }

  getAlumnById(id: number): Promise<Response<Alumno>>{
    const uri = `${webApi.application}/alumn/id?id=${id}`;
    return lastValueFrom(this.httpClient.get<Response<Alumno>>(uri));
  }
  postAlumn(alumn: Alumno): Promise<Response<Alumno>>{
    const uri = `${webApi.application}/alumn`;
    return lastValueFrom(this.httpClient.post<Response<Alumno>>(uri,alumn));
  }
  putAlumn(alumn: Alumno): Promise<Response<Alumno>>{
    const uri = `${webApi.application}/alumn`;
    return lastValueFrom(this.httpClient.put<Response<Alumno>>(uri,alumn));
  }

  postMatriculaAlumnos(matriculas: Array<AlumnoMatricula>): Promise<any>{
    const uri = `${webApi.application}/matricula/alumnos`;
    return lastValueFrom(this.httpClient.post<any>(uri,matriculas));
  }

  postMatriculaAlumno(matricula: any): Promise<any>{
    const uri = `${webApi.application}/matricula/alumno`;
    return lastValueFrom(this.httpClient.post<any>(uri,matricula));
  }

  postTransporteAlumno(transporte: any, fileValue: File[]): Promise<any>{
    const formData = new FormData();
    formData.append('data', JSON.stringify(transporte));
    formData.append('file', fileValue[0]);
    const uri = `${webApi.application}/transport`;
    return lastValueFrom(this.httpClient.post<any>(uri,formData));
  }

  putTransporteAlumno(transporte: any, fileValue: File[]): Promise<any>{
    const formData = new FormData();
    formData.append('data', JSON.stringify(transporte));
    formData.append('file', fileValue[0]);
    const uri = `${webApi.application}/transport`;
    return lastValueFrom(this.httpClient.put<any>(uri,formData));
  }

  getTransporteAlumno(): Promise<any>{
    const uri = `${webApi.application}/transport`;
    return lastValueFrom(this.httpClient.get<any>(uri));
  }

  getCroquisFile(name: string): Promise<any>{
    const uri = `${webApi.application}/croquis/${name}`;
    return lastValueFrom(
      this.httpClient.get(uri, {
        responseType: 'blob', 
        observe: 'response'  
      })
    );
  
  }
}
