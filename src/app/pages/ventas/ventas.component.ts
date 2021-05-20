import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api.service';
import { RegistroVenta } from '../../models/registro_venta';
import { Cliente } from 'src/app/models/cliente';
import { Producto } from 'src/app/models/producto';
import { Router } from '@angular/router';
import { DetalleVenta } from '../../models/detalle_venta';
import { Informe } from '../../models/informe';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {

  registro: RegistroVenta=null;
  detalles: DetalleVenta[]=[];
  cliente: Cliente=null;

  venta: RegistroVenta=null;
  ventas: RegistroVenta[]= [];

  informe: Informe=null;

  producto:Producto=null;
  productos: Producto[]= [];
  compras: Producto[]= [];
  nuevo: boolean =false;
  read: boolean =false;
  exist: boolean =false;
  outStock: boolean =false;
  calcular: boolean =false;

  formVenta:FormGroup;
  formDetalle:FormGroup;
  formProducto:FormGroup;
  formCliente:FormGroup;

  constructor(public phpService: ApiService,private router: Router) {
    this.getVentas();
  }



  ngOnInit(): void {
    let diaHoy=new Date();
    let fecha:string="";
    fecha=fecha+diaHoy.getFullYear()+"-";
    fecha=fecha+(diaHoy.getMonth()+1)+"-";
    fecha+=diaHoy.getDate();

    this.formVenta = new FormGroup({
      id: new FormControl(),
      id_cliente: new FormControl(),
      id_informe: new FormControl(),
      fecha: new FormControl(fecha),
      valor_total_venta: new FormControl(),
    });

    this.formDetalle = new FormGroup({
      id_registro: new FormControl(),
      id_producto: new FormControl(),
      cantidad: new FormControl(),
      valor_x_cant: new FormControl(),
    });

    this.formProducto = new FormGroup({
      id: new FormControl(),
      nombre: new FormControl(),
      precio: new FormControl(),
      stock: new FormControl()
    });

    this.formCliente = new FormGroup({
      id: new FormControl(),
      documento: new FormControl(),
      tipo_doc: new FormControl(),
      nombres: new FormControl(),
      apellidos: new FormControl(),
    });
  }

  getVentas(){
    this.phpService.getAll("registro_venta").subscribe(resp =>{
      if(resp!=null && resp.data!=null){
        const {data} = resp;
        this.ventas=data;
        console.log(this.ventas); 
      }else{
        console.log("F");
      }
    });
  }

  getVenta(id: number){
    this.phpService.get("registro_venta",id).subscribe(resp =>{
      console.log("venta,",resp);
      if(resp!=null && resp.data!=null){
        const {id , id_cliente, id_informe, fecha, valor_total_venta} = resp.data;
        this.formVenta.setValue({id , id_cliente, id_informe , fecha, valor_total_venta});
        this.venta=resp.data;
        console.log(this.venta); 
        this.getCliente(id_cliente);
      }else{
        console.log("F");
      }
    });
  }

  deleteVenta(id:number){
    Swal.fire({
      title: '¿Esta seguro que desea eliminar el registro?',
      showDenyButton: true,
      confirmButtonText: `Borrar`,
      denyButtonText: `Cancelar`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.phpService.delete("registro_venta",id).subscribe((resp) => {  
          console.log(resp);
          Swal.fire('Borrado!', '', 'success')
          if(resp.data!="error"){
            this.getVentas();
          }else{
            console.log("F eliminando");
          }
        },(error) => {
          console.error(error);
      })

     }  

    });
  }

  getCliente(id: number){
    this.phpService.get("cliente",id).subscribe(resp =>{
      console.log("cliente,",resp);
      if(resp!=null && resp.data!=null){
        const cliente = resp.data;
        const {id , documento, tipo_doc, nombres,apellidos} = cliente;
        this.formCliente.setValue({id,documento,tipo_doc, nombres, apellidos});
        console.log(cliente);
        this.cliente=cliente;
        this.read=true;
      }else{
        console.log("F solito");
      }
    },(error) => {
      console.error(error);
    });
  }

  buscarCliente(){
    let client = this.formCliente.value;
    this.getClienteDoc(client).then((result) => {
      if(result==null){
        Swal.fire({
          title: 'El cliente no existe ¿Desea crear uno nuevo?',
          showDenyButton: true,
          confirmButtonText: `Crear`,
          denyButtonText: `Cancelar`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.router.navigateByUrl('clientes');
          }  
        });
      }else{
        const {id , documento, tipo_doc, nombres,apellidos} = result;
        this.formCliente.setValue({id,documento,tipo_doc, nombres, apellidos});
        this.exist=true;
        this.getProductos();
      }
    });
  }

  getClienteDoc(client): Promise<any> {
    return new Promise((resolve) => {
      console.log(client.documento);
      this.phpService.getCliente("cliente",client.documento).subscribe(resp =>{
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

  addCarrito():void{
    if(this.producto!=null){
      let duplicated=false;
      this.compras.some((element)=>{
        console.log(element);
        if(element.id==this.producto.id){
          duplicated=true;
        }
      });
      if(!duplicated){
        this.outStock=false;
        console.log("Compranding");
        console.log("prod-->",this.producto);
        if(this.producto.stock>0){
          this.producto.cantDisp=new Array();
          for (let u = 1; u <= this.producto.stock; u++) {
            this.producto.cantDisp.push(u);
          }
          this.compras.push(this.producto);
        }else{
          this.outStock=true;
        }
      }else{
        this.phpService.showSwAlertError("Producto Duplicado","No puede agregar un producto 2 veces");
      }
    }else{
      this.phpService.showSwAlertError("Producto Vacio","Seleccione un producto para comprar");
    }
  }

  calcularCompra(){
    console.log("Ready pa comprar");

    console.log(this.formVenta.value);
    
    this.addInforme().then((result) => {
      if(result){
          let addDetalles=[];
      
          for (let i = 0; i < this.compras.length; i++) {
            const element = this.compras[i];
            let det= new DetalleVenta();
            if(element.compra==null){
              this.phpService.showSwAlertError("Cantidad Vacia","Seleccione una cantidad en los productos");
              return false;
            }else{
              det.id_producto=element.id;
              det.cantidad=element.compra;
              det.valor_x_cant=(det.cantidad*element.precio);
              addDetalles.push(det)
            }
          }
          
      
          let ventaTotal=0;
          for (let j = 0; j < addDetalles.length; j++) {
            const element = addDetalles[j];
            ventaTotal+=element.valor_x_cant;
          }
          let id = 0; 
          let fecha=this.formVenta.value.fecha;
          let id_informe = this.informe.id;
          let id_cliente =this.cliente.id;
          let valor_total_venta=ventaTotal;
          this.formVenta.setValue({id,id_cliente,id_informe,fecha,valor_total_venta});

          console.log(this.formVenta.value);
          
      
          this.detalles=addDetalles;
          this.calcular=true;     
      }else{
        console.log("F creando informe");
      }
    }); 
  }

  realizarCompra(){
    console.log("Se facturoooo");
    let obj=this.formVenta.value;
    console.log(obj);
    console.log(this.detalles);
    if(obj!=null){
      this.addVenta(obj).then((resp)=>{
          if(resp){
            this.getVentaId(obj.fecha).then((result)=>{
              if(result!=null){
                console.log("Nuevo-->",obj);
                this.createDetalles(result.id).then((response)=>{
                    if(response){
                      this.actualizarProductos().then((respuesta)=>{
                        if(respuesta){
                          this.phpService.showSwAlertSucces("Venta Creada","La venta se creo exitosamente");
                          this.actualizarInforme();
                          this.getVentas();
                          this.nuevo=false;
                          this.exist=false;
                          this.read =false;
                          this.outStock =false;
                          this.calcular =false;
                        }
                    });
                    }
                });
              }
            });
          }else{
            this.phpService.showSwAlertError("Creando Venta","Ocurrio un error al crear el registro de la venta");
          }
      });
    }
  }

  actualizarInforme(){
    let regsInforme=[];
    let idInfo=this.informe.id;
    let putInforme=this.informe;
    let ventaVal =[];
    let ventaProm=0;
    this.getRegistrosInforme(idInfo).then((informes)=>{
        if(informes!=null){
          regsInforme=informes;
          for (let j = 0; j < regsInforme.length; j++) {
            const element = regsInforme[j];
            putInforme.cant_ventas+=1;
            ventaVal.push(element.valor_total_venta);
            ventaProm+=element.valor_total_venta;
          }
          if(putInforme.venta_mayor==0 && putInforme.venta_menor==0 && putInforme.venta_promedio==0){
            putInforme.venta_mayor=ventaVal[0];
            putInforme.venta_menor=ventaVal[0];
            putInforme.venta_promedio=ventaVal[0];
          }else{
            putInforme.venta_mayor=Math.max.apply(null, ventaVal);
            putInforme.venta_menor=Math.min.apply(null, ventaVal);
            putInforme.venta_promedio=(ventaProm/putInforme.cant_ventas);
          }
          this.updateInforme(putInforme).then((res)=>{
            if(res){
              this.phpService.showSwAlertError("Actualizando Informes","Se actualizaron los datos del informe correctamente");
            }else{
              this.phpService.showSwAlertError("Actualizando Informes","Ocurrio un error al actualziar los informes");
            }
          });
        }else{
         /*  this.phpService.showSwAlertError("Buscando ventas de informe","No se encontraron informes"); */
        }
    });
    
  }

  updateInforme(obj):Promise<any> {
    return new Promise((resolve) => {
      console.log(obj);
      this.phpService.update("informe",obj).subscribe(resp =>{
        console.log(resp); 
        if(resp.data=="updated"){
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

  getRegistrosInforme(idInforme:number):Promise<any> {
    return new Promise((resolve) => {
      this.phpService.getInformesReg("registro_venta",idInforme).subscribe(resp =>{
        console.log(resp); 
        if(resp!=null && resp.informe!=null){
          const {informes}=resp;
          resolve(informes);
        }else{
          resolve(null);
        }
      },(error) => {
        console.error(error);
        resolve(null);
      });
    });

  }

  getVentaId(fecha):Promise<any> {
    return new Promise((resolve) => {
      console.log(fecha);
      this.phpService.getFecha("registro_venta",fecha).subscribe(resp =>{
        console.log(resp); 
        if(resp!=null && resp.registro!=null){
          const reg=resp.registro;
          const {id , id_cliente, id_informe,fecha, valor_total_venta} = resp.registro;
          this.formVenta.setValue({id , id_cliente, id_informe,fecha, valor_total_venta});
          this.registro=reg;
          resolve(reg);
        }else{
          resolve(null);
        }
      },(error) => {
        console.error(error);
        resolve(null);
      });

    });
  }

  addVenta(registro):Promise<any> {
    return new Promise((resolve) => {
      console.log(registro);
      this.phpService.post("registro_venta",registro).subscribe(resp =>{
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

  createDetalles(id_registro):Promise<boolean> {
    return new Promise((resolve) => {
      for (let d = 0; d < this.detalles.length; d++) {
        const element = this.detalles[d];
        element.id_registro=id_registro;
        console.log(element);
        this.addDetalle(element).then((res)=>{
          console.log(res);
          if(!res){
            this.phpService.showSwAlertError("Creando Venta","No se pudieron crear los detalles de la venta");
            resolve(false);
          }
        });
      }
      resolve(true);
    });

  }

  addDetalle(detalle):Promise<any> {
    return new Promise((resolve) => {
      console.log(detalle);
      this.phpService.post("detalle_venta",detalle).subscribe(resp =>{
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

  actualizarProductos():Promise<boolean> {
    return new Promise((resolve) => {
      for (let i = 0; i < this.compras.length; i++) {
        const product = this.compras[i];
        product.stock=product.stock-product.compra;
        console.log(product);
        this.updateProducto(product).then((res)=>{
          console.log(res);
          if(!res){
            this.phpService.showSwAlertError("Actualizando Productos","No se pudo actualizar el stock");
            resolve(false);
          }
        });
      }
      resolve(true);
    });

  }

  updateProducto(producto):Promise<any> {
    return new Promise((resolve) => {
      const obj = producto;
      console.log(obj);
      if(producto!=null){
        //this.phpService.showSwAlertSucces("Producto Actualizado",`El producto "${obj.nombre}" se actualizo con exito`);
        this.phpService.update("producto",obj).subscribe((resp) => { 
          console.log(resp);
          if(resp!=null && resp.data!="error" ){
            resolve(true);
          }else{
            resolve(false);
          }  
         },(error) => {
           console.error(error);
           resolve(false);
        });
      }
    }); 
  }

  addInforme():Promise<any>{
    return new Promise((resolve) => {
      this.existeInforme().then((result) => {
        if(result==null){
          this.createInforme().then((result) => {
            if(result){
              resolve(true);
            }else{
              this.phpService.showSwAlertError("Creando informe","Ocurrio un error realizando los calculos");
              resolve(false);
            }
          });
        }else{
          resolve(true);
        }
      });
    });
  }

  createInforme(): Promise<boolean>{
    return new Promise((resolve) => {
      let obj = new Informe();
      obj.fecha=this.formVenta.value.fecha;
      this.phpService.post("informe",obj).subscribe(resp =>{
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

  existeInforme(): Promise<any>{
    return new Promise((resolve) => {
      let date = this.formVenta.value.fecha;
      this.phpService.getFecha("informe",date).subscribe(resp =>{
        if(resp!=null && resp.informe!=null){
          const inf=resp.informe;
          this.informe=inf;
          resolve(inf);
        }else{
          this.informe=null;
          resolve(null);
        }
      },(error) => {
        console.error(error);
        this.informe=null;
        resolve(null);
      });
    });
  }
}
