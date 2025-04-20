import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Course } from '../../interfaces/course.interface';
import { Response } from '../../../shared/interfaces/response.interface';
import { environment } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';

const {webApi} = environment


@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(protected httpClient: HttpClient) { }

  getCourses(): Promise<Response<Array<Course>>>{
      const uri = `${webApi.application}/course`;
      return lastValueFrom(this.httpClient.get<Response<Array<Course>>>(uri));
  }

  addCourse(course: Course): Promise<Response<Course>>{
    const uri = `${webApi.application}/course`;
    return lastValueFrom(this.httpClient.post<Response<Course>>(uri,course));
  }
  updateCourse(course: Course): Promise<Response<Course>>{
    const uri = `${webApi.application}/course`;
    return lastValueFrom(this.httpClient.put<Response<Course>>(uri,course));
  }

  postMatricula(matricula: any):Promise<any>{
    const uri = `${webApi.application}/matricula`;
    return lastValueFrom(this.httpClient.post(uri,matricula));    
  }
  
  putMatricula(matricula: any):Promise<any>{
    const uri = `${webApi.application}/matricula`;
    return lastValueFrom(this.httpClient.put(uri,matricula));    
  }

  getMatriculaDefinicion(matriculaYear:number):Promise<any>{
    const uri = `${webApi.application}/matricula?year=${matriculaYear}`;
    return lastValueFrom(this.httpClient.get<any>(uri));        
  }

  getMatriculaOpen():Promise<any>{
    const uri = `${webApi.application}/matricula/open`;
    return lastValueFrom(this.httpClient.get<any>(uri));        
  }
}
