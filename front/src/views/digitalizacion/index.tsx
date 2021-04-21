import { Button, Col, Divider, PageHeader, Row, Select, Space, Spin } from 'antd';
import Form, { Rule } from 'antd/lib/form';
import { AxiosRequestConfig } from 'axios';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Iframe from 'react-iframe';
//import '../../index.scss';
import { getURLs } from '../../utils/ConfigurationServices';
import { FiltroCliente } from './filtro-cliente';
import { ParametrosSolicitud } from './parametros-solicitud';
import styles from './style.module.less';
import axios from 'axios';
import { ColProps } from 'antd/lib/col';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from 'src/reducers';

export interface Reglas {
  [key: string]: Rule[];
}

export const layout = {
  labelCol: {
    span: 8,
  } as ColProps,
  wrapperCol: {
    sm: { span: 12 },
    md: { span: 12 },
    lg: { span: 10 },
    xl: { span: 8 },
  } as ColProps,
};

export const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export const messageLayout = {
  row: { marginBottom: 10 },
  col: { offset: 8, sm: { span: 12 }, md: { span: 12 }, lg: { span: 10 }, xl: { span: 8 } } as ColProps,
};

export interface DigitalizacionState {
  legajo: string;
  centroCosto: number;
  hostId: number;
  idProceso: number;
  idSubproceso: number;
  idOperacion: string;
  nombreSolicitante: string;
  nombreCliente: string;
  clienteTipoDoc: string;
  documentoCliente: string;
}

interface IFrameState {
  loading?: boolean;
  loaded?: boolean;
}

type DigitalizacionRequestBody = DigitalizacionState;
type DigitalizacionResponseBody = string;

export const Digitalizacion: React.FC = () => {
  const [filtroCliente, setFiltroCliente] = useState<Pick<
    DigitalizacionState,
    'hostId' | 'clienteTipoDoc' | 'documentoCliente' | 'nombreCliente' | 'nombreSolicitante'
  > | null>();
  const [parametrosSolicitud, setParametrosSolicitud] = useState<Pick<
    DigitalizacionState,
    'idProceso' | 'idSubproceso' | 'idOperacion'
  > | null>();
  const [urlDigitalizacion, setUrlDigitazalicion] = useState<string>();
  const [iFrameState, setIFrameState] = useState<IFrameState>({});
  const sesion = useSelector((state: RootState) => state.sesion);

  useEffect(() => {
    if (filtroCliente && parametrosSolicitud) (async () => iniciarSolicitud())();
  }, [filtroCliente, parametrosSolicitud]);

  const iniciarSolicitud = async () => {

    const data: DigitalizacionRequestBody = {
      centroCosto: sesion.data.idSector!,
      legajo: sesion.data.legajo!,
      ...filtroCliente!,
      ...parametrosSolicitud!,
    };


    const urlDigitalizacion = await getUrlDigitalizacion(data);
    if (urlDigitalizacion) {
      setUrlDigitazalicion(urlDigitalizacion);
      setIFrameState({ loading: true, loaded: false });
    }
  };

  const getUrlDigitalizacion = async (data: DigitalizacionRequestBody) => {
    const endpoint = getURLs().GenerarUrlDeDigitalizacion;

    const config: AxiosRequestConfig = {
      method: 'POST',
      url: endpoint,
      data,
    };
    // Consultar servicio.
    return await axios
      .request<DigitalizacionResponseBody>(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        // message.error('Error al cargar los procesos. Por favor intente nuevamente.');
        return undefined;
      });
  };

  const onLoadIFrame = () => {
    setIFrameState({ loading: false, loaded: true });
    const iFrame = document.getElementsByTagName('iframe')[0];
    iFrame && (iFrame as HTMLIFrameElement).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <PageHeader style={{ alignSelf: 'flex-start' }} title="Digitalizaciones" />
      <Divider />
      <Space direction={'vertical'} size="middle">
        <div className={styles.form}>
          <FiltroCliente setFiltroCliente={setFiltroCliente} setParametrosSolicitud={setParametrosSolicitud} />
          {filtroCliente && <ParametrosSolicitud setParametrosSolicitud={setParametrosSolicitud} />}
        </div>
      </Space>
      {filtroCliente && parametrosSolicitud && urlDigitalizacion && (
        <>
          <Divider />
          <Spin tip="Cargando..." spinning={iFrameState.loading}></Spin>
          <Iframe
            className={styles.iframe}
            url={urlDigitalizacion}
            onLoad={onLoadIFrame}
            frameBorder={0}
            styles={{ display: iFrameState.loaded ? 'block' : 'none' }}></Iframe>
        </>
      )}
    </div>
  );
};
