import type { CanActivateFn, CanLoad, CanMatch, Route, UrlSegment, UrlTree } from '@angular/router';

export const authCanLoadGuard: CanActivateFn =(route, state) =>  {
  return true;
};
