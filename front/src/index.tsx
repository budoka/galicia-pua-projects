//require('es6-promise').polyfill();
import "core-js/stable";
import "regenerator-runtime/runtime";
import 'babel-polyfill';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'es6-promise/auto';
import React from 'react';
import ReactDOM from 'react-dom';
// import '@fortawesome/fontawesome-free/css/all.min.css';
//import 'bootstrap-css-only/css/bootstrap.min.css';
// import './assets/scss/mdb-free.scss';
//import 'bootstrap/dist/css/bootstrap.min.css';
// import 'antd/dist/antd.css';
import './API/setup/setup-axios';
import 'src/styles/global.less';
// import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// const authModule: AuthModule = new AuthModule();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// export { authModule };
