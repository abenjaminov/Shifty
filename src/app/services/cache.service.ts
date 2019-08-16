import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private cacheObjects: Map<string, Cache> = new Map<string, Cache>();

  constructor() { }

  getOrCreate(key): Cache {
    if(!this.cacheObjects.has(key)) {
      this.cacheObjects.set(key, new Cache());
    }

    return this.cacheObjects.get(key);
  }

  clear(key) {
    if(this.cacheObjects.has(key)) {
      this.cacheObjects.delete(key);
    }
  }
}

export class Cache {
  private cache:any = {};

  get(key) {
    if(!this.cache[key]) {
      return null;
    }

    return this.cache[key];
  }

  set(key, data) {
    this.cache[key] =data;
  }
}
