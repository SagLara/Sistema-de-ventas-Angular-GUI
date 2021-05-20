import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Informe } from '../../models/informe';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.css']
})
export class InformesComponent implements OnInit {

  informe: Informe=null;
  buscar: boolean =true;
  formInforme:FormGroup;

  constructor(public phpService: ApiService) { }

  ngOnInit(): void {
    this.formInforme = new FormGroup({
      id: new FormControl(),
      fecha: new FormControl(),
      cant_ventas: new FormControl(),
      venta_mayor: new FormControl(),
      venta_menor: new FormControl(),
      venta_promedio: new FormControl(),
    });

  }

  buscarInforme(){

    let fecha = this.formInforme.value.fecha;
    console.log(fecha);
    
    this.phpService.getFecha("informe",fecha).subscribe(resp =>{
      console.log(resp); 
      if(resp!=null && resp.informe!=null){
        const {id,fecha,cant_ventas, venta_mayor, venta_menor,venta_promedio} = resp.informe;
        this.informe=resp.informe;
        this.formInforme.setValue({id,fecha,cant_ventas, venta_mayor, venta_menor,venta_promedio});
        this.buscar=false;
        console.log(this.informe); 
      }else{
        this.phpService.showSwAlertError("Fecha No existe","No hay un informe para le fecha ingresada");
      }
    },(error) => {
      console.error(error);
    });
  }


}
