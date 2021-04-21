export function renderEstadoCaja(estado: any) {
  switch (String(estado)) {
    case 'PendienteRecepcion':
      return 'Pendiente de Recepción';
    case 'PrestadaParcialmente':
      return 'Prestada Parcialmente';
    case 'Prestada':
      return 'Prestada';
    case 'PendienteUbicacion':
      return 'Pendiente de Ubicación';
    case 'Archivada':
      return 'Archivada';
    case 'Destruida':
      return 'Destruida';
    case 'PendienteRetiro':
      return 'Pendiente de Retiro';
    case 'DevueltaARetirar':
      return 'Devuelta a Retirar';
    case 'PendienteCierre':
      return 'Pendiente de Cierre';
    default:
      return estado;
  }
}

export function renderPerfil(perfil: any) {
  switch (String(perfil)) {
    case 'Administrador':
      return 'Administrador';
    case 'Operador':
      return 'Operador';
    case 'Supervisor':
      return 'Supervisor';
    case 'OperadorArchivo':
      return 'Operador de Archivo';
    case 'SupervisorArchivo':
      return 'Supervisor de Archivo';
    case 'Auditoria':
      return 'Auditoria';
    case 'ServiciosAdministrativos':
      return 'Servicios Administrativos';
    default:
      return perfil;
  }
}

export function renderEstadoDocumento(estado: any) {
  switch (String(estado)) {
    case 'PendienteDevolverRecepcion':
      return 'Pendiente Devolución Recepción';
    case 'Recibido':
      return 'Recibido';
    case 'Prestado':
      return 'Prestado';
    case 'PrestadoParcialmente':
      return 'Prestado Parcialmente';
    case 'Ingresado':
      return 'Ingresado';
    default:
      return estado;
  }
}

export function renderEstadoPedido(estado: any) {
  switch (String(estado)) {
    case 'PendienteEnvio':
      return 'Pendiente de Envio';
    case 'EnResolucion':
      return 'En Resolución';
    case 'PendienteAtencion':
      return 'Pendiente de Atención';
    case 'PendienteResolucion':
      return 'Pendiente de Resolución';
    case 'Rechazado':
      return 'Rechazado';
    case 'Resuelto':
      return 'Resuelto';
    case 'ResueltoObservaciones':
      return 'Resuelto con Observaciones';

    default:
      return estado;
  }
}
