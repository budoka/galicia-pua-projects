import { ConfigProvider } from 'antd';
import locale from 'antd/es/locale/es_ES';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthProvider } from './auth/hook/use-azure-auth';
import ApplicationRoutes from './config/ApplicationRoutes';
import { history, persistor, store } from './store';

declare global {
  interface Window {
    store: any;

    REACT_APP_AMBIENTE: string;
    REACT_APP_CLIENTID: string;
    REACT_APP_TENANT: string;
    REACT_APP_BASEURL: string;
    REACT_APP_AUTHORITY_URL: string;
    REACT_APP_GALICIA_CDN_URL: string;
    REACT_APP_API_PUDA_TIPOSCAJA: string;
    REACT_APP_API_PUDA_TIPOSPLANTILLAS: string;
    REACT_APP_API_PUDA_DETALLESCAJA: string;
    REACT_APP_API_PUDA_PEDIDOSPENDIENTES: string;
    REACT_APP_API_PUDA_DETALLEDOCUMENTO: string;
    REACT_APP_API_PUDA_DOCUMENTO: string;
    REACT_APP_API_PUDA_CAJA: string;
    REACT_APP_API_PUDA_PEDIDO: string;
    REACT_APP_API_COMMON_BASEURL: string;
    REACT_APP_API_SAPP_BASEURL: string;
    REACT_APP_API_PUDA_ETIQUETAS: string;
    REACT_APP_API_PUDA_CONTENIDO: string;
    REACT_APP_API_PUDA_SOLICITUDES: string;
    REACT_APP_API_PUDA_SOLICITUD_ETAPA: string;
    REACT_APP_API_PUDA_INFO_USUARIO: string;
    REACT_APP_API_PUDA_CONSULTADOCUMENTO: string;
    REACT_APP_API_PUDA_ESTADO: string;
    REACT_APP_API_PUDA_SECTOR: string;
    REACT_APP_API_PUDA_BUSQUEDA_OPERACION: string;
    REACT_APP_API_PUDA_PROCESO: string;
    REACT_APP_API_PUDA_SUBPROCESO: string;
    REACT_APP_API_PUDA_CLIENTE_FILTRO: string;
    REACT_APP_API_PUDA_FILENET: string;
    REACT_APP_API_PUDA_VER_DOCUMENTO: string;
    REACT_APP_API_PUDA_BUSCAR_CLIENTE: string;
    REACT_APP_API_PUDA_BUSCAR_HISTORIAL_OPERACION: string;
    REACT_APP_API_PUDA_CARRITO_TEMP: string;
    REACT_APP_API_PUDA_CARRITO: string;
    REACT_APP_API_HOJA_RUTA: string;
  }

}

// Unicode polyfill for IE
/*const rewritePattern = require("regexpu-core");
const {
  generateRegexpuOptions,
} = require("@babel/helper-create-regexp-features-plugin/lib/util");

const { RegExp } = global;
try {
  new RegExp("a", "u");
} catch (err) {
  // @ts-ignore
  global.RegExp = function(pattern, flags) {
    if (flags && flags.includes("u")) {
      return new RegExp(
        rewritePattern(
          pattern,
          flags,
          generateRegexpuOptions({ flags, pattern }),
        ),
      );
    }
    return new RegExp(pattern, flags);
  };
  // @ts-ignore
  global.RegExp.prototype = RegExp;
}*/

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider locale={locale}>
          <ConnectedRouter history={history}>
            <AuthProvider>
              <ApplicationRoutes />
            </AuthProvider>
          </ConnectedRouter>
        </ConfigProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

window.store = () => store.getState();

export default App;
