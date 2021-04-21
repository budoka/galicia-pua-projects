import { Dayjs } from 'dayjs';

///////////////////// Interfaces Front /////////////////////

export interface Box {
  id: number | null; // numero
  info: BoxInfo | null; // demás propiedades
  content: BoxContent[]; // contenido
}

export interface BoxInfo {
  stateId: string; // stateId
  userId: number; // idUsuarioAlta
  userDocket: string; // legajo
  userName: string; // nombre
  sectorId: number; // idSectorOrigen
  sectorName: string; // nombreSector
  expirationDate: Dayjs; // fechaVencimiento
  boxTypeId: number; // idTipoCaja
  contentTypeId: number; // tipoContenido
  contentDescription: string; // descripcionContenido
  templateId: number; // idPlantilla
  creationDate: Dayjs; // fechaGeneracion
  lastTransitionDate: Dayjs; // fechaUltimaTransicion
  fromDate: Dayjs; // fechaDocumentacionDesde
  toDate: Dayjs; // fechaDocumentacionHasta
  description: string; // descripcion
  restricted: number; // restringida
  boxTypeName: string; // nombreTipoCaja
  contentTypeName: string; // descripcionContenido
  templateTypeName: string; // descripcionPlantilla

  //[key: string]: string | number | boolean | null;
}

export type BoxContent = BoxDocument | BoxDetail | BoxLabel; // Equivale a una fila de la tabla

export interface BoxDocument {
  id: number;
  description: string; // descripcion
  creationDate: Dayjs; // fechaDocumental
  closingDate: Dayjs; // fechaCierre
  fromDate: Dayjs; // fechaDesde
  toDate: Dayjs; // fechaHasta
  sectorId: number; // idSectorPropietario
  documentTypeId: string; // idTipoDocumento
  // externalKey: string; // claveExterna
  productId: string; // numeroProducto
  dniCuit: string; // dniCuitTitular
  userName: string; // nombreTitular
  documentType: string; // tipoDocumental
  //[key: string]: string | number | boolean | null;
}

export interface BoxDetail {
  id: number; // id
  detail: BoxDetailData[]; // columnas
}

export interface BoxDetailData {
  value: string; // valor
  columnId: number; // idColumna
}

export interface BoxLabel {
  id: number; // id
  labelId: number; // idEtiqueta
}

///////////////////// Interfaces Back /////////////////////

// REQUEST - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/infoCaja
export interface BoxAPIRequest {
  idCaja: number;
}
// RESPONSE - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/infoCaja
export interface BoxAPIResponse {
  descripcion: string;
  descripcionContenido: string;
  descripcionPlantilla: string;
  fechaDocumentacionDesde: string;
  fechaDocumentacionHasta: string;
  fechaGeneracion: string;
  fechaUltimaTransicion: string;
  fechaVencimiento: string;
  idPlantilla: number;
  idSectorOrigen: number;
  idTipoCaja: number;
  idUsuarioAlta: number;
  legajo: string;
  nombre: string;
  nombreSector: string;
  nombreTipoCaj: string;
  numero: number;
  restringida: number;
  stateId: string;
  tipoContenido: number;
  contenido: BoxContentAPIResponse[];
}

export type BoxContentAPIResponse = BoxDocumentAPIResponse | BoxDetailAPIResponse | BoxLabelAPIResponse; // Equivale a una fila de la tabla

export interface BoxDocumentAPIResponse {
  id: number;
  descripcion: string; // descripcion
  fechaDocumental: Dayjs; // fechaDocumental
  fechaCierre: Dayjs; // fechaCierre
  fechaDesde: Dayjs; // fechaDesde
  fechaHasta: Dayjs; // fechaHasta
  idSectorPropietario: number; // idSectorPropietario
  idTipoDocumento: string; // idTipoDocumento
  claveExterna: string; // claveExterna                   // # Ver con Pablo. Qué es?
  numeroProducto: string; // numeroProducto
  dniCuitTitular: string; // dniCuitTitular
  nombreTitular: string; // nombreTitular
  tipoDocumental: string; // tipoDocumental
  //[key: string]: string | number | boolean | null;
}

export interface BoxDetailAPIResponse {
  id: number; // id
  columnas: BoxDetailDataAPIResponse[];
}

export interface BoxDetailDataAPIResponse {
  valor: string; // valor
  idColumna: number; // idColumna
}

export interface BoxLabelAPIResponse {
  id: number; // id
  idEtiqueta: number; // idEtiqueta
}

// REQUEST - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/guardarCaja
export interface BoxInfoAPIRequest {
  descripcion: string;
  fechaDesde: string;
  fechaHasta: string;
  fechaGeneracion: string;
  fechaVencimiento: string;
  idPlantilla: number;
  idSectorOrigen: number;
  idTipoCaja: number;
  idUsuarioAlta: number;
  restringida: number;
  tipoContenido: string;
}

// REQUEST - https://documento-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/guardarDocumento
// REQUEST - https://contenido-caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/guardarContenido
export interface BoxDocumentAPIRequest {
  claveExterna: string;
  detalle: string;
  dniCuitTitular: string;
  fechaAlta: Dayjs;
  fechaCierre: Dayjs;
  fechaDesde: Dayjs;
  fechaDocumental: Dayjs;
  fechaHasta: Dayjs;
  fechaUltimaTransicion?: Dayjs; // # Ver con Pablo. Está definida solo para la caja.
  fechaVencimiento?: Dayjs; // # Ver con Pablo. Está definida solo para la caja.
  id: number;
  idCaja: number;
  idSectorOrigen: number; // # Ver con Pablo. Está definida solo para la caja.
  idSectorPropietario?: number; // # Ver con Pablo. Está definida solo para la caja.
  idSectorTenedor?: number; // # Ver con Pablo. Qué es?
  idTipoDocumento: number;
  idUsuarioAlta?: number; // # Ver con Pablo. Está definida solo para la caja.
  nombreTitular: string;
  numeroProducto: string;
  stateId: string;
  tipoDocumental: string;
  // tipoPeriodo: number;             // # Ver con Pablo. Qué es?
}

export interface BoxDetailAPIRequest {
  idCaja: number; // id
  idPlantilla: number; // id
  columnas: BoxDetailDataAPIResponse[];
}

export interface BoxDetailColumnAPIRequest {
  valor: string; // valor
  idColumna: number; // idColumna
}

// REQUEST - https://documento-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/guardar????    # URL? y como es la estructura?
/*export interface BoxDetailAPIRequest {
  /* idUsuarioAlta: number;                
  idSectorOrigen: number;
  idTipoCaja: number;
  tipoContenido: string;
  idPlantilla: number;
  descripcion: string;
  fechaDesde: string;
  fechaHasta: string;
  fechaGeneracion: string;
  fechaVencimiento: string;
  restringida: number;
}*/

// REQUEST - https://documento-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/actualizarEtiquetas
export interface BoxLabelAPIRequest {
  idCaja: number;
  idsEtiquetas: number[];
}
