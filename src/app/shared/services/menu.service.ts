import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../interfaces/menu.interface';
import { Response } from '../interfaces/response.interface';
import { lastValueFrom } from 'rxjs';

const webApi = environment.webApi

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(protected httpClient: HttpClient) { }

  getMenus(): Promise<Response<Array<Menu>>>{
    const uri = `${webApi.application}/menu`;
    return lastValueFrom(this.httpClient.get<Response<Array<Menu>>>(uri));
  }


}
