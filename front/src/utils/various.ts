/**
 * Sleep a function.
 * @param ms Milliseconds
 */
export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const sortByRol = (a: { id: number; descripcion: string; nombre: string }, b: { id: number; descripcion: string; nombre: string }): number => {
  const aDescripcion = a.descripcion;
  switch (b.descripcion) {
    case 'Administrador':
      return 1;
    case 'ServiciosAdministrativos':
      return aDescripcion === 'Administrador' ? -1 : 1;
    case 'Auditoria':
      return aDescripcion === 'Administrador' || aDescripcion === 'ServiciosAdministrativos' ? -1 : 1;
    case 'SupervisorArchivo':
      return aDescripcion === 'Administrador' || aDescripcion === 'ServiciosAdministrativos' || aDescripcion === 'Auditoria' ? -1 : 1;
    case 'OperadorArchivo':
      return aDescripcion === 'Administrador' || aDescripcion === 'ServiciosAdministrativos' || aDescripcion === 'Auditoria' || aDescripcion === 'SupervisorArchivo' ? -1 : 1;
    case 'Supervisor':
      return aDescripcion === 'Administrador' || aDescripcion === 'ServiciosAdministrativos' || aDescripcion === 'Auditoria' || aDescripcion === 'SupervisorArchivo' || aDescripcion === 'OperadorArchivo' ? -1 : 1;
    case 'Operador':
      return aDescripcion === 'Operador' ? 1 : -1;
    default:
      return -1;

  }
}
