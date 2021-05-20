import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { Producto } from '../../models/producto';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  producto: Producto;
  productos: Producto[]= [];
  nuevo: boolean =false;
  update: boolean =false;

  formProducto:FormGroup;
  
  
  /* productForm = new FormGroup({
    nombre: new FormControl('Camiseta Seleccion Colombia'),
    precio: new FormControl(35000),
    stock: new FormControl(40)
  }); */

  constructor(public phpService: ApiService) { 
    this.getProductos();
  }

  ngOnInit(): void {
    this.formProducto = new FormGroup({
      id: new FormControl(),
      nombre: new FormControl(),
      precio: new FormControl(),
      stock: new FormControl()
    });
  }

  validaciones():boolean{
    console.log(this.formProducto.value);
    let addProd =this.formProducto.value
    if(addProd.nombre==null || addProd.nombre=="" || addProd.precio==null || addProd.stock==null || !this.formProducto.valid){
      this.phpService.showSwAlertError("Datos incorrectos","Verifique los datos antes de enviarlos");
      return false;
    }else if(addProd.precio<0 || addProd.stock<0){
      this.phpService.showSwAlertError("Datos negativos","El precio o stock debe tener valores positivos");
      return false;
    }
    else{
      return true
    }
  }
  
  addProducto(){
    let addProd =this.formProducto.value
    if(this.validaciones()){
      this.phpService.showSwAlertSucces("Producto Agregado",`El producto "${addProd.nombre}" fue agregado con exito`);
      this.phpService.post("producto",this.formProducto.value).subscribe((resp) => {
        console.log(resp);
        if(resp.data!="error"){
          this.getProductos();
          this.formProducto.reset('');
          this.nuevo=false;
        }else{
          console.log("F agregando");
        }
      },(error) => {
        console.error(error);
      });
    }   
  }

  getProductos(){
    this.phpService.getAll("producto").subscribe(resp =>{
      if(resp!=null && resp.data!=null){
        const {data} = resp;
        this.productos=data;
        console.log(this.productos); 
      }else{
        console.log("F");
      }
    });
  }

  getProducto(id: number){
    this.phpService.get("producto",id).subscribe(resp =>{
      if(resp!=null && resp.data!=null){
        const {id,nombre, precio, stock} = resp.data;
        this.producto=resp.data;
        this.formProducto.setValue({id,nombre, precio, stock});
        this.update=true;
        console.log(this.producto); 
      }else{
        console.log("F solito");
      }
    },(error) => {
      console.error(error);
    });
  }

  updateProducto():void {
    const obj = this.formProducto.value;
    console.log(obj);
    if(this.validaciones()){
      this.phpService.showSwAlertSucces("Producto Actualizado",`El producto "${obj.nombre}" se actualizo con exito`);
      this.phpService.update("producto",obj).subscribe((resp) => { 
        console.log(resp);
        if(resp!=null && resp.data!="error" ){
          this.getProductos();
          this.formProducto.reset('');
          this.update=false;
        }else{
          console.log("F actualizando");
        }  
       },(error) => {
         console.error(error);
      });
    }
    
  }

  deleteProducto(id:number){
    Swal.fire({
      title: '¿Esta seguro que desea eliminar el producto?',
      showDenyButton: true,
      confirmButtonText: `Borrar`,
      denyButtonText: `Cancelar`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.phpService.delete("producto",id).subscribe((resp) => {  
          console.log(resp);
          Swal.fire('Borrado!', '', 'success')
          if(resp.data!="error"){
            this.getProductos();
          }else{
            console.log("F eliminando");
          }
        },(error) => {
          console.error(error);
      })

     }  

    });
  }

}
