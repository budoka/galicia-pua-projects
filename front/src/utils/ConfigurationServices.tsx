export const getURLs = () => {
  if (!window.REACT_APP_AMBIENTE) loadLocalEnv();

  return {
    TiposDeCajas: window.REACT_APP_API_PUDA_TIPOSCAJA + baseAPIs.suffix + Routes.tiposDeCajas,
    TiposDeContenidos: window.REACT_APP_API_PUDA_TIPOSCAJA + baseAPIs.suffix + Routes.tiposDeContenidos,
    TiposDePlantillas: window.REACT_APP_API_PUDA_TIPOSPLANTILLAS + baseAPIs.suffix + Routes.tiposDePlantillas,
    DetallesDeCaja: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + Routes.detalleDeCaja,
    PedidosPendientes: window.REACT_APP_API_PUDA_PEDIDOSPENDIENTES + baseAPIs.suffix + Routes.pedidosPendientes,
    DetalleDocumento: window.REACT_APP_API_PUDA_DETALLEDOCUMENTO + baseAPIs.suffix + Routes.detalleDocumento,

    BuscarFechaVencimiento: window.REACT_APP_API_PUDA_TIPOSCAJA + baseAPIs.suffix + Routes.vencimientoCaja,
    Preview: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + Routes.preview,

    EliminarDocumento: window.REACT_APP_API_PUDA_DOCUMENTO + baseAPIs.suffix + '/v2' + Routes.eliminarDocumento,
    ActualizarDocumento: window.REACT_APP_API_PUDA_DOCUMENTO + baseAPIs.suffix + '/v2' + Routes.actualizarDocumento,
    GuardarDocumento: window.REACT_APP_API_PUDA_DOCUMENTO + baseAPIs.suffix + Routes.guardarDocumento,
    ObtenerDocumentos: window.REACT_APP_API_PUDA_DOCUMENTO + baseAPIs.suffix + Routes.obtenerDocumentos,
    ActualizarEtiquetas: window.REACT_APP_API_PUDA_ETIQUETAS + baseAPIs.suffix + Routes.actualizarEtiquetas,
    EliminarDetalle: window.REACT_APP_API_PUDA_DETALLESCAJA + baseAPIs.suffix + Routes.eliminarDetalle,
    ActualizarDetalle: window.REACT_APP_API_PUDA_DETALLESCAJA + baseAPIs.suffix + Routes.actualizarDetalle,
    AgregarDetalle: window.REACT_APP_API_PUDA_DETALLESCAJA + baseAPIs.suffix + Routes.agregarDetalle,
    GuardarContenido: window.REACT_APP_API_PUDA_CONTENIDO + baseAPIs.suffix + Routes.guardarContenido,
    InfoUsuario: window.REACT_APP_API_PUDA_INFO_USUARIO + baseAPIs.suffix + Routes.infoSesion,
    // Cajas
    CrearCaja: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + '/v2' + Routes.guardarCaja,
    BuscarCaja: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + Routes.infoCaja,
    BuscarCajas: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + Routes.buscarCajas,
    EliminarCaja: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + '/v2' + Routes.eliminarCaja,
    ActualizarCaja: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + '/v2' + Routes.actualizarCaja,
    CerrarCaja: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + Routes.cerrarCaja,

    PreviewV2: window.REACT_APP_API_PUDA_CAJA + baseAPIs.suffix + '/v2' + Routes.preview,
    // Documentos
    BuscarDocumento: window.REACT_APP_API_PUDA_CONSULTADOCUMENTO + baseAPIs.suffix + Routes.buscarDocumento,
    InfoDocumento: window.REACT_APP_API_PUDA_CONSULTADOCUMENTO + baseAPIs.suffix + Routes.infoDocumento,
    // Estados
    ObtenerEstados: window.REACT_APP_API_PUDA_ESTADO + baseAPIs.suffix + Routes.obtenerEstados,
    // Sectores
    ObtenerSectores: window.REACT_APP_API_PUDA_SECTOR + baseAPIs.suffix + Routes.obtenerSectores,
    // Solicitudes
    Solicitudes: window.REACT_APP_API_PUDA_SOLICITUDES + baseAPIs.suffix + Routes.consultaSolicitudes,
    HistorialSolicitud: window.REACT_APP_API_PUDA_SOLICITUD_ETAPA + baseAPIs.suffix + Routes.historialSolicitud,
    BuscarDocumentoPorOperacion: window.REACT_APP_API_PUDA_BUSQUEDA_OPERACION + baseAPIs.suffix + Routes.busquedaPorOperacion,
    // PROCESO
    ObtenerProcesos: window.REACT_APP_API_PUDA_PROCESO + baseAPIs.suffix + Routes.obtenerProcesos,
    // SUBPROCESO
    ObtenerSubprocesosPorProceso: window.REACT_APP_API_PUDA_SUBPROCESO + baseAPIs.suffix + Routes.obtenerSubprocesosPorProceso,
    GenerarUrlDeDigitalizacion: window.REACT_APP_API_PUDA_SUBPROCESO + baseAPIs.suffix + Routes.generarUrlDeDigitalizacion,
    // PROCESO
    ObtenerFiltrosCliente: window.REACT_APP_API_PUDA_CLIENTE_FILTRO + baseAPIs.suffix + Routes.obtenerFiltrosCliente,
    // URL Filenet
    DigitalizacionesFilenet: window.REACT_APP_API_PUDA_FILENET,

    // OBTIENE LA URL PARA VISUALIZAR EL DOC. EN FILENET
    VisualizarDocumentosFilenet: window.REACT_APP_API_PUDA_VER_DOCUMENTO + baseAPIs.suffix + Routes.visualizarDocumento,
    // Busca los documentos de filenet para un usuario
    BuscarDocumentoPorUsuario: window.REACT_APP_API_PUDA_BUSCAR_CLIENTE + baseAPIs.suffix + Routes.buscarClientes,
    ConsultaCliente: window.REACT_APP_API_PUDA_CONSULTA_CLIENTE + baseAPIs.suffix + Routes.obtenerCliente,

    // Busca el historial de operaciones para un documento en Filenet
    BuscarHistorialPorOperacion: window.REACT_APP_API_PUDA_BUSCAR_HISTORIAL_OPERACION + baseAPIs.suffix + Routes.historial,

    //CARRITO
    ObtenerCantidadCarrito: window.REACT_APP_API_PUDA_CARRITO_TEMP + baseAPIs.suffix + Routes.cantidadCarrito,
    GuardarCarrito: window.REACT_APP_API_PUDA_CARRITO_TEMP + baseAPIs.suffix + Routes.guardarEnCarrito,
    ObtenerCarrito: window.REACT_APP_API_PUDA_CARRITO + baseAPIs.suffix + Routes.obtenerCarrito,
    EliminarDelCarrito: window.REACT_APP_API_PUDA_CARRITO_TEMP + baseAPIs.suffix + Routes.eliminarDelCarrito,

    //PEDIDO
    //BuscarPedido: window.REACT_APP_API_PUDA_PEDIDO + baseAPIs.suffix + Routes.buscarPedido,
  };
};

const Routes = {
  tiposDeCajas: '/tipoCaja',
  tiposDeContenidos: '/tipoDeContenido',
  tiposDePlantillas: '/plantillasPorSector',
  detalleDeCaja: '/detalleCaja',
  pedidosPendientes: '/pedidosPendientes',
  detalleDocumento: '/detalleDocumento',
  guardarCaja: '/guardarCaja',
  vencimientoCaja: '/vencimientoCaja',
  preview: '/preview',
  infoCaja: '/infoCaja',
  buscarDocumento: '/buscarDocumentos',
  actualizarCaja: '/modificarCaja',
  cerrarCaja: '/cerrarCaja',
  eliminarCaja: '/eliminarCaja',
  eliminarDocumento: '/eliminarDocumento',
  actualizarDocumento: '/actualizarDocumento',
  guardarDocumento: '/guardarDocumento',
  obtenerDocumentos: '/obtenerDocumentos',
  actualizarEtiquetas: '/actualizarEtiquetas',
  guardarContenido: '/guardarContenido', // Guardar contenido
  eliminarDetalle: '/eliminarDetalleCaja',
  actualizarDetalle: '/actualizarDetalleCaja',
  agregarDetalle: '/guardarDetalleCaja',
  obtenerEstados: '/obtenerEstados',
  obtenerSectores: '/obtenerSectores',
  infoSesion: '/infoSesion',
  buscarCajas: '/buscarCaja',
  infoDocumento: '/detalleDocumento',
  consultaSolicitudes: '/consultaSolicitudes',
  historialSolicitud: '/historialSolicitud',
  busquedaPorOperacion: '/buscarDocumentosPorOperacion',
  obtenerProcesos: '/obtenerProcesos',
  obtenerSubprocesosPorProceso: '/obtenerSubprocesosPorProceso',
  generarUrlDeDigitalizacion: '/generarUrlDeDigitalizacion',
  obtenerFiltrosCliente: '/obtenerFiltros',
  visualizarDocumento: '/visualizarDocumento',
  buscarClientes: '/buscarDocumentosDeCliente',
  obtenerCliente: '/obtenerCliente',
  historial: '/historialOperacion',
  infoPedido: 'info-pedido',

  // carrito
  cantidadCarrito: '/totalPedidosCarrito',
  guardarEnCarrito: '/guardarEnCarrito',
  obtenerCarrito: '/obtenerPedidosDeCarrito',
  eliminarDelCarrito: '/eliminarDelCarrito',
};

const baseAPIs = {
  suffix: '',
};

const loadLocalEnv = () => {
  window.REACT_APP_AMBIENTE = 'Local';
  //console.log("Estoy en el load")

  window.REACT_APP_BASEURL = 'https://front-puda-portalunificado-dev.devcloud.bancogalicia.com.ar';

  window.REACT_APP_CLIENTID = '9c9c6d3e-b9f3-4b21-a508-75ccd2bd5236';
  window.REACT_APP_TENANT = '9eea4475-3e4a-4124-9621-552fa654f21c';

  window.REACT_APP_API_PUDA_FILENET =
    'http://dfnet1was01.bancogalicia.com.ar/navigator/?desktop=Sucursales&feature=LPAViewerFeature&sideChrome=0&lid=1&cxtID=%OPTION_SHORT_PUA%&sso=1&name=Gestiones%OPTION_PUA%&props=%SECTOR_PUA%';

  window.REACT_APP_API_PUDA_TIPOSCAJA = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/tipos-de-caja';
  window.REACT_APP_API_PUDA_TIPOSPLANTILLAS = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/plantillas-por-sector';
  window.REACT_APP_API_PUDA_DETALLESCAJA = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/detalle-caja';
  window.REACT_APP_API_PUDA_PEDIDOSPENDIENTES = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/pedidos-pendientes';
  window.REACT_APP_API_PUDA_DETALLEDOCUMENTO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/detalle-documento';
  window.REACT_APP_API_PUDA_CAJA = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/caja';
  window.REACT_APP_API_PUDA_DOCUMENTO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/documento';
  window.REACT_APP_API_PUDA_ETIQUETAS = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/etiquetas-por-caja';
  window.REACT_APP_API_PUDA_CONTENIDO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/contenido-caja';
  window.REACT_APP_API_PUDA_SOLICITUDES = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/consulta-solicitudes';
  window.REACT_APP_API_PUDA_INFO_USUARIO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/info-sesion';
  window.REACT_APP_API_PUDA_ESTADO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/estado';
  window.REACT_APP_API_PUDA_SECTOR = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/sector';
  window.REACT_APP_API_PUDA_CONSULTADOCUMENTO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/consulta-documento';
  window.REACT_APP_API_PUDA_SOLICITUD_ETAPA = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/solicitud-etapa';
  window.REACT_APP_API_PUDA_PROCESO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/proceso';
  window.REACT_APP_API_PUDA_SUBPROCESO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/subproceso';
  window.REACT_APP_API_PUDA_CLIENTE_FILTRO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/cliente-filtro';
  window.REACT_APP_API_PUDA_BUSQUEDA_OPERACION = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/consulta-operacion';
  window.REACT_APP_API_PUDA_VER_DOCUMENTO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/documento-gd';
  window.REACT_APP_API_PUDA_CONSULTA_CLIENTE = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/consulta-cliente';
  window.REACT_APP_API_PUDA_BUSCAR_CLIENTE = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/consulta-documento-cliente';
  window.REACT_APP_API_PUDA_BUSCAR_HISTORIAL_OPERACION =
    'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/consulta-operacion';
  window.REACT_APP_API_PUDA_CARRITO_TEMP = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/tmp-carrito';
  window.REACT_APP_API_PUDA_CARRITO = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/carrito';
  window.REACT_APP_API_HOJA_RUTA = 'https://bff-puda-portalunificado-dev.devcloud.bancogalicia.com.ar/infoHojaRuta';
};
