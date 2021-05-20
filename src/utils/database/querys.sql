SELECT `ubicacion`.`ID_UBICACION`,
    `ubicacion`.`ID_CLIENTE`,
    `ubicacion`.`CIUDAD`,
    `ubicacion`.`LATITUD`,
    `ubicacion`.`LONGITUD`
FROM `shop`.`ubicacion`;

SELECT `cliente`.`ID_CLIENTE`,
    `cliente`.`DOCUMENTO`,
    `cliente`.`TIPO_DOC`,
    `cliente`.`NOMBRES`,
    `cliente`.`APELLIDOS`
FROM `shop`.`cliente`;

SELECT `producto`.`ID_PRODUCTO`,
    `producto`.`NOMBRE`,
    `producto`.`PRECIO`,
    `producto`.`STOCK`
FROM `shop`.`producto`;

SELECT `registro_venta`.`ID_REGISTRO`,
    `registro_venta`.`FECHA`,
    `registro_venta`.`ID_CLIENTE`,
    `registro_venta`.`VALOR_TOTAL_VENTA`,
    `registro_venta`.`ID_INFORME`
FROM `shop`.`registro_venta`;


SELECT `informe`.`ID_INFORME`,
    `informe`.`FECHA`,
    `informe`.`CANT_VENTAS`,
    `informe`.`VENTA_MAYOR`,
    `informe`.`VENTA_MENOR`,
    `informe`.`VENTA_PROMEDIO`
FROM `shop`.`informe`;
