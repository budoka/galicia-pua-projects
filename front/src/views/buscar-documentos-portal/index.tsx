import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Alert, Button, Collapse, Divider, Form, Input, message, Modal, PageHeader, Radio, Select, Table, Tooltip } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { SelectValue } from 'antd/lib/select';
import { valueType } from 'antd/lib/statistic/utils';
import Column from 'antd/lib/table/Column';
import { TableRowSelection } from 'antd/lib/table/interface';
import axios, { CancelTokenSource } from 'axios';
import _ from 'lodash';
import { default as Moment } from 'moment';
import React, { ReactText, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { Loading } from 'src/components/loading';
import { ColumnTypeEx } from 'src/components/table';
import { TableModal } from 'src/components/table-modal';
import { Texts } from 'src/constants/texts';
import { addToCarrito } from 'src/features/carrito/carrito.slice';
import { DocumentoCarrito } from 'src/features/carrito/types';
import { useAppDispatch } from 'src/store';
import { IElement } from 'src/types';
import { renderValidation } from 'src/utils/cart';
import { compare } from 'src/utils/string';
import {
  obtenerDocumentosPorOperacion,
  obtenerDocumentosPorUsuario,
  obtenerHistorialOperacion,
  visualizar,
} from '../../API/DigitalizacionesAPI';
import { IFilterItem, IFilterItemExtended } from '../../components/filter-input/types';
import { RootState } from '../../reducers';
import clientes from './clientes.json';
import procesos from './procesos.json';
import styles from './style.module.less';

const options = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Operación', value: 'operacion' },
];

const clientesColumns = [
  {
    title: 'Nombre',
    dataIndex: 'nombre',
    key: 'nombre',
    sorter: { compare: (a, b) => compare(a.nombre, b.nombre) },
  },
  {
    title: 'Documento',
    dataIndex: 'documento',
    key: 'documento',
    sorter: { compare: (a, b) => compare(+a.documento, +b.documento), multiple: -1 },
  },
  {
    title: 'Domicilio',
    dataIndex: 'domicilio',
    key: 'domicilio',
    sorter: { compare: (a, b) => compare(a.domicilio, b.domicilio) },
  },
] as ColumnTypeEx<Cliente>[]

const previewColumns = [
  {
    key: 'id',
    dataIndex: 'id',
    title: 'Id',
    width: 100,
    sorter: { compare: (a, b) => compare(+a.id, +b.id), multiple: -1 },
  },
  {
    key: 'state',
    dataIndex: 'state',
    title: 'Estado',
    width: 200,
    sorter: { compare: (a, b) => compare(a.pedido, b.pedido), multiple: -1 },
  },
  {
    key: 'alta',
    dataIndex: 'alta',
    title: 'Fecha Alta',
    width: 200,
    sorter: { compare: (a, b) => compare(a.alta, b.alta), multiple: -1 },
  },
  {
    key: 'descripcion',
    dataIndex: 'descripcion',
    title: Texts.VALIDATION,
    width: 300,
    sorter: { compare: (a, b) => compare(a.descripcion, b.descripcion), multiple: -1 },
  },
] as ColumnTypeEx<PreviewDocumentoPortalCarrito>[];

export interface PreviewDocumentoPortalCarrito extends IElement {
  id: number;
  alta: string;
  state: string;
  estado: 'Ok' | 'Warning' | 'Error';
  descripcion: string;
};

export interface Cliente extends IElement {
  nombre: string;
  documento: string;
  domicilio: string;
  idHost: string
};

const CancelToken = axios.CancelToken;
let source: CancelTokenSource;

export const BusquedasPortal: React.FC = () => {
  const [panelActive, setPanelActive] = useState<string | string[]>('1');
  const [currentValue, setCurrentValue] = useState('cliente');
  const [proccessFilters, setProccessFilters] = useState<IFilterItem[]>(procesos);
  const [clientesFilters, setClientesFilters] = useState<IFilterItemExtended[]>(clientes);
  const [subProccessFilters, setSubProccessFilters] = useState<any[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState<IFilterItemExtended | undefined>(clientes[0]);
  const [tipoDocumentoValue, setTipoDocumentoValue] = useState<string | number>();
  const [proccessValue, setProccessValue] = useState<string>();
  const [subProccessValue, setSubProccessValue] = useState<string>();
  const [tipoDocumental, setTipoDocumental] = useState<valueType>();
  const [operacion, setOperacion] = useState<valueType>();
  const [inputError, setInputError] = useState<boolean>(false);
  const formRef = useRef<FormInstance>(null);
  const [documents, setDocuments] = useState<Documento[]>();
  const [selectedDocuments, setSelectedDocuments] = useState<PreviewDocumentoPortalCarrito[]>([]);
  const [clientesDocuments, setClientesDocuments] = useState<Cliente[]>([]);
  const [currentClient, setCurrentClient] = useState<Cliente>();
  const [visible, setVisible] = useState(false);
  const [visibleNombreYApellido, setVisibleNombreYApellido] = useState(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]); // Guardo estado de los checks
  const [searching, setSearching] = useState<boolean>(false);
  const [loadingOperacion, setLoadingOperacion] = useState<number | null>(null);
  const [userAlert, setUserAlert] = useState<boolean>(false);
  const [disabledOkButton, setDisabledOkButton] = useState(false);
  const sesion = useSelector((state: RootState) => state.sesion);
  const carrito = useSelector((state: RootState) => state.carrito);
  const dispatch = useAppDispatch();

  const { Panel } = Collapse;
  const { Option } = Select;

  useEffect(() => {
    const previewPedidos = carrito.data.preview?.pedidos;
    if (previewPedidos) {
      const pedidos: PreviewDocumentoPortalCarrito[] = _(selectedDocuments)
        .keyBy('id')
        .merge(_.keyBy(previewPedidos, 'id'))
        .values()
        .value();

      setSelectedDocuments(pedidos);
    }
  }, [carrito.data.preview?.pedidos]);

  useEffect(() => {
    if (!visible) cancelRequest();
  }, [visible]);

  const cancelRequest = () => {
    if (source) source.cancel();
  };

  const tailLayout = {
    margin: '5px',
    wrapperCol: { offset: 9, span: 16 },
    ItemCol: { span: 18, offset: 4, xs: { span: 4 }, sm: { span: 4 }, margin: '5px' },
  };

  const layout = {
    ItemCol: {
      span: 18,
      offset: 4,
      xs: { span: 4 },
      sm: { span: 4 },
      align: 'center',
    },
    labelCol: {
      span: 18,
      offset: 6,
      align: 'center',
      xs: { span: 4 },
      sm: { span: 4 },
    },

    wrapperCol: {
      span: 2,
      xs: { span: 4 },
      sm: { span: 4 },
    },
  };

  const mergedColumns = previewColumns.map((column) => {
    if (column.key === 'descripcion') {
      return {
        ...column,
        render: (value: React.ReactNode, record: PreviewDocumentoPortalCarrito) =>
          carrito.loading ? <Loading /> : renderValidation(record),
      };
    } else return column;
  });

  const toDocument = (doc: any) => {
    if (doc) {
      return {
        key: doc.idDocumento,
        descripcion: doc.descripcionCorta,
        alta: doc.fechaAlta,
        estado: doc.idEstado,
        tipoPedido: doc?.documento,
        idFilenet: doc.idFilenet ? doc.idFilenet : undefined,
      };
    }
  };

  const toDocuments = (response: any[]): any[] => {
    return response.filter((r) => r != null).map((r: any) => toDocument(r));
  };

  const obtenerDocsPorOperacion = async () => {
    message.loading('Buscando...');
    obtenerDocumentosPorOperacion(proccessValue as valueType, subProccessValue as valueType, operacion as valueType, tipoDocumental)
      .then((response) => {
        setSearching(true);
        setSelectedRowKeys([]);
        setDocuments(toDocuments(response));
        setPanelActive('2');
        setSearching(false);
      })
      .catch((e) => {
        if (e.response.status === 422) {
          message.error('Error en los parametros al llamar al servicio busq. por Operación');
        } else if (e.response.status === 400) {
          message.error('No existe el servicio que intenta utilizar');
        } else {
          message.error('Ocurrió un error buscando doc. por Operación. Vuelva a intentarlo');
        }
        setSearching(false);
      })
    message.destroy();
  };

  const obtenerIdHost = async (data: any, handle: (data: any) => void) => {
    var api = apis['CONSULTA_CLIENTE'];
    var res = api.resources['OBTENER_CLIENTE'];
    const axiosConfig = buildAxiosRequestConfig(api, res, { data });
    try {
      const response = await axios.request<any>(axiosConfig);
      handle(response.data);
    } catch (error) {
      onErrorClientes(error.response?.status)
    }
  };

  const dataToCliente = (data: any) => {
    return {
      nombre: data.nombre ? data.nombre + " " + (data.apellido ? data.apellido : "") : (data.razonSocial ? data.razonSocial : ""),
      documento: data.numeroDocumento ? data.numeroDocumento : "",
      domicilio: data.direccion ? data.direccion + " " + (data.numero ? data.numero : "") + " " + (data.piso ? data.piso : "") : "",
      idHost: data.idHost,
      key: data.idHost
    }
  };
  const toClientes = (contents: any[]): Cliente[] => {
    var result = contents.map((data) => dataToCliente(data));
    return result;
  };

  const obtenerClientes = (response: any[]) => {
    if (response.length === 1) {
      setCurrentClient(dataToCliente(response[0]));
      obtenerDocumentosPorIdHost(response[0].idHost);
    }
    else {
      if (response.length > 1) {
        setVisibleNombreYApellido(true)
        setClientesDocuments(toClientes(response))
        setSearching(false);
      }
      else {
        message.error("No existe el cliente para esa búsqueda");
        message.destroy();
        setSearching(false);
      }
    }
  };

  const onErrorClientes = (status: any) => {
    setSearching(false);
    if (status === '422') {
      message.error('Error en los parametros al llamar al servicio');
    }
    else if (status === '400') {
      message.error('No existe el servicio que intenta utilizar');
    }
    else {
      message.error('Ocurrió un error buscando el cliente. Vuelva a intentarlo');
    }
  };

  const obtenerIdHostPorFiltro = (filtro: string, value: number) => {
    const data = { filtro: filtro, documento: value, legajo: sesion.data.legajo };
    obtenerIdHost(data, obtenerClientes);
  };

  const obtenerDocsPorCliente = async (values: any) => {
    if (tipoDocumento && tipoDocumento.wsField === 'nombre' && tipoDocumento.wsField2) {
      const data = { filtro: 'PorNombreApellido', nombre: values[tipoDocumento.wsField], apellido: values[tipoDocumento.wsField2], legajo: sesion.data.legajo };
      await obtenerIdHost(data, obtenerClientes);
    };
    if (tipoDocumento && tipoDocumento.wsField === 'razonSocial') {
      const data = { filtro: 'PorRazonSocial', razonSocial: values[tipoDocumento.wsField], tipoBusqueda: 2, legajo: sesion.data.legajo };
      await obtenerIdHost(data, obtenerClientes);
    }
    if (tipoDocumento && tipoDocumento.wsField === 'cuit') {
      obtenerIdHostPorFiltro('CUIT', parseInt(values[tipoDocumento.wsField]));
    }
    if (tipoDocumento && tipoDocumento.wsField === 'cuil') {
      obtenerIdHostPorFiltro('CUIL', parseInt(values[tipoDocumento.wsField]));
    }
    if (tipoDocumento && tipoDocumento.wsField === 'du') {
      obtenerIdHostPorFiltro('DU', values[tipoDocumento.wsField].padStart(9, '0'));
    }
    if (tipoDocumento && tipoDocumento.wsField === 'ci') {
      obtenerIdHostPorFiltro('CI', values[tipoDocumento.wsField].padStart(9, '0'));
    }
    if (tipoDocumento && tipoDocumento.wsField === 'le') {
      obtenerIdHostPorFiltro('LE', values[tipoDocumento.wsField].padStart(9, '0'));
    }
    if (tipoDocumento && tipoDocumento.wsField === 'lc') {
      obtenerIdHostPorFiltro('LC', values[tipoDocumento.wsField].padStart(9, '0'));
    }
  };

  const onClickRow = (client: any) => {
    return {
      onClick: () => {
        setCurrentClient(client);
        setLoadingTable(true);
        obtenerDocumentosPorIdHost(client.idHost);
      },
    };
  };

  const obtenerDocumentosPorIdHost = async (idHost: any) => {
    message.loading('Buscando...', 1.5);
    await obtenerDocumentosPorUsuario(idHost, tipoDocumental)
      .then((res) => {
        setSearching(false);
        setSelectedRowKeys([]);
        setDocuments(toDocuments(res));
        setVisibleNombreYApellido(false);
        setLoadingTable(false);
        setPanelActive('2');
        setUserAlert(true);
      })
      .catch((e) => {
        message.error("Ocurrió un error buscando los documentos. Vuelva a intentarlo")
        setSearching(false);
        setVisibleNombreYApellido(false);
        setLoadingTable(false);
      })
  };

  const onFinish = (values: any) => {
    switch (tipoDocumento && tipoDocumento.wsField) {
      case 'cuit': {
        if (tipoDocumentoValue && tipoDocumentoValue.toString().length !== 11) {
          setInputError(true);
          return;
        }
        break;
      }
      case 'cuil': {
        if (tipoDocumentoValue && tipoDocumentoValue.toString().length !== 11) {
          setInputError(true);
          return;
        }
        break;
      }
      case 'du': {
        if (tipoDocumentoValue && tipoDocumentoValue.toString().length > 9) {
          setInputError(true);
          return;
        }
        break;
      }
      case 'le': {
        if (tipoDocumentoValue && tipoDocumentoValue.toString().length > 9) {
          setInputError(true);
          return;
        }
        break;
      }
      case 'lc': {
        if (tipoDocumentoValue && tipoDocumentoValue.toString().length > 9) {
          setInputError(true);
          return;
        }
        break;
      }
      case 'ci': {
        if (tipoDocumentoValue && tipoDocumentoValue.toString().length > 9) {
          setInputError(true);
          return;
        }
        break;
      }
    }
    setInputError(false);
    setSearching(true);
    setSelectedRowKeys([]);
    setUserAlert(false);
    if (currentValue === 'cliente') {
      obtenerDocsPorCliente(values);
    }
    if (currentValue === 'operacion') {
      obtenerDocsPorOperacion();
    }
  };

  const resetCliente = () => {
    setTipoDocumento(clientes[0]);
    setTipoDocumentoValue(undefined);
  };

  const resetOperacion = () => {
    setOperacion(undefined);
    setProccessValue(undefined);
    setSubProccessValue(undefined);
  };

  const onReset = () => {
    formRef.current && formRef.current.resetFields();
    resetCliente();
    resetOperacion();
    setDocuments(undefined);
    setSelectedRowKeys([]);
    setUserAlert(false);
    setTipoDocumental(undefined);
  };

  const onChangeCheck = (id: string) => {
    setSelectedRowKeys([]);
    setCurrentValue(id);
    onReset();
  };

  const findTipoDocumental = (id: SelectValue): IFilterItem | undefined => {
    return clientesFilters.find((c) => c.wsField === id);
  };

  const onTipoDocumentoChange = (filter: SelectValue) => {
    setInputError(false);
    setTipoDocumento(findTipoDocumental(filter));
  };

  const findSubProccess = (idProceso: string): any[] => {
    var subProccess: any[] = [];
    var proccess = proccessFilters.find((f) => f.wsField === idProceso);
    if (proccess && proccess.listValues) {
      subProccess = proccess.listValues;
    }
    return subProccess;
  };

  const onSubProccessChange = (id: string) => {
    setSubProccessValue(id);
  };

  const onProccessChange = (id: string) => {
    setProccessValue(id);
    if (id) {
      setSubProccessFilters(findSubProccess(id));
    } else {
      setSubProccessValue(undefined);
    }
    formRef.current && formRef.current.resetFields(['subproceso']);
  };

  const renderTipoDocumentoElegido = (): JSX.Element => {
    switch (tipoDocumento && tipoDocumento.wsField) {
      case 'cuit':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            hasFeedback={tipoDocumentoValue ? tipoDocumentoValue.toString().length === 11 : undefined}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}
            validateStatus={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 11
                ? 'error'
                : tipoDocumentoValue && tipoDocumentoValue.toString().length < 11 && inputError
                  ? 'error'
                  : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                    ? 'error'
                    : undefined
            }
            help={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 11
                ? `${tipoDocumento?.label} debe tener 11 digitos`
                : tipoDocumentoValue && tipoDocumentoValue.toString().length < 11 && inputError
                  ? `${tipoDocumento?.label} debe tener 11 digitos`
                  : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                    ? `${tipoDocumento?.label} es requerido`
                    : undefined
            }>
            <Input
              value={tipoDocumentoValue}
              type={tipoDocumento && tipoDocumento.type}
              min={0}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      case 'cuil':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            hasFeedback={tipoDocumentoValue ? tipoDocumentoValue.toString().length === 11 : undefined}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}
            validateStatus={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 11
                ? 'error'
                : tipoDocumentoValue && tipoDocumentoValue.toString().length < 11 && inputError
                  ? 'error'
                  : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                    ? 'error'
                    : undefined
            }
            help={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 11
                ? `${tipoDocumento?.label} debe tener 11 digitos`
                : tipoDocumentoValue && tipoDocumentoValue.toString().length < 11 && inputError
                  ? `${tipoDocumento?.label} debe tener 11 digitos`
                  : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                    ? `${tipoDocumento?.label} es requerido`
                    : undefined
            }>
            <Input
              value={tipoDocumentoValue}
              type={tipoDocumento && tipoDocumento.type}
              min={0}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      case 'du':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}
            hasFeedback={tipoDocumentoValue ? tipoDocumentoValue.toString().length > 9 : undefined}
            validateStatus={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? 'error'
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? 'error'
                  : undefined
            }
            help={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? `${tipoDocumento?.label} debe contar con 9 digitos`
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? `${tipoDocumento?.label} es requerido`
                  : undefined
            }>
            <Input
              value={tipoDocumentoValue}
              min={0}
              type={tipoDocumento && tipoDocumento.type}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      case 'le':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}
            validateStatus={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? 'error'
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? 'error'
                  : undefined
            }
            help={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? `${tipoDocumento?.label} debe contar con 9 digitos`
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? `${tipoDocumento?.label} es requerido`
                  : undefined
            }
          >
            <Input
              min={0}
              value={tipoDocumentoValue}
              type={tipoDocumento && tipoDocumento.type}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      case 'ci':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}
            validateStatus={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? 'error'
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? 'error'
                  : undefined
            }
            help={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? `${tipoDocumento?.label} debe contar con 9 digitos`
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? `${tipoDocumento?.label} es requerido`
                  : undefined
            }
          >
            <Input
              min={0}
              value={tipoDocumentoValue}
              type={tipoDocumento && tipoDocumento.type}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      case 'lc':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}
            validateStatus={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? 'error'
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? 'error'
                  : undefined
            }
            help={
              tipoDocumentoValue && tipoDocumentoValue.toString().length > 9
                ? `${tipoDocumento?.label} debe contar con 9 digitos`
                : tipoDocumentoValue && tipoDocumentoValue.toString().length === 0
                  ? `${tipoDocumento?.label} es requerido`
                  : undefined
            }
          >
            <Input
              min={0}
              value={tipoDocumentoValue}
              type={tipoDocumento && tipoDocumento.type}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      case 'nombre':
        return (
          <>
            <Form.Item
              name={tipoDocumento && tipoDocumento.wsField}
              label={tipoDocumento && tipoDocumento.label1}
              rules={[{ required: true, message: `${tipoDocumento?.label1} es requerido` }]}>
              <Input
                value={tipoDocumentoValue}
                type={tipoDocumento && tipoDocumento.type}
                onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
              />
            </Form.Item>
            <Form.Item
              name={tipoDocumento && tipoDocumento.wsField2}
              label={tipoDocumento && tipoDocumento.label2}
              rules={[{ required: true, message: `${tipoDocumento?.label2} es requerido` }]}>
              <Input
                value={tipoDocumentoValue}
                type={tipoDocumento && tipoDocumento.type2}
                onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
              />
            </Form.Item>
          </>
        );
      case 'razonSocial':
        return (
          <Form.Item
            name={tipoDocumento && tipoDocumento.wsField}
            label={tipoDocumento && tipoDocumento.label}
            rules={[{ required: true, message: `${tipoDocumento?.label} es requerido` }]}>
            <Input
              value={tipoDocumentoValue}
              type={tipoDocumento && tipoDocumento.type}
              onChange={(e) => setTipoDocumentoValue(e.currentTarget.value)}
            />
          </Form.Item>
        );
      default:
        return <></>;
    }
  };

  const renderAlertUser = () => {
    if (userAlert) {
      return (
        <Alert
          style={{ fontWeight: 'bold', textAlign: 'center' }}
          message={`Nombre: ${currentClient && currentClient.nombre ? currentClient.nombre : '-'} | DU: ${currentClient && currentClient.documento ? currentClient.documento : '-'} 
          | Ubicación: ${currentClient && currentClient.domicilio ? currentClient.domicilio : '-'}`}
          type={'success'}
        />
      );
    } else {
      return undefined;
    }
  };

  const addToCart = (documento?: DocumentoCarrito) => {
    const documentos: DocumentoCarrito[] = selectedDocuments.map((data) => ({ id: data.id }));
    source = CancelToken.source();
    dispatch(
      addToCarrito({
        data: { idUsuario: sesion.data.idUsuario!, documentos: documento ? [documento] : documentos },
        cancelToken: source.token,
      }),
    )
      .then(unwrapResult)
      .then(() => {
        uncheckedRows();
        setDisabledOkButton(true);
      })
      .catch((err) => {
        message.error("Ocurrió un error intentando agregar contenido a carrito. Vuelva a intentarlo")
      });
  };

  const uncheckedRows = () => {
    setSelectedRowKeys([]);
  };


  const onSelectChange = (selectedRowKeys: ReactText[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const disableCheckbox = (record: any) => {
    return record.tipoPedido === 'soloDigital';
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    renderCell: (value, record, index, node) =>
      disableCheckbox(record) ? <Tooltip title="No se puede agregar por el tipo de pedido">{node}</Tooltip> : node,
    getCheckboxProps: (record: any) => ({ disabled: disableCheckbox(record) }),
  } as TableRowSelection<any>;

  const hasSelected = selectedRowKeys.length > 0;

  const infoOpModal = async (id: number) => {
    setLoadingOperacion(id);
    await obtenerHistorialOperacion(id)
      .then((historial) => {
        Modal.info({
          title: 'Historial de Operaciones',
          width: '800px',
          content: (
            <>
              <p>Documento: {id}</p>
              <Table<HistorialOp>
                size={'middle'}
                dataSource={historial}
                pagination={{ pageSize: 6, total: historial.length, showTotal: (total: number) => `Total ${total} items` }}>
                <Table.Column<HistorialOp> key="proceso" title="Proceso" dataIndex="proceso" />
                <Table.Column<HistorialOp> key="subproceso" title="SubProceso" dataIndex="subproceso" />
                <Table.Column<HistorialOp> key="idOperacion" title="Operación" dataIndex="idOperacion" />
              </Table>
            </>
          ),
          onOk() { setLoadingOperacion(null) },
        });
      })
      .catch((e) => {
        setLoadingOperacion(null);
        message.error("Ocurrió un error visualizando la operación. Vuelva a intentarlo")
      })
  };

  const visualizarDocumentoUrl = async (record: any): Promise<void> => {
    await visualizar(record.idFilenet)
      .then((url) => {
        window.open(url, '_blank');
      })
      .catch((e) => {
        message.error("Ocurrió un error visualizando el documento. Vuelva a intentarlo");
      });
  };

  const renderIdFilenet = (record: any) => {
    if (record.idFilenet) {
      return (
        <Button
          type="primary"
          shape="circle"
          onClick={() => visualizarDocumentoUrl(record)}
          style={{ color: '#fa7923', backgroundColor: 'transparent', border: 'none' }}
          icon={<EyeOutlined />}></Button>
      );
    } else {
      return undefined;
    }
  };

  const agregarAlCarrito = () => {
    let rows = new Array();
    selectedRowKeys.forEach((r) => {
      rows.push(
        documents &&
        documents.find((d) => {
          return d.key === r;
        }),
      );
    });

    const data = rows.map((r) => {
      return { id: r.key, state: r.estado, alta: formatDate(r.alta) } as PreviewDocumentoPortalCarrito;
    });

    setSelectedDocuments(data);
    setVisible(true);
  };

  const formatDate = (date: string) => {
    return Moment(date).format('DD/MM/YYYY HH:mm');
  };

  const mapOverFilter = (filter: IFilterItem[]) => {
    return filter.map((filter, i) => {
      return (
        <Option key={i} value={filter.wsField}>
          {filter.label}
        </Option>
      );
    });
  };
  const checkLoadOp = (id: number) => {
    return id === loadingOperacion;
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Collapse accordion activeKey={panelActive} style={{ width: '100%' }} onChange={(key) => setPanelActive(key)}>
        <Panel header={<strong>Búsquedas</strong>} key="1">
          <PageHeader style={{ alignSelf: 'flex-start' }} title="Búsqueda de Documentos" />
          <Divider />
          <Form {...layout} ref={formRef} name="control-ref" onFinish={onFinish}>
            <Form.Item name="bsq" label="Búsquedas por:">
              <Radio.Group options={options} onChange={(e) => onChangeCheck(e.target.value)} defaultValue={currentValue} />
            </Form.Item>
            {currentValue === 'cliente' && (
              <>
                <Form.Item name="tipoDocumento" label="Filtro" rules={[{ required: false, message: 'filtro es requerido' }]}>
                  <Select placeholder="Seleccione un filtro" onChange={(e) => onTipoDocumentoChange(e)} defaultValue={tipoDocumento?.label}>
                    {mapOverFilter(clientesFilters)}
                  </Select>
                </Form.Item>
                {renderTipoDocumentoElegido()}
              </>
            )}
            {currentValue === 'operacion' && (
              <>
                <Form.Item name="proceso" label="Proceso" rules={[{ required: true, message: "'proceso' es requerido" }]}>
                  <Select placeholder="Seleccione un proceso" value={proccessValue} onChange={(p) => onProccessChange(p)} allowClear>
                    {mapOverFilter(proccessFilters)}
                  </Select>
                </Form.Item>
                <Form.Item name="subproceso" label="Subproceso" rules={[{ required: true, message: "'subproceso' es requerido" }]}>
                  <Select
                    placeholder="Seleccione un subproceso"
                    value={subProccessValue}
                    onChange={(p) => onSubProccessChange(p)}
                    allowClear
                    disabled={!proccessValue}>
                    {subProccessFilters.map((filter, i) => {
                      return (
                        <Option key={i} value={filter.id}>
                          {filter.descripcion}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item name="operacion" label="Operación" rules={[{ required: true, message: "'operación' es requerido" }]}>
                  <Input value={operacion} onChange={(e) => setOperacion(e.currentTarget.value)} />
                </Form.Item>
              </>
            )}

            <Form.Item name="tipoDocumental" label="Tipo Documental">
              <Input value={tipoDocumental} onChange={(e) => setTipoDocumental(e.currentTarget.value)} />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit" style={{ margin: '10px' }} loading={searching} >
                Buscar
              </Button>
              <Button htmlType="button" onClick={onReset} disabled={searching}>
                Limpiar
              </Button>
            </Form.Item>
          </Form>
          <TableModal
            title="Clientes"
            width={'80%'}
            okText={'Ok'}
            cancelText={'Cerrar'}
            onOk={() => {
              setSearching(false);
              setVisibleNombreYApellido(false);
            }}
            onCancel={() => setVisibleNombreYApellido(false)}
            visible={visibleNombreYApellido}
            afterClose={() => setSearching(false)}
            table={{
              columns: clientesColumns,
              dataSource: clientesDocuments,
              style: { 'cursor': 'pointer' },
              rowKey: 'idHost',
              loading: loadingTable,
              onRow: onClickRow,
              hideRowSelection: true,
              extraColumns: { showKeyColumn: false, showActionsColumn: false },
              extraComponents: [
                {
                  key: 'records-count-tag',
                  node: 'records-count-tag',
                  position: 'top',
                  style: { marginLeft: 'auto' },
                },
              ],

              sortable: true,
              pagination: { pageSize: 10 },
              scroll: { y: 350 },
            }}
          />
        </Panel>

        <Panel header={<strong>Resultados</strong>} key="2">
          {renderAlertUser()}
          <br></br>
          {documents && documents.length > 0 ? (
            <Alert message={'Documentos : ' + documents.length} type="info" style={{ textAlign: 'center' }} />
          ) : documents && documents.length === 0 ? (
            <Alert message={'No se encontraron documentos para esa búsqueda'} type="error" style={{ textAlign: 'center' }} />
          ) : undefined}
          <br></br>
          <Button
            type="primary"
            title="Agregar al carrito"
            key="btnCarrito"
            disabled={!hasSelected}
            onClick={(_: any) => {
              agregarAlCarrito();
            }}>
            <PlusOutlined style={{ fontSize: '16px', marginRight: '2px' }} /> Agregar al carrito
          </Button>

          <br></br>
          <TableModal
            title="Pedido"
            width={'80%'}
            okText={'Confirmar'}
            cancelText={'Cerrar'}
            onOk={() => addToCart()}
            okButtonProps={{ loading: carrito.loading, disabled: disabledOkButton }}
            onCancel={() => setVisible(false)}
            visible={visible}
            afterClose={() => setDisabledOkButton(false)}
            table={{
              columns: mergedColumns,
              dataSource: selectedDocuments,
              rowKey: 'id',
              hideRowSelection: true,
              extraColumns: { showKeyColumn: false, showActionsColumn: false },
              extraComponents: [
                {
                  key: 'records-count-tag',
                  node: 'records-count-tag',
                  position: 'top',
                  style: { marginLeft: 'auto' },
                },
              ],

              sortable: true,
              pagination: { pageSize: 10 },
              scroll: { y: 350 },
            }}
          />
          <br></br>

          <div className="table-style">
            <Table rowSelection={rowSelection} dataSource={documents} rowKey="key">
              <Column title="id" dataIndex="key" key="key" ellipsis={true} />
              <Column title="Descripción" dataIndex="descripcion" key="descripcion" ellipsis={true} />
              <Column<Documento>
                key="operacion"
                title="Operación"
                dataIndex="procesoSubproceso"
                ellipsis={true}
                render={(value: any, record: Documento, index: number) => {
                  return (
                    <>
                      <Button type="primary" loading={checkLoadOp(record.key)} onClick={(e) => infoOpModal(record.key)}>
                        Ver Operación
                      </Button>
                    </>
                  );
                }}
              />
              <Column
                title="Alta"
                dataIndex="alta"
                key="alta"
                ellipsis={true}
                render={(text) => {
                  return formatDate(text);
                }}
              />

              <Column title="Estado" dataIndex="estado" key="estado" />
              <Column<Documento>
                key="tipoPedido"
                title="Documento"
                dataIndex="tipoPedido"
                ellipsis={true}
                render={(value: any, record: Documento, index: number) => {
                  if (record?.tipoPedido === 'soloDigital') {
                    return 'Sólo digital';
                  } else {
                    return 'Físico';
                  }
                }}
              />
              <Column
                title="Ver"
                key="idFilenet"
                dataIndex="idFilenet"
                ellipsis={true}
                render={(value: any, record: Documento, index: number) => {
                  return renderIdFilenet(record);
                }}
              />
            </Table>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export interface HistorialOp {
  proceso: string;
  subproceso: string;
  idOperacion: string;
}
export interface Documento {
  key: number;
  descripcion: string;
  alta: string;
  estado: string | null;
  tipoPedido: string | null;
  idFilenet: string;
}

export interface APIResponse {
  descripcionCorta: string;
  detalle: string;
  documento: string;
  fechaAlta: string;
  idDocumento: number;
  idCaja: string;
  idFilenet: any;
  idHostCliente: number;
  idSectorOrigen: number;
  idSectorPropietario: number;
  idSectorTenedor: number;
  idTipoDocumento: number;
  idUsuarioAlta: number;
  idEstado: null | string;
}
