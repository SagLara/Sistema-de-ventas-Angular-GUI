import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url = environment.baseUrl;

  constructor(public http: HttpClient) { }

  get(table:string,id:number){
    return this.http.get<any>(this.url+`?table=${table}&id=${id}`);
  }

  getAll(table:string){
    return this.http.get<any>(this.url+`?table=${table}&id=0`);
  }

  getCliente(table:string,documento:string){
    return this.http.get<any>(this.url+`?table=${table}&id=-1&documento=${documento}`);
  }

  getFecha(table:string,fecha:string){
    return this.http.get<any>(this.url+`?table=${table}&id=-1&fecha=${fecha}`);
  }

  getInformesReg(table:string,informe:number){
    return this.http.get<any>(this.url+`?table=${table}&id=null&informe=${informe}`);
  }

  post(table:string,obj:any){
    return this.http.post<any>(this.url+`?table=${table}`,obj);
  }

  delete(table:string,id: number) {
    return this.http.delete<any>(this.url+`?table=${table}&id=${id}`);
  }

  deleteDetalle(table:string,id: number,tipo:string) {
    return this.http.delete<any>(this.url+`?table=${table}&id=${id}&tipo=${tipo}`);
  }

  update(table:string,obj: any) {
    return this.http.put<any>(this.url+`?table=${table}`, obj)
  }

  /**
    *
    * Muestra un SweetAlert de Error
    * 
    * @param titulo
    * @param error
    * 
    */
   showSwAlertError(titulo, error: any) {
    Swal.fire({
        icon: "error",
        title: "ERROR. " + titulo,
        html: error,
        confirmButtonText: "Aceptar",
    });       
  }

  /**
    *
    * Muestra un SweetAlert de Error
    * 
    * @param titulo
    * @param error
    * 
    */
   showSwAlertSucces(titulo, msj: any) {
    Swal.fire({
        icon: "success",
        title: titulo,
        html: msj,
    });       
  }
  
}
