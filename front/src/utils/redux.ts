import { store } from 'src/store';

//return store.getState().sesion.data.perfil ??
export const getPerfilUsuario = () => {
  return {
    idUsuario:
      store.getState().sesion.data.idUsuario ??
      JSON.parse(JSON.parse(localStorage.getItem('persist:AppStore')! ?? {}).sesion).data?.idUsuario,
    roles: store.getState().sesion.data.roles ?? JSON.parse(JSON.parse(localStorage.getItem('persist:AppStore')! ?? {}).sesion).data?.roles,
    sector:
      store.getState().sesion.data.idSector ??
      JSON.parse(JSON.parse(localStorage.getItem('persist:AppStore')! ?? {}).sesion).data?.idSector,
  }; // store.getState().sesion.data.perfil ?? JSON.parse(JSON.parse(localStorage.getItem('persist:AppStore')! ?? {}).sesion).data?.perfil;
};

/*
      idUsuario: responseData.idUsuario,
      idSector: responseData.idSector,
      nombreSector: responseData.descripcionSector,
      perfil: responseData.roles && responseData.roles.length > 0 ? responseData.roles[0].descripcion : undefined, // Ordenado
      roles: responseData.roles && responseData.roles.length > 0 ? responseData.roles.map(r => r.descripcion) : undefined,
      legajo: config.data?.legajo,
      nombreUsuario: config.data?.nombreUsuario,
*/
