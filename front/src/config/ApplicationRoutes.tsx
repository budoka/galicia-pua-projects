import { Layout } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { LoadingContent } from 'src/components/loading';
import { SearchPedido } from 'src/views/buscar-pedido';
import {
  getCajasPend,
  getDocumentosPend,
  getPedidosPend,
  getSolicitudes,
} from '../API/PendientesAPI';
import { useAzureAuth } from '../auth/hook/use-azure-auth';
import { AbrirCaja } from '../containers/layouts/AbrirCaja';
import { Digitalizaciones } from '../views/digitalizaciones';
import { EditarCaja } from '../containers/layouts/EditarCaja';
import { NavBar } from '../containers/layouts/NavBar';
import { NotFound } from '../containers/layouts/NotFound';
import { Pendientes } from '../containers/layouts/pendientes';
import SideNav from '../containers/layouts/sidebar';
import { fetchInfoSesion, setToken } from '../features/sesion/sesion.slice';
import { RootState } from '../reducers';
import { useAppDispatch } from '../store';
import { getLegajoFromMail } from '../utils/Common';
import { SearchCaja } from '../views/buscar-caja';
import { SearchDocumento } from '../views/buscar-documento';
import { BusquedasPortal } from '../views/buscar-documentos-portal';
import { Carrito } from '../views/carrito';
import { Dashboard } from '../views/dashboard';
import { Digitalizacion } from '../views/digitalizacion';
import { InfraSucursales } from '../views/infraEstructura/InfraSucursales';
import { Reportes } from 'src/views/reportes';
import { ABMTipoCaja } from 'src/views/abm/tipo_caja';
import { ABMTipoDocumento } from 'src/views/abm/tipo_documento';
import { ABMPlantilla } from 'src/views/abm/plantilla';
import { ABMClaseDocumentos } from 'src/views/abm/clase-documentos';
import { ABMEtiquetas } from 'src/views/abm/etiquetas';
import { ABMSector } from 'src/views/abm/sector';
import { fetchReportes } from 'src/features/reportes/reportes.slice';
import { Reporte } from 'src/features/reportes/types';

const { Header, Sider, Content } = Layout;
export var headers: any = undefined;

const ApplicationRoutes: React.FC = () => {
  const auth = useAzureAuth();
  const sesion = useSelector((state: RootState) => state.sesion);
  const dispatch = useAppDispatch();
  const reportes = useSelector((state: RootState) => state.reportes);


  const [collapse, setCollapse] = useState(false);

  useEffect(() => {
    window.innerWidth <= 760 ? setCollapse(true) : setCollapse(false);
  }, []);

  useEffect(() => {

    const token = auth.data?.accessToken;
    token && sesion.data.token !== token && dispatch(setToken(token));
    headers = { headers: { Authorization: 'Bearer ' + token } };
  }, [auth.data?.accessToken]);

  useEffect(() => {
    if (!auth.data) return;

    const nombreUsuario = auth.data.account.name;
    const legajo = getLegajoFromMail(auth.data.account.username)!;
    const grupos: string[] = [];
    dispatch(fetchInfoSesion({ ...headers, data: { grupos, nombreUsuario, legajo } }));
  }, [auth.data]);

  useEffect(() => {
    const idUsuario = sesion.data.idUsuario;
    if (idUsuario) dispatch(fetchReportes({ data: { nombre: 'Dashboard', parametros: { idUsuario } } }));
  }, [sesion.data.idUsuario]);

  const handleToggle = (_: any) => {
    collapse ? setCollapse(false) : setCollapse(true);
  };

  function buildItem(reporte: Reporte) {
    let api: any;
    if (reporte.Proceso === 'Cajas') api = getCajasPend;
    if (reporte.Proceso === 'Documentos') api = getDocumentosPend;
    if (reporte.Proceso === 'Pedidos') api = getPedidosPend;
    if (reporte.Proceso === 'Mis Digitalizaciones') api = getSolicitudes;
    return {
      estado: reporte.Estado,
      title: reporte.Proceso === 'Mis Digitalizaciones' ? reporte.Proceso : reporte.Item,
      proceso: reporte.Proceso,
      path: reporte.Ruta,
      api: api
    };
  };

  const DashboardItems = reportes.data.reportes.map(r => buildItem(r))

  const routes = [
    { path: "/", component: Dashboard },
    { path: "/abrirCaja", component: AbrirCaja },
    { path: "/busquedaDocumentosFilenet", component: BusquedasPortal },
    { path: "/digitalizar", component: Digitalizacion },
    { path: "/editarCaja", component: EditarCaja },
    { path: "/buscarCaja", component: SearchCaja },
    { path: "/buscarDocumento", component: SearchDocumento },
    { path: "/buscarPedido", component: SearchPedido },
    { path: "/infraSucursales", component: InfraSucursales },
    { path: "/carrito", component: Carrito },
  ]

  return !auth.disabled && !auth.data ? (
    <LoadingContent color={'#FF6600'} />
  ) : (
    <Layout>
      <Sider theme="light" trigger={null} collapsible collapsed={collapse}>
        <SideNav collapsed={collapse} />
      </Sider>
      <Layout>
        <Header className="header" style={{ padding: 0, background: '#fff', height: '50px', lineHeight: '50px', paddingRight: 24 }}>
          <NavBar collapsed={collapse} handle={handleToggle} />
        </Header>
        <Content
          style={{
            overflow: 'hidden',
            margin: '1px 1px',
            padding: 24,
            minHeight: 'calc(105vh - 128px)',
            background: '#f7f8f8',
          }}>
          <Switch>
            {
              DashboardItems.map(d => {
                return (
                  <Route
                    exact
                    path={d.path}
                    render={() => d.proceso === "Mis Digitalizaciones" ? <Digitalizaciones title={d.title} buscarEnApi={d.api} /> :
                      <Pendientes buscarEnApi={d.api} type={d.estado} title={d.title} />}
                  />
                )
              })
            }
            {
              routes.map(route => {
                return <Route exact path={route.path} component={route.component} />
              })
            }
            <Route
              exact
              path="/reportesGuardaCaja"
              render={() =>
                sesion.data.perfil === 'Administrador' || sesion.data.perfil === 'SupervisorArchivo' || sesion.data.perfil === 'Auditoria' ? (
                  <Reportes type={'CajaGuarda'} />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/reportesAltaCaja"
              render={() =>
                sesion.data.perfil === 'Administrador' || sesion.data.perfil === 'SupervisorArchivo' || sesion.data.perfil === 'Auditoria' ? (
                  <Reportes type={'CajaAlta'} />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/reportesResumenPedido"
              render={() =>
                sesion.data.perfil === 'Administrador' || sesion.data.perfil === 'SupervisorArchivo' || sesion.data.perfil === 'Auditoria' ? (
                  <Reportes type={'ResumenPedido'} />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/reportesDetallePedido"
              render={() =>
                sesion.data.perfil === 'Administrador' || sesion.data.perfil === 'SupervisorArchivo' || sesion.data.perfil === 'Auditoria' ? (
                  <Reportes type={'PedidoDetalle'} />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route exact path="/reportesHistorialProcesos" render={() => <Reportes type={'HistorialProcesos'} />} />



            <Route
              exact
              path="/tipodocumento"
              render={() =>
                sesion.data.perfil === 'Administrador' ? (
                  <ABMTipoDocumento />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/tipocaja"
              render={() =>
                sesion.data.perfil === 'Administrador' ? (
                  <ABMTipoCaja />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/plantilla"
              render={() =>
                sesion.data.perfil === 'Administrador' ? (
                  <ABMPlantilla />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />

            <Route
              exact
              path="/claseDocumento"
              render={() =>
                sesion.data.perfil === 'Administrador' ? (
                  <ABMClaseDocumentos />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/etiqueta"
              render={() =>
                sesion.data.perfil === 'Administrador' ? (
                  <ABMEtiquetas />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />
            <Route
              exact
              path="/sector"
              render={() =>
                sesion.data.perfil === 'Administrador' ? (
                  <ABMSector />
                ) : (
                  <NotFound
                    status={'403'}
                    title={'403'}
                    subTitle={'No cuenta con los permisos necesarios para acceder al contenido solicitado'}
                  />
                )
              }
            />

            <Route> {
              DashboardItems.length > 0 && routes.length > 0 &&
              <NotFound status={'404'} title={'404'} subTitle={'El contenido solicitado no existe.'} />
            }
            </Route>
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ApplicationRoutes;
