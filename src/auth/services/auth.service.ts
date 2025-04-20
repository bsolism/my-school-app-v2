import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { Response } from '../../app/shared/interfaces/response.interface';

const api = environment.webApi.application;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private readonly httpClient : HttpClient) { }

  login(credential: string):Promise<Response<string>> {
    const formData = new FormData();
    formData.append('credential', credential);
    return lastValueFrom(this.httpClient.post<Response<string>>(`${api}/login`, formData));
  }

}
