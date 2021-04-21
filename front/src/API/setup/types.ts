// Para agregar una nueva API, se debe actualizar las interfaces en el siguiente orden:
// 1) Agregar una nueva interface 'Resource<Nombre>'.
// 2) Definir los recursos necesarios dentro de la interface creada.
// 3) Definir la api dentro de la interface 'APIs', proveyendo la interface creada en el paso 1.

import { API, Resource } from '../types';

// Api List

export interface APIList {
  ABM_ENTIDADES: API<ResourcesABMEntidades>;
  ACCION: API<ResourcesAccion>;
  APLICAR_ACCION: API<ResourcesAplicarAccion>;
  CAJA: API<ResourcesCaja>;
  CARRITO: API<ResourcesCarrito>;
  CLIENTE_FILTRO: API<ResourcesClienteFiltro>;
  CONSULTA_DOCUMENTO: API<ResourcesConsultaDocumento>;
  CONSULTA_CLIENTE: API<ResourcesConsultaCliente>;
  CONSULTA_DOCUMENTO_CLIENTE: API<ResourcesConsultaDocumentoCliente>;
  CONSULTA_PEDIDOS: API<ResourcesPedidos>;
  CONSULTA_OPERACION: API<ResourcesConsultaOperacion>;
  CONSULTA_SOLICITUDES: API<ResourcesConsultaSolicitudes>;
  CONTENIDO_CAJA: API<ResourcesContenidoCaja>;
  DETALLE_CAJA: API<ResourcesDetalleCaja>;
  DETALLE_DOCUMENTO: API<ResourcesDetalleDocumento>;
  DOCUMENTO: API<ResourcesDocumento>;
  DOCUMENTO_GD: API<ResourcesDocumentoGD>;
  ESTADO: API<ResourcesEstado>;
  ETIQUETAS_CAJA: API<ResourcesEtiquetasCaja>;
  INFO_SESION: API<ResourcesInfoSesion>;
  INFO_PEDIDO: API<ResourcesInfoPedido>;
  PEDIDOS_PENDIENTES: API<ResourcesPedidosPendientes>;
  PLANTILLAS_SECTOR: API<ResourcesPlantillasSector>;
  PROCESO: API<ResourcesProceso>;
  SECTOR: API<ResourcesSector>;
  SOLICITUD_ETAPA: API<ResourcesSolicitudEtapa>;
  SUBPROCESO: API<ResourcesSubproceso>;
  TEMPORAL_CARRITO: API<ResourcesTemporalCarrito>;
  TIPOS_CAJA: API<ResourcesTiposCaja>;
  PEDIDO: API<ResourcesPedido>;
  REPORTE: API<ResourcesReporte>;
  HOJA_RUTA: API<ResourcesHojaRuta>;
}

// Resources
export interface ResourcesPedido {
  CREAR: Resource;
  //TOTAL_PEDIDOS: Resource;
  //ELIMINAR_ITEMS: Resource;
}
export interface ResourcesHojaRuta {
  CREAR: Resource;
}
export interface ResourcesReporte {
  CREAR: Resource;
  VER_REPORTE: Resource;
}

export interface ResourcesABMEntidades {
  REALIZAR_OPERACION: Resource;
}
export interface ResourcesAccion {
  OBTENER_ACCIONES: Resource;
}

export interface ResourcesAplicarAccion {
  APLICAR_ACCION: Resource;
}

export interface ResourcesCaja {
  BUSCAR_CAJA: Resource;
  DETALLE_CAJA: Resource;
  PREVIEW: Resource;
  GUARDAR_CAJA: Resource;
  MODIFICAR_CAJA: Resource;
  CERRAR_CAJA: Resource;
  ELIMINAR_CAJA: Resource;
  INFO_CAJA: Resource;
  CANTIDAD_CAJAS: Resource;
}

export interface ResourcesCarrito {
  OBTENER_CARRITO: Resource;
}

export interface ResourcesClienteFiltro {
  OBTENER_FILTROS: Resource;
}

export interface ResourcesConsultaDocumento {
  BUSCAR_DOCUMENTOS: Resource;
  DETALLE_DOCUMENTO: Resource;
}

export interface ResourcesConsultaDocumentoCliente {
  BUSCAR_DOCUMENTOS: Resource;
}

export interface ResourcesConsultaCliente {
  OBTENER_CLIENTE: Resource;
}

export interface ResourcesConsultaOperacion {
  BUSCAR_DOCUMENTOS: Resource;
  HISTORIAL_OPERACION: Resource;
}

export interface ResourcesConsultaSolicitudes {
  CONSULTA_SOLICITUDES: Resource;
  TOTAL_SOLICITUDES: Resource;
}

export interface ResourcesContenidoCaja {
  GUARDAR_CONTENIDO: Resource;
}

export interface ResourcesDetalleCaja {
  ACTUALIZAR_DETALLE: Resource;
  ELIMINAR_DETALLE: Resource;
  GUARDAR_DETALLE: Resource;
}

export interface ResourcesDetalleDocumento {
  DETALLE_DOCUMENTO: Resource;
}

export interface ResourcesDocumento {
  ACTUALIZAR_DOCUMENTO: Resource;
  CANTIDAD_DOCUMENTOS: Resource;
  DETALLE_DOCUMENTO: Resource;
  ELIMINAR_DOCUMENTO: Resource;
  GUARDAR_DOCUMENTO: Resource;
  OBTENER_DOCUMENTO: Resource;
}

export interface ResourcesDocumentoGD {
  VISUALIZAR_DOCUMENTO: Resource;
}

export interface ResourcesEstado {
  OBTENER_ESTADOS: Resource;
}

export interface ResourcesEtiquetasCaja {
  ACTUALIZAR_ETIQUETAS: Resource;
}

export interface ResourcesInfoSesion {
  INFO_SESION: Resource;
}

export interface ResourcesInfoPedido {
  INFO_PEDIDO: Resource;
  OBTENER_CONTENIDO: Resource;
}

export interface ResourcesPedidos {
  BUSCAR_PEDIDOS: Resource;
}

export interface ResourcesPedidosPendientes {
  PEDIDOS_PENDIENTES: Resource;
  CANTIDAD_PEDIDOS: Resource;
}

export interface ResourcesPlantillasSector {
  PLANTILLAS_SECTOR: Resource;
}

export interface ResourcesProceso {
  OBTENER_PROCESOS: Resource;
}

export interface ResourcesSector {
  OBTENER_SECTORES: Resource;
}

export interface ResourcesSolicitudEtapa {
  HISTORIAL_SOLICITUD: Resource;
}

export interface ResourcesSubproceso {
  OBTENER_SUBPROCESO_POR_PROCESO: Resource;
  GENERAR_URL_DIGITALIZACION: Resource;
}

export interface ResourcesTemporalCarrito {
  AGREGAR_OBSERVACIONES: Resource;
  ELIMINAR_ITEMS: Resource;
  GUARDAR: Resource;
  TOTAL_PEDIDOS: Resource;
}

export interface ResourcesTiposCaja {
  TIPO_CAJA: Resource;
  TIPO_CONTENIDO: Resource;
  VENCIMIENTO_CAJA: Resource;
}
