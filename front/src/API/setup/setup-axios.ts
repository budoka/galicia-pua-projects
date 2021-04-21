import * as retryAxios from 'retry-axios';
import axios from 'axios';
import { useAzureAuth } from 'src/auth/hook/use-azure-auth';
import { useAppDispatch } from 'src/store';


retryAxios.attach(axios);
axios.defaults.timeout = 30000;
axios.defaults.headers = {
  'content-type': 'application/json',
  accept: 'application/json',
  //Authorization: 'Bearer ' + useAzureAuth().data?.accessToken
  //'PUA-Profile': getPerfilUsuario(),
};
axios.defaults.raxConfig = {
  retry: 5,
  retryDelay: 1000,
  backoffType: 'static',
  httpMethodsToRetry: ['GET', 'POST', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'],
};
