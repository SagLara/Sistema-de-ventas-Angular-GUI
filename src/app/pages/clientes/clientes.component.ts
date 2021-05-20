import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Cliente } from 'src/app/models/cliente';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api.service';
import { Ubicacion } from '../../models/ubicacion';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { Loader } from '@googlemaps/js-api-loader';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  cliente: Cliente=null;
  location: Ubicacion=null;
  clientes: Cliente[]= [];
  nuevo: boolean =false;
  update: boolean =false;
  ubicacion: boolean =false;
  
  urlTree;
  formCliente:FormGroup;

  lat: number;
  lon: number;
  
  constructor(public phpService: ApiService,private router: Router) { 
    this.getClientes();
    this.urlTree = this.router.parseUrl(this.router.url);
    console.log(this.urlTree);
    let niu= this.urlTree.queryParams['nuevo'];
    console.log(niu);
    
    if(niu=="0"){
      console.log("entre");
      this.nuevo=true;
    }
  }

  ngOnInit(): void {
    this.formCliente = new FormGroup({
      id: new FormControl(),
      id_cliente: new FormControl(),
      documento: new FormControl(),
      tipo_doc: new FormControl(),
      nombres: new FormControl(),
      apellidos: new FormControl(),
      ciudad: new FormControl(),
      latitud: new FormControl(),
      longitud: new FormControl(),
    });

  }

  validaciones(): Promise<boolean>{
    return new Promise((resolve) => {
      console.log(this.formCliente.value);
      let addClient =this.formCliente.value;

      this.getClienteDoc(addClient).then((resp)=>{
        if (resp==null) {
          if(addClient.nombres==null || addClient.nombres=="" || addClient.apellidos==null || addClient.apellidos==""  || addClient.latitud==null || addClient.longitud==null
            || addClient.documento==null || addClient.tipo_doc==null || !this.formCliente.valid){
            this.phpService.showSwAlertError("Datos incorrectos","Verifique los datos antes de enviarlos");
            resolve(false);
          }
          else{
            console.log("Crea");
            resolve(true);
          }
        }
        else{
          if(resp.id==addClient.id && this.update){
            console.log("actualiza");
            resolve(true);
          }else{
            this.phpService.showSwAlertError("Documento erroneo","El documento ya existe");
            resolve(false);
          }
        }
      });
  
    });
  }

  addCliente(){
    let addCli =this.formCliente.value
     this.validaciones().then((result) => {
      if(result){
        this.createCliente(addCli).then((result) => {
          if(result){
            this.getClienteDoc(addCli).then((resp)=>{
              if (resp!=null) {
                this.addUbicacion(this.cliente.id);
              }
            });
          }else{
            console.log("F agregando");
          }
        }).catch((err) => {
          console.error(err);
        });
      }   
     });

  }

  createCliente(addCli): Promise<boolean> {
    return new Promise((resolve) => {
      this.phpService.showSwAlertSucces("Cliente creado",`El Cliente con documento "${addCli.documento}" fue creado con exito`);
      this.phpService.post("cliente",addCli).subscribe((resp) => {
        console.log(resp);
        if(resp.data=="successfully"){
          resolve(true);
        }else{
          resolve(false);
        }
      },(error) => {
        console.error(error);
        resolve(false);
      });
    });
  }

  addUbicacion(id){
     if(id>0){
      this.formCliente.value.id_cliente=id;
      this.phpService.post("ubicacion",this.formCliente.value).subscribe((resp) => {
        if(resp!=null && resp.data!=null){
          this.getClientes();
          this.formCliente.reset('');
          this.nuevo=false;
        }
      });
     }
  }

  getClientes(){
    this.phpService.getAll("cliente").subscribe(resp =>{
      if(resp!=null && resp.data!=null){
        const {data} = resp;
        this.clientes=data;
        console.log(this.clientes); 
      }else{
        console.log("F");
      }
    });
  }

  getClienteDoc(addClient): Promise<any> {
    return new Promise((resolve) => {
      console.log(addClient.documento);
      this.phpService.getCliente("cliente",addClient.documento).subscribe(resp =>{
        console.log(resp);
        if(resp!=null && resp.cliente!=null){
          const {cliente} = resp;
          this.cliente=cliente;
          console.log(cliente);
          resolve(cliente);
        }else{
          resolve(null);
        }
      },(error) => {
        console.error(error);
        resolve(null);
      });
    });
  }

  getCliente(id: number){
    this.phpService.get("cliente",id).subscribe(resp =>{
      if(resp!=null && resp.data!=null){
        const cliente = resp.data;
        console.log(cliente);
        this.cliente=cliente;
        this.getUbicacion(id,cliente);
        console.log(resp.data); 
      }else{
        console.log("F solito");
      }
    },(error) => {
      console.error(error);
    });
  }

  getUbicacion(id: number,cliente?){
    console.log("llegue aca",id); 
    this.phpService.get("ubicacion",id).subscribe(resp =>{
      console.log(resp);
      if(resp!=null && resp.data!=null){
        if(cliente==null){
          console.log("mapa");
          this.location=resp.data;
        }else{
          const {id_cliente, ciudad, latitud, longitud} = resp.data;
          const {id , documento, tipo_doc, nombres,apellidos} = cliente;
          this.formCliente.setValue({id,id_cliente,documento,tipo_doc, nombres, apellidos, ciudad, latitud, longitud});
          this.update=true;
          console.log(resp.data); 
          this.location=null;
        }
      }else{
        console.log("F solito");
        this.location=null;
      }
    },(error) => {
      console.error(error);
    });
  }

  updateCliente():void {
    const obj = this.formCliente.value;
    console.log(obj);
    this.validaciones().then((result) => {
      if(result){
        this.editCliente(obj).then((result) => {
          this.phpService.showSwAlertSucces("Cliente Actualizado",`El cliente "${obj.documento}" se actualizo con exito`);
          console.log(result);
          if(result){
            console.log("Llegue a actualizar ubicaion");
            this.updateUbicacion();
          }else{
            console.log("F actualizando");
          }  
        }); 
      }
    });
  }

  editCliente(obj):Promise<boolean> {
    return new Promise((resolve) => {
      this.phpService.update("cliente",obj).subscribe((resp) => { 
          if(resp!=null && resp.data=="updated" ){
            resolve(true);
          }else{
            resolve(false);
          }
      },(error) => {
        console.error(error);
        resolve(false);
     });
    })
  }

  updateUbicacion():void {
    const obj = this.formCliente.value;
    console.log(obj);
    this.phpService.update("ubicacion",obj).subscribe((resp) => { 
      console.log(resp);
      if(resp!=null && resp.data!="error" ){
        this.getClientes();
        this.formCliente.reset('');
        this.update=false;
      }else{
        console.log("F actualizando");
      }  
      },(error) => {
        console.error(error);
    });
    
  }

  deleteUbicacion(id:number){
    Swal.fire({
      title: '¿Esta seguro que desea eliminar el cliente?',
      showDenyButton: true,
      confirmButtonText: `Borrar`,
      denyButtonText: `Cancelar`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.phpService.delete("ubicacion",id).subscribe((resp) => {  
          console.log(resp);
          if(resp.data!="error"){
            this.deleteCliente(id);
          }else{
            console.log("F eliminando");
          }
        },(error) => {
          console.error(error);
        })
     }  

    });
  }

  deleteCliente(id:number){
    this.phpService.delete("cliente",id).subscribe((resp) => {  
      console.log(resp);
      Swal.fire('Borrado!', '', 'success')
      if(resp.data!="error"){
        this.getClientes();
      }else{
        console.log("F eliminando");
      }
    },(error) => {
      console.error(error);
    })
  }

  verUbicacion(id:number):Promise<boolean>{
    return new Promise((resolve) => {
      this.getUbicacion(id);
      console.log(this.location);  
      if(this.location!=null){
        resolve(true);
      }  
    });
  }

  initMap(id){
    this.verUbicacion(id).then((result) => {
      if (result) {  
        console.log("Dibujo");
         
        let loader = new Loader({
          apiKey:'AIzaSyAWzIp_XISpbfVLoEIlMNZ_jhpJRmwCO2k'
        });
    
        loader.load().then(() =>{
          this.lat = Number(this.location.latitud);
          this.lon = Number(this.location.longitud);
          
          let uluru = { lat: this.lat, lng: this.lon };
    
          let map=new google.maps.Map(document.getElementById("map"),{
            center:uluru,
            zoom: 9
          })
          new google.maps.Marker({
            position: uluru,
            map: map,
          });
        
        })
    
        this.ubicacion=true;
        this.location=null;
      }
    });
    
  }
  
}


