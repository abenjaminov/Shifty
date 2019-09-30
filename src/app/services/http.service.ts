import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {AuthenticationService} from "./authentication.service";
import {CacheService} from "./cache.service";

export interface HttpResult {
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient,
              private authenticationService: AuthenticationService,
              private cacheService: CacheService,) { }

  getHttpHeaders() {
    const headers:any = {};
    headers.Authorization = `Bearer ${this.authenticationService.authedUserData.token}`;

    return headers;
  }

  clearCache(cacheName:string) {
    this.cacheService.clear(cacheName);
  }

  async get(cacheName:string, url:string, params? :Array<string>): Promise<HttpResult> {
    let headers = this.getHttpHeaders();

    url = `${url}` + `${params ? '/' + params.join('/') : ''}`;

    let cache = undefined;

    if(cacheName) {
      cache = this.cacheService.getOrCreate(cacheName);

      let cachedData = cache.get(url);
      if(cachedData) {

        return cachedData;
      }
    }

    try {
      let result = await this.httpClient.get<HttpResult>(url,{headers: headers}).toPromise<HttpResult>();

      if(cache) {
        cache.set(url, result.data);
      }

      return result.data;
    }
    catch (error) {
      let typedError: HttpErrorResponse = error;

      this.authenticationService.logout(false,"Session expired");

      throw error;
    }
  }

  async put(cacheName:string, url: string, data: any) {
    const headers = this.getHttpHeaders();

    try {
      let result = await this.httpClient.put(url, data, {headers: headers}).toPromise();

      this.cacheService.clear(cacheName)

      return result
    }
    catch(error) {
      let typedError: HttpErrorResponse = error;

      this.authenticationService.logout(false,"Session expired");

      throw error;
    }
  }

  async post(cacheName:string, url: string, data: any) {
    const headers = this.getHttpHeaders();

    try {
      let result = await this.httpClient.post(url, data, {headers: headers}).toPromise();

      this.cacheService.clear(cacheName)

      return result
    }
    catch(error) {
      let typedError: HttpErrorResponse = error;

      this.authenticationService.logout(false,"Session expired");

      throw error;
    }
  }

  async delete(cacheName:string, url: string, id: any) {
    const headers = this.getHttpHeaders();

    try {
      let result = await this.httpClient.delete(url + `/${id}`, {headers: headers}).toPromise();

      this.cacheService.clear(cacheName)

      return result
    }
    catch(error) {
      let typedError: HttpErrorResponse = error;

      this.authenticationService.logout(false,"Session expired");

      throw error;
    }
  }
}
