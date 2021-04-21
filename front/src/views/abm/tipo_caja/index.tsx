import { Button, Col, Form, Modal, Row, Input, Space, Table, Tag, Checkbox, Select, Divider, message, Popconfirm, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';

import styles from '../style.module.less';
import { compare } from 'src/utils/string';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import axios from 'axios';
import { isNullOrUndefined } from 'util';

const { Column } = Table;
const { Option } = Select;

interface TipoCaja {
  id: number;
  codigo: string;
  descripcion: string;
}

interface TipoCajaDetail extends TipoCaja {
  reservarEspacioEnArchivo: boolean;
  admiteEtiquetas: boolean;
  admiteDocumentos: boolean;
  admiteDetalle: boolean;
  vencimientoDocumento: number | null;
  vencimientoEtiqueta: number | null;
  vencimientoDetalle: number | null;
}

interface TipoDocumento {
  id: number;
  descripcion: string | undefined;
}

interface TipoDocumentoCaja extends TipoDocumento {
  capacidadMaxima: string | number;
  idTipoDocumento: number;
}

export const ABMTipoCaja: React.FC = () => {
  var api = apis['ABM_ENTIDADES'];
  var res = api.resources['REALIZAR_OPERACION'];

  const [form] = Form.useForm();
  const [formTable] = Form.useForm();

  const [listTipoCaja, setListTipoCaja] = useState<TipoCaja[]>([]);
  const [listTipoDocumento, setListTipoDocumento] = useState<TipoDocumentoCaja[]>([]);
  const [listTipoDocumentoAvailable, setListTipoDocumentoAvailable] = useState<TipoDocumento[]>([]);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [tipoCajaSelect, setTipoCajaSelect] = useState<TipoCajaDetail | null>(null);
  const [tipoContenidoDocumento, setTipoContenidoDocumento] = useState<boolean>(false);
  const [tipoContenidoEtiqueta, setTipoContenidoEtiqueta] = useState<boolean>(false);
  const [tipoContenidoDetalle, setTipoContenidoDetalle] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    // obtiene listado de tipos caja
    getListTipoCaja();
    getListTipoDocumentoAvailable();
  }, []);

  useEffect(() => {
    if (tipoCajaSelect) {
      setTipoContenidoDetalle(tipoCajaSelect.admiteDetalle);
      setTipoContenidoDocumento(tipoCajaSelect.admiteDocumentos);
      setTipoContenidoEtiqueta(tipoCajaSelect.admiteEtiquetas);
      setVisibleModal(true);
    }
  }, [tipoCajaSelect]);

  useEffect(() => {
    if (tipoCajaSelect && editingRow === null) getTiposDocumentosPermitidos(tipoCajaSelect.id);
  }, [editingRow]);

  const executeCallWSTipoCaja = (operacion: string, entidad: string, parametros: any | null = null, id: number | null = null) => {
    const axiosConfig = buildAxiosRequestConfig(api, res, {
      data: { operacion: operacion, entidad: entidad, id: id, parametros: parametros },
    });
    return axios.request<any>(axiosConfig);
  };

  const getListTipoCaja = async () => {
    const response = await executeCallWSTipoCaja('L', 'Tipo Caja');
    if (response.status === 200) {
      setListTipoCaja(response.data);
    } else {
      message.error('Ocurrió un error al obtener los tipos de caja');
    }
  };

  const getListTipoDocumentoAvailable = async () => {
    const response = await executeCallWSTipoCaja('L', 'Tipo Documento');
    if (response.status === 200) {
      setListTipoDocumentoAvailable(response.data);
    } else {
      message.error('Ocurrió un error al obtener los tipos de documentos');
    }
  };

  const getTipoCaja = async (id: number) => {
    const response = await executeCallWSTipoCaja('D', 'Tipo Caja', null, id);
    if (response.status === 200 && response.data.length > 0) {
      setTipoCajaSelect(response.data[0]);
      getTiposDocumentosPermitidos(id);
      return response.data[0];
    } else {
      message.error('Ocurrió un error al obtener el detalle del tipo de caja');
    }
  };

  const getTiposDocumentosPermitidos = async (id: number) => {
    const responseDocumentos = await executeCallWSTipoCaja('D', 'TipoDocumentoPermitido', null, id);
    if (responseDocumentos.status === 200 && responseDocumentos.data !== '') {
      setListTipoDocumento(responseDocumentos.data);
      return responseDocumentos.data[0];
    } else if (responseDocumentos.status === 200 && responseDocumentos.data === '') {
      setListTipoDocumento([]);
    } else if (responseDocumentos.status !== 200) {
      message.error('Ocurrió un error al obtener el detalle del tipo de caja');
    }
  };

  const editarTipoCajaAction = (id: number) => {
    form.resetFields();
    getTipoCaja(id);
  };

  const addTipoCajaAction = () => {
    form.resetFields();
    setTipoCajaSelect(null);
    setListTipoDocumento([]);
    setEditingRow(null);
    setTipoContenidoDetalle(false);
    setTipoContenidoDocumento(false);
    setTipoContenidoEtiqueta(false);
    setVisibleModal(true);
  };

  const addRowTipoDocumento = () => {
    let list = [...listTipoDocumento];
    list.unshift({ id: 0, capacidadMaxima: 1000, descripcion: '', idTipoDocumento: 0 });
    setEditingRow(0);
    setCurrentPage(1);
    setListTipoDocumento(list);
  };

  const eliminarTipoCaja = async (id: number) => {
    const response = await executeCallWSTipoCaja('B', 'Tipo Caja', null, id);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListTipoCaja();
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al eliminar el tipo de caja');
    }
  };

  const modifyTipoCaja = async (id: number, values: any) => {
    const response = await executeCallWSTipoCaja('M', 'Tipo Caja', values, id);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListTipoCaja();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al modificar el tipo de caja');
    }
  };

  const createTipoCaja = async (values: any) => {
    const response = await executeCallWSTipoCaja('A', 'Tipo Caja', values);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListTipoCaja();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al agregar el tipo de caja');
    }
  };

  const submitModal = (values: any) => {
    setEditingRow(null);

    if (values['admiteEtiquetas'] === null || !values['admiteEtiquetas']) values['admiteEtiquetas'] = 0;
    else if (values['admiteEtiquetas']) values['admiteEtiquetas'] = 1;

    if (values['reservarEspacioEnArchivo'] === null || !values['reservarEspacioEnArchivo']) values['reservarEspacioEnArchivo'] = 0;
    else if (values['reservarEspacioEnArchivo']) values['reservarEspacioEnArchivo'] = 1;

    if (values['admiteDetalle'] === null || !values['admiteDetalle']) values['admiteDetalle'] = 0;
    else if (values['admiteDetalle']) values['admiteDetalle'] = 1;

    if (values['admiteDocumentos'] === null || !values['admiteDocumentos']) values['admiteDocumentos'] = 0;
    else if (values['admiteDocumentos']) values['admiteDocumentos'] = 1;

    if (tipoCajaSelect === null) {
      createTipoCaja(values);
    } else {
      modifyTipoCaja(tipoCajaSelect.id, values);
    }
  };

  const addTipoDocumento = async (idTipoCaja: number, idTipoDocumento: number, capacidadMaxima: number) => {
    const response = await executeCallWSTipoCaja('A', 'TipoDocumentoPermitido', {
      idTipoCaja: idTipoCaja,
      idTipoDocumento: idTipoDocumento,
      capacidadMaxima: capacidadMaxima,
    });
    if (response.status === 200) {
      if (response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al asociar el tipo documento');
    }
    setEditingRow(null);
  };

  const submitRow = (values: any) => {
    if (tipoCajaSelect && editingRow !== null && editingRow === 0) {
      addTipoDocumento(tipoCajaSelect.id, values['descripcion'] as number, values['capacidadMaxima'].toString());
    }
    formTable.resetFields();
  };

  const deleteRow = async (id: number) => {
    if (tipoCajaSelect) {
      const response = await executeCallWSTipoCaja('B', 'TipoDocumentoPermitido', null, id);

      if (response.status === 200) {
        if (response.data[0].Estado === 'OK') {
          setEditingRow(-1);
          setEditingRow(null);
          message.success(response.data[0].Respuesta);
        } else {
          message.error(response.data[0].Respuesta);
        }
      } else {
        message.error('Ocurrió un error al eliminar la asociación');
      }

      formTable.resetFields();
    }
  };

  const cancelRow = () => {
    setEditingRow(null);
    formTable.resetFields();
  };

  const filterOptions = (input: string, option: any) => {
    return option?.props.children.toLowerCase().indexOf(input.toLowerCase()) == 0;
  };

  const renderTablaDocumento = () => {
    return (
      <Form form={formTable} onFinish={submitRow}>
        <Divider>Tipos de Documentos Permitidos</Divider>
        <Button
          type="primary"
          size="small"
          disabled={editingRow != null}
          onClick={() => {
            addRowTipoDocumento();
          }}
          style={{ float: 'right', marginRight: 8 }}>
          Agregar
        </Button>
        <br style={{ display: listTipoDocumento.length > 0 ? 'block' : 'none' }} />
        <br style={{ display: listTipoDocumento.length > 0 ? 'block' : 'none' }} />
        <span style={{ marginBottom: 4, float: 'right', visibility: listTipoDocumento.length > 0 ? 'visible' : 'hidden' }}>
          <Tag color="orange">Cantidad de registros: {listTipoDocumento.length}</Tag>
        </span>
        <Table
          dataSource={listTipoDocumento}
          rowKey="id"
          size="small"
          pagination={{ current: currentPage, onChange: (page) => setCurrentPage(page) }}>
          <Column
            title="Tipo de documento"
            dataIndex="descripcion"
            key="descripcionDocumento"
            ellipsis={true}
            align="left"
            render={(text: string, record: TipoDocumentoCaja) => {
              return editingRow === record.id && editingRow === 0 ? (
                <Form.Item
                  name={'descripcion'}
                  noStyle
                  rules={[
                    {
                      required: false,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          message.error('Debe seleccionar una opción');
                          return Promise.reject('Debe seleccionar una opción');
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  initialValue={null}>
                  <Select
                    key={'select' + editingRow.toString()}
                    style={{ width: 350 }}
                    showSearch
                    placeholder="Seleccione un tipo de documento"
                    optionFilterProp="children"
                    filterOption={(input, option) => filterOptions(input, option)}
                    size="small">
                    {listTipoDocumentoAvailable.map((i) => {
                      if (listTipoDocumento.find((item) => item.idTipoDocumento === i.id) === undefined) {
                        return (
                          <Option key={i.descripcion} value={i.id}>
                            {i.descripcion}
                          </Option>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </Select>
                </Form.Item>
              ) : (
                text
              );
            }}
          />
          <Column
            title="Capacidad máxima"
            dataIndex="capacidadMaxima"
            key="capacidadMaximaDocumento"
            ellipsis={true}
            align="center"
            render={(text: string, record: TipoDocumentoCaja) => {
              return editingRow === record.id ? (
                <Form.Item
                  name={'capacidadMaxima'}
                  initialValue={text}
                  noStyle
                  rules={[
                    {
                      required: false,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          message.error('Ingrese capacidad máxima');
                          return Promise.reject('Ingrese capacidad máxima');
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}>
                  <InputNumber type="number" size="small" />
                </Form.Item>
              ) : (
                text
              );
            }}
          />

          <Column
            title="Acciones"
            dataIndex="id"
            key="idDocumento"
            ellipsis={true}
            align="center"
            render={(text: number, record: TipoDocumentoCaja, index: number) => {
              return editingRow === record.id ? (
                <Space>
                  <Button type="default" key="btnConfirmar" htmlType="submit" size="small">
                    Confirmar
                  </Button>
                  <Button
                    htmlType="button"
                    size="small"
                    key="btnCancelar"
                    onClick={(event) => {
                      editingRow === 0 ? cancelRow() : deleteRow(record.id);
                    }}>
                    Cancelar
                  </Button>
                </Space>
              ) : (
                <Space>
                  <Popconfirm title="Está seguro?" onConfirm={(_) => deleteRow(record.id)}>
                    <Button size="small" key="btnEliminar" disabled={editingRow != null}>
                      Eliminar
                    </Button>
                  </Popconfirm>
                </Space>
              );
            }}
          />
        </Table>
      </Form>
    );
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Button
        type="primary"
        onClick={() => {
          addTipoCajaAction();
        }}
        style={{ float: 'right', marginRight: 8 }}>
        Agregar
      </Button>
      <br style={{ display: listTipoCaja.length > 0 ? 'block' : 'none' }} />
      <br style={{ display: listTipoCaja.length > 0 ? 'block' : 'none' }} />
      <span style={{ marginBottom: 4, float: 'right', visibility: listTipoCaja.length > 0 ? 'visible' : 'hidden' }}>
        <Tag color="orange">Cantidad de registros: {listTipoCaja.length}</Tag>
      </span>
      <Table dataSource={listTipoCaja} rowKey="id" size="small">
        <Column
          title="ID"
          dataIndex="id"
          key="id"
          align="right"
          width={140}
          sorter={{ compare: (a: TipoCaja, b: TipoCaja) => compare(+a.id, +b.id), multiple: -1 }}
        />
        <Column
          title="Código"
          dataIndex="codigo"
          key="codigo"
          ellipsis={true}
          sorter={{ compare: (a: TipoCaja, b: TipoCaja) => compare(a.codigo, b.codigo), multiple: -1 }}
        />
        <Column
          title="Descripción"
          dataIndex="descripcion"
          key="descripcion"
          ellipsis={true}
          sorter={{ compare: (a: TipoCaja, b: TipoCaja) => compare(a.descripcion, b.descripcion), multiple: -1 }}
        />
        <Column
          title="Acciones"
          dataIndex="id"
          align="center"
          key="acciones"
          ellipsis={true}
          render={(text: number) => {
            return (
              <>
                <Space>
                  <Button size="small" onClick={() => editarTipoCajaAction(text)}>
                    Editar
                  </Button>
                  <Popconfirm title="Está seguro?" onConfirm={(_) => eliminarTipoCaja(text)}>
                    <Button size="small">Eliminar</Button>
                  </Popconfirm>
                </Space>
              </>
            );
          }}
        />
      </Table>
      <Modal
        title={(tipoCajaSelect ? 'Editar' : 'Crear') + ' Tipo Caja'}
        centered
        visible={visibleModal}
        destroyOnClose={true}
        getContainer={false}
        width="80%"
        onCancel={() => {
          setVisibleModal(false);
          setTipoCajaSelect(null);
          setListTipoDocumento([]);
          setEditingRow(null);
        }}
        onOk={() => form.submit()}>
        <Form form={form} labelCol={{ span: 10 }} wrapperCol={{ span: 10 }} onFinish={submitModal}>
          <Row gutter={24}>
            <Col span={8} key={11}>
              <Form.Item
                name={'codigo'}
                label={'Codigo'}
                initialValue={tipoCajaSelect?.codigo}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese un código',
                    whitespace: true,
                  },
                ]}>
                <Input maxLength={2} />
              </Form.Item>
            </Col>
            <Col span={8} key={12}>
              <Form.Item
                name={'descripcion'}
                label={'Descripción'}
                initialValue={tipoCajaSelect?.descripcion}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese una descripción',
                    whitespace: true,
                  },
                ]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={8} key={13}>
              <Form.Item
                name="reservarEspacioEnArchivo"
                valuePropName="checked"
                initialValue={tipoCajaSelect?.reservarEspacioEnArchivo ? 'checked' : null}
                noStyle>
                <Checkbox>Reservar espacio en Archivo</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col offset={3} span={8} key={21}>
              <Form.Item
                name="admiteEtiquetas"
                noStyle
                valuePropName="checked"
                initialValue={tipoCajaSelect?.admiteEtiquetas ? 'checked' : null}>
                <Checkbox
                  onChange={(e) => {
                    setTipoContenidoEtiqueta(e.target.checked);
                    form.setFieldsValue({ ['vencimientoEtiqueta']: '' });
                  }}>
                  Admite tipo de contenido Caja con etiquetas
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={8} key={22}>
              <Form.Item
                label="Años de vencimiento"
                name="vencimientoEtiqueta"
                initialValue={tipoCajaSelect?.admiteEtiquetas ? tipoCajaSelect?.vencimientoEtiqueta : null}>
                <InputNumber type="number" min={0} size="small" disabled={!tipoContenidoEtiqueta} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col offset={3} span={8} key={31}>
              <Form.Item
                name="admiteDocumentos"
                valuePropName="checked"
                noStyle
                initialValue={tipoCajaSelect?.admiteDocumentos ? 'checked' : null}>
                <Checkbox
                  onChange={(e) => {
                    setTipoContenidoDocumento(e.target.checked);
                    form.setFieldsValue({ ['vencimientoDocumento']: '' });
                  }}>
                  Admite tipo de contenido Caja con documentos
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={8} key={32}>
              <Form.Item
                label="Años de vencimiento"
                name="vencimientoDocumento"
                initialValue={tipoCajaSelect?.admiteDocumentos ? tipoCajaSelect?.vencimientoDocumento : null}>
                <InputNumber type="number" min={0} size="small" disabled={!tipoContenidoDocumento} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col offset={3} span={8} key={41}>
              <Form.Item
                name="admiteDetalle"
                valuePropName="checked"
                noStyle
                initialValue={tipoCajaSelect?.admiteDetalle ? 'checked' : null}>
                <Checkbox
                  onChange={(e) => {
                    setTipoContenidoDetalle(e.target.checked);
                    form.setFieldsValue({ ['vencimientoDetalle']: '' });
                  }}>
                  Admite tipo de contenido Caja con detalle
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={8} key={42}>
              <Form.Item
                name="vencimientoDetalle"
                label="Años de vencimiento"
                initialValue={tipoCajaSelect?.admiteDetalle ? tipoCajaSelect?.vencimientoDetalle : null}>
                <InputNumber type="number" min={0} size="small" disabled={!tipoContenidoDetalle} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {tipoContenidoDocumento && tipoCajaSelect ? renderTablaDocumento() : null}
      </Modal>
    </div>
  );
};
