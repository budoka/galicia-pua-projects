import React, { ReactText, useEffect, useState } from 'react';
import { RootState } from '../../reducers';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store';
import { Button, Checkbox, Col, Collapse, Form, Input, message, Radio, Row, Select, Space, Table, Tag } from 'antd';
import axios from 'axios';
import Column from 'antd/lib/table/Column';
import { default as Moment } from 'moment';
import { renderEstadoPedido } from 'src/utils/renderEstados';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import TextArea from 'antd/lib/input/TextArea';

import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { fetchCantidadCarrito } from 'src/features/carrito/carrito.slice';
import { RSA_NO_PADDING } from 'constants';

const { Panel } = Collapse;
const { Option } = Select;

const optionsPedido = ['Caja', 'Documento'];

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface IDataCarrito {
  id: number;
  tipoElemento: string;
  fechaHora: Date;
  idCaja: number | undefined;
  tipoContenido: string | undefined;
  tipoCaja: string | undefined;
  idDocumento: number | undefined;
  tipoDocumento: string | undefined;
  estado: string;
  observaciones: string | undefined;
}

export const Carrito: React.FC = () => {
  const [form] = Form.useForm();

  const sesion = useSelector((state: RootState) => state.sesion);
  const dispatch = useAppDispatch();

  const [data, setData] = useState<IDataCarrito[]>([]);
  const [dataFilter, setDataFilter] = useState<IDataCarrito[]>([]);
  const [optionPedido, setOptionPedido] = useState<String | undefined>('Caja');
  const [selectedRows, setSelectedRows] = useState<ReactText[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hiddenUrgente, setHiddenUrgente] = useState<boolean>(true);

  useEffect(() => {
    getCarrito();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    setSelectedRows([]);
    form.resetFields();
    setHiddenUrgente(true);
    getCarrito();
  }, [optionPedido]);

  /*****************************
   * TABLA DE DETALLE DE PEDIDO
   *****************************/
  const createRemoveIDs = () => {
    return selectedRows.map((v, i) => {
      return {
        id: v,
      };
    });
  };

  const refreshCarrito = () => {
    getCarrito();
    dispatch(fetchCantidadCarrito({ data: { idUsuario: sesion.data.idUsuario! } }));
    setSelectedRows([]);
  };

  const getCarrito = async () => {
    const data = { idUsuario: sesion.data.idUsuario };
    const api = apis['CARRITO'];
    const resource = api.resources['OBTENER_CARRITO'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { data });

    const response = await axios.request<IDataCarrito[]>(axiosConfig);
    setData(response.data);
    filterData(response.data);
  };

  const filterData = (datos: IDataCarrito[]) => {
    if (optionPedido != undefined) setDataFilter(datos.filter((e) => e.tipoElemento.toLowerCase() === optionPedido.toLowerCase()));
  };

  const deleteFromCarrito = async () => {
    const data = { idUsuario: sesion.data.idUsuario, ids: createRemoveIDs() };
    const api = apis['TEMPORAL_CARRITO'];
    const resource = api.resources['ELIMINAR_ITEMS'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { data });

    const response = await axios.request<number>(axiosConfig);
    if (response.data > 0) {
      refreshCarrito();
      message.success('Se eliminaron los elementos seleccionados');
    } else message.error('Ocurrió un error al querer eliminar los elementos');
  };

  const clearCarrito = async () => {
    const data = { idUsuario: sesion.data.idUsuario };
    const api = apis['TEMPORAL_CARRITO'];
    const resource = api.resources['ELIMINAR_ITEMS'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { data });

    const response = await axios.request<number>(axiosConfig);
    if (response.data > 0) {
      refreshCarrito();
      message.success('Se vació el carrito');
    } else message.error('Ocurrió un error al vaciar el carrito');
  };

  const onSelectChange = (selectedRowKeys: ReactText[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: onSelectChange,
  };

  /*******************************
   * FORMULARIO PARA CREAR PEDIDO
   *******************************/
  const crearPedido = async (values: any[]) => {
    var lista = selectedRows.map((i, index) => {
      return { id: i };
    });
    var data = { ...values, ids: [...lista], idUsuario: sesion.data.idUsuario };
    const api = apis['PEDIDO'];
    const resource = api.resources['CREAR'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { data });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200) {
      refreshCarrito();
      form.resetFields();
      setHiddenUrgente(true);
      message.success('Se genero el pedido ' + response.data.id + ' exitosamente');
    } else {
      message.error('Ocurrió un error generando el pedido, vuelva a intentarlo en un momento');
    }
  };

  const changePrioridad = (value: any) => {
    setHiddenUrgente(value !== 'urgente');
  };

  const updateObservacion = async (e: React.FocusEvent<HTMLInputElement>, id: String, lastValue: string | undefined) => {
    const value = e.target.value;
    const api = apis['TEMPORAL_CARRITO'];
    const resource = api.resources['AGREGAR_OBSERVACIONES'];
    const axiosConfig = buildAxiosRequestConfig(api, resource, { data: { id: id, observaciones: value } });
    const response = await axios.request<any>(axiosConfig);
    if (response.status !== 200) {
      message.error('Ocurrió un error al guardar la observación, vuelva a intentarlo en un momento');
      form.setFieldsValue({ ['obs' + id]: lastValue });
    }
  };

  return (
    <div className={`wrapper unselectable`}>
      <Form {...formItemLayout} form={form} name="crearPedido" onFinish={crearPedido}>
        <Collapse style={{ width: '100%' }} defaultActiveKey={['1', '2']}>
          <Panel showArrow={false} header="Detalle del Carrito" key="2">
            <Row style={{ marginBottom: 5, marginLeft: 3 }}>
              <Col span={18}>
                <Radio.Group onChange={(e) => setOptionPedido(e.target.value)} defaultValue={'Caja'}>
                  <Radio value={'Caja'}>Caja</Radio>
                  <Radio value={'Documento'}>Documento</Radio>
                </Radio.Group>
              </Col>
              <Col span={6} className="right" style={{ textAlign: 'right' }}>
                <Space>
                  <Button disabled={selectedRows.length === 0} onClick={deleteFromCarrito}>
                    Quitar Elemento
                  </Button>
                  <Button disabled={data.length === 0} onClick={clearCarrito}>
                    Vaciar Carrito
                  </Button>
                </Space>
              </Col>
            </Row>
            <span style={{ marginBottom: 4, marginTop: 12, float: 'right', visibility: dataFilter.length > 0 ? 'visible' : 'hidden' }}>
              <Tag color="orange">Cantidad de registros: {dataFilter.length}</Tag>
            </span>
            <Table
              dataSource={dataFilter}
              rowSelection={rowSelection}
              rowKey="id"
              size="small"
              pagination={{ current: currentPage, onChange: (page) => setCurrentPage(page) }}>
              <Column title="Tipo de Elemento" key="tipoElemento" dataIndex="tipoElemento" align="center" />
              <Column
                title="Fecha Carrito"
                key="fechaHora"
                dataIndex="fechaHora"
                align="center"
                render={(text) => {
                  return Moment(text).format('DD/MM/YYYY');
                }}
              />
              <Column
                title="Observaciones"
                key="observaciones"
                dataIndex="id"
                align="center"
                render={(text, record: IDataCarrito) => {
                  return (
                    <Form.Item name={`obs${text}`} initialValue={record.observaciones} noStyle>
                      <Input
                        placeholder="ingrese una observación..."
                        onBlur={(event) => updateObservacion(event, text, record.observaciones)}
                      />
                    </Form.Item>
                  );
                }}
              />
              <Column title="Número de Caja" key="idCaja" dataIndex="idCaja" align="center" />
              <Column title="Tipo Contenido" key="tipoContenido" dataIndex="tipoContenido" align="center" />
              <Column title="Tipo de Caja" key="tipoCaja" dataIndex="tipoCaja" align="center" />
              <Column title="Número de Documento" key="idDocumento" dataIndex="idDocumento" align="center" />
              <Column title="Tipo Documento" key="tipoDocumento" dataIndex="tipoDocumento" align="center" />
              <Column
                title="Estado del Elemento"
                key="estado"
                dataIndex="estado"
                align="center"
                render={(text) => {
                  return renderEstadoPedido(text);
                }}
              />
            </Table>
          </Panel>
          <Panel showArrow={false} header="Información de Pedido" key="1" collapsible={data.length > 0 ? undefined : 'disabled'}>
            <Row gutter={8}>
              <Col span={6}>
                <Form.Item
                  name="tipoPedido"
                  label="Tipo de Pedido"
                  rules={[
                    {
                      required: true,
                      message: 'Debe seleccionar un tipo de pedido',
                    },
                  ]}>
                  <Select placeholder="Seleccione un tipo de pedido" size="small">
                    <Option value="fisico">Físico</Option>
                    <Option value="digital">Digital</Option>
                    {optionPedido?.toString() === 'Caja' && <Option value="cajaCompleta">Caja Completa</Option>}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="observaciones"
                  label="Observaciones"
                  rules={[
                    {
                      required: true,
                      message: 'Debe ingresar una observación',
                    },
                  ]}>
                  <TextArea rows={4} size="small" />
                </Form.Item>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <Button disabled={selectedRows.length === 0} type="primary" htmlType="submit" style={{ float: 'right' }}>
                  Crear Pedido
                </Button>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={6}>
                <Form.Item
                  name="prioridad"
                  label="Prioridad"
                  validateStatus={!hiddenUrgente ? 'warning' : ''}
                  rules={[
                    {
                      required: true,
                      message: 'Debe seleccionar una prioridad',
                    },
                  ]}
                  help={!hiddenUrgente ? 'Requiere autorización' : ''}>
                  <Select placeholder="Seleccione una prioridad" size="small" onChange={changePrioridad}>
                    <Option value="normal">Normal</Option>
                    <Option value="urgente">Urgente</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="motivoUrgente"
                  label="Motivo de Urgencia"
                  hidden={hiddenUrgente}
                  rules={[
                    {
                      required: !hiddenUrgente,
                      message: 'Debe cargar el motivo de la urgencia',
                    },
                  ]}>
                  <TextArea rows={4} size="small" />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Form>
    </div>
  );
};
