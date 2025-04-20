import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import { AlumnoMatriculadoDto } from "../interfaces/alumno-matriculado.interface";
import { Response } from '../../../shared/interfaces/response.interface';

const webApi = environment.webApi

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

    constructor(protected httpClient: HttpClient) { }

    getAlumnosMatriculados(): Promise<Response<Array<AlumnoMatriculadoDto>>> {
        const uri = `${webApi.application}/alumn/enrolls`;
        return lastValueFrom(this.httpClient.get<Response<Array<AlumnoMatriculadoDto>>>(uri));
    }

    getAlumnoMatriculadoById(id :number): Promise<Response<AlumnoMatriculadoDto>> {
        const uri = `${webApi.application}/alumn/enroll/${id}`;
        return lastValueFrom(this.httpClient.get<Response<AlumnoMatriculadoDto>>(uri));
    }

    createPago(pago: AlumnoMatriculadoDto): Promise<Response<boolean>> {
        const uri = `${webApi.application}/pago/create`;
        return lastValueFrom(this.httpClient.post<Response<boolean>>(uri, pago));
    }

    
}