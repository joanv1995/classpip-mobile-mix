import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AppConfig } from '../app/app.config';
import { UtilsService } from './utils.service';
import { Login } from '../model/login.model';
import { Role } from '../model/role.model';
import { LoginResponse } from '../model/login.response.model';

@Injectable()
export class LoginService {

  private currentUser: LoginResponse;

  constructor(
    public http: Http,
    public utilsService: UtilsService) { }

  /**
   * This method calls the REST API for performing a login against
   * the common services for the application
   * @param {Login} login Object with login credentials
   * @return {Observable<LoginResponse>} observable object with the login response
   */
  public login(login: Login): Observable<Response> {

    var url:string;
    switch (this.utilsService.role) {
      case Role.STUDENT:
        url = AppConfig.STUDENT_LOGIN_URL;
        break;
      case Role.TEACHER:
        url = AppConfig.TEACHER_LOGIN_URL;
        break;
      case Role.SCHOOLADMIN:
        url = AppConfig.SCHOOLADMIN_LOGIN_URL;
        break;
      default:
        break;
    }

    return this.http.post(url, login)
      .map(response => {
        this.currentUser = LoginResponse.toObject(response.json());
        return response;
      })
      .catch((error: Response) => this.utilsService.handleAPIError(error));

    //.catch(this.utilsService.handleAPIError);
  }

  /**
   * Returns the current logged user stored in memory.
   * @return {LoginResponse} Object with the user information
   */
  public getUserInfo(): LoginResponse {
    return this.currentUser;
  }

  /**
   * This method executes a logout into the application, removes
   * the current logged user
   * @return {Observable<Boolean>} returns an observable with the result
   * of the operation
   */
  public logout(): Observable<Response> {

    let headers: Headers = new Headers();
    let options: RequestOptions = new RequestOptions({ headers: this.setAuthorizationHeader(headers) });

    var url:string;
    switch (this.utilsService.role) {
      case Role.STUDENT:
        url = AppConfig.STUDENT_LOGOUT_URL;
        break;
      case Role.TEACHER:
        url = AppConfig.TEACHER_LOGOUT_URL;
        break;
      case Role.SCHOOLADMIN:
        url = AppConfig.SCHOOLADMIN_LOGOUT_URL;
        break;
      default:
        break;
    }

    return this.http.post(url, {}, options)
      .map(response => {
        this.currentUser = null;
        return true;
      })
      .catch((error: Response) => this.utilsService.handleAPIError(error));
  }

  /**
   * This method appends the authorization header to the request
   * @param {Headers} headers Headers object to fill with the Authorization token
   * @return {Headers} Returns the headers object
   */
  private setAuthorizationHeader(headers: Headers): Headers {

    headers.append(AppConfig.AUTH_HEADER, this.getUserInfo().id);
    return headers;
  }

}
