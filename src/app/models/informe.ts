export class Informe{
    id: number;
    fecha: Date;
    cant_ventas: number;
    venta_mayor: number;
    venta_menor: number;
    venta_promedio: number;
    constructor(){
        this.cant_ventas=0;
        this.venta_mayor=0;
        this.venta_menor=0;
        this.venta_promedio=0;
    }
}