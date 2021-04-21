
import moment, { Moment } from 'moment';


export type Caja = {
    fechaGeneracion: Date,
    numero: string,
    estado: string,
    fechaUltimoCambioEstado: Date,
    usuario: string,
    sector: string,
    vencimiento: Moment,
    cajaDescripcion: string,
    contenidoDescripcion: string,
    plantillaDescripcion?: string,
    fechaDocumentacionDesde: Moment,
    fechaDocumentacionHasta: Moment,
    descripcion: string,
    restringido: boolean,
    

}

export const CajaExample :Caja =  {
    
        fechaGeneracion: new Date(),
        numero: '666',
        estado: 'pendiente Cierre',
        fechaUltimoCambioEstado: new Date(),
        usuario: "L0685666 - Nicolás Garcia",
        sector: "1001 - Call Center",
        vencimiento: moment(),
        cajaDescripcion: 'Caja genérica',
        contenidoDescripcion: 'Caja con Detalle',
        plantillaDescripcion: 'Plantilla General',
        fechaDocumentacionDesde: moment(),
        fechaDocumentacionHasta: moment(),
        descripcion: "lalalalalal",
        restringido: true
}
