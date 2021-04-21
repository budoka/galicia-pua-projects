///////////////////// Interfaces Front /////////////////////

/*export interface BoxTemplate {
  id?: number;
  columnsTemplate: BoxColumn[];
}*/

export type BoxTemplate = BoxDocumentTemplate[] | BoxDetailTemplate[] | BoxLabelTemplate[];

export interface BoxDocumentTemplate {
  id: number;
  description: string;
  inclusions: BoxDocumentColumnTemplate[];
}

export interface BoxDocumentColumnTemplate {
  title: string;
  dataType: string;
  required: string;
}

export interface BoxDetailTemplate {
  id: number;
  title: string;
  dataType: string;
  required: number;
  order: number;
  length: number;
  templateId: number;
}

export interface BoxLabelTemplate {
  id: number;
  title: string;
  legacy: number;
  version: number;
}

///////////////////// Interfaces Back /////////////////////

// REQUEST - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/preview
export interface BoxTemplateAPIRequest {
  idCaja: number;
  tipoContenido: string;
  idPlantilla?: number;
}

// RESPONSE - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/preview
export type BoxTemplateAPIResponse = BoxDocumentTemplateAPIResponse[] | BoxDetailTemplateAPIResponse[] | BoxLabelTemplateAPIResponse[];

// RESPONSE - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/preview
export interface BoxDocumentTemplateAPIResponse {
  id: number;
  descripcion: string;
  inclusiones: BoxDocumentColumnTemplateAPIResponse[];
}

export interface BoxDocumentColumnTemplateAPIResponse {
  descripcion: string;
  tipoDato: string;
  requerido: string;
}

// RESPONSE - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/preview
export interface BoxDetailTemplateAPIResponse {
  id: number;
  titulo: string;
  tipo: string;
  opcional: boolean;
  orden: number;
  longitud: number;
  idPlantilla: number;
}

// RESPONSE - https://caja-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/api/preview
export interface BoxLabelTemplateAPIResponse {
  id: number;
  descripcion: string;
  legacy: number;
  version: number;
}
