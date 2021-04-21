import { Button, Col, Form, Modal, Row, Input, Space, Table, Tag, Checkbox, Select, Divider, message, Popconfirm, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';

import styles from '../style.module.less';
import { compare } from 'src/utils/string';
import axios from 'axios';

const { Column } = Table;
const { Option } = Select;

interface TipoDocumento {
  id: number;
  descripcion: string | null;
  idClaseDocumento: number | null;
  claseDocumento: string | null;
}

interface ClaseDocumento {
  id: number;
  descripcion: string;
}

interface TipoDocumentoDetail extends TipoDocumento {
  descripcionCorta?: string;
  sucursalPuedeGenerar?: boolean;
  areaCentralPuedeGenerar?: boolean;
  archivoPuedeGenerar?: boolean;
  sectorPropietarioEsId?: boolean;
  solicitarIngresoSucCCPropietario?: boolean;
  inclusionFechaDocumental?: string;
  inclusionFechaDesde?: string;
  inclusionFechaHasta?: string;
  inclusionClaveExterna?: string;
  inclusionDetalle?: string;
  inclusionDniCuitTitular?: string;
  inclusionFechaCierre?: string;
  inclusionNombreTitular?: string;
  inclusionNumeroProducto?: string;
  ordenFechaDocumental?: number | null;
  ordenFechaDesde?: number | null;
  ordenFechaHasta?: number | null;
  ordenClaveExterna?: number | null;
  ordenDetalle?: number | null;
  ordenDniCuitTitular?: number | null;
  ordenFechaCierre?: number | null;
  ordenNombreTitular?: number | null;
  ordenNumeroProducto?: number | null;
  aniosParaVencimiento: number;
}

interface CamposIncluir {
  name: string;
  label: string;
  requiredOrden?: boolean;
  jsonName: string;
}

export const ABMTipoDocumento: React.FC = () => {
  var api = apis['ABM_ENTIDADES'];
  var res = api.resources['REALIZAR_OPERACION'];

  const [form] = Form.useForm();

  const [listTipoDocumento, setListTipoDocumento] = useState<TipoDocumento[]>([]);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [tipoDocumentoSelect, setTipoDocumentSelect] = useState<TipoDocumentoDetail | null>(null);
  const [listClaseDocumento, setListClaseDocumento] = useState<ClaseDocumento[]>([]);

  // Manejo de estados para campos
  const [campos, setCampos] = useState<CamposIncluir[]>([]);

  useEffect(() => {
    // obtiene listado de tipos documento
    getListTipoDocumento();
    getListClaseDocumento();
    initCampos();
  }, []);

  const initCampos = () => {
    setCampos([
      { name: 'fechaDocumental', label: 'Fecha Documental', jsonName: 'FechaDocumental' },
      { name: 'fechaDesde', label: 'Fecha Desde', jsonName: 'FechaDesde' },
      { name: 'fechaHasta', label: 'Fecha Hasta', jsonName: 'FechaHasta' },
      { name: 'claveExterna', label: 'Clave Externa', jsonName: 'ClaveExterna' },
      { name: 'detalle', label: 'Detalle', jsonName: 'Detalle' },
      { name: 'dniCuitTitular', label: 'DNI / CUIT Titular', jsonName: 'DniCuitTitular' },
      { name: 'fechaCierre', label: 'Fecha de Cierre', jsonName: 'FechaCierre' },
      { name: 'nombreTitular', label: 'Nombre / Razón Social', jsonName: 'NombreTitular' },
      { name: 'numeroProducto', label: 'Núm. de Producto', jsonName: 'NumeroProducto' },
    ]);
  };

  const getListTipoDocumento = async () => {
    // obtiene listado de tipo de documento
    const axiosConfig = buildAxiosRequestConfig(api, res, { data: { operacion: 'L', entidad: 'Tipo Documento' } });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200) {
      setListTipoDocumento(response.data);
    } else {
      message.error('Ocurrió un error al obtener los tipos de documentos');
    }
  };

  const getListClaseDocumento = async () => {
    // obtiene listado de clases documento
    const axiosConfig = buildAxiosRequestConfig(api, res, { data: { operacion: 'L', entidad: 'Clase Documento' } });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200) {
      setListClaseDocumento(response.data);
    } else {
      message.error('Ocurrió un error al obtener las clases de documentos');
    }
  };

  const getTipoDocumento = async (id: number) => {
    // obtiene tipo de documento
    const axiosConfig = buildAxiosRequestConfig(api, res, { data: { operacion: 'D', entidad: 'Tipo Documento', id: id } });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200 && response.data.length > 0) {
      setTipoDocumentSelect(response.data[0]);
      return response.data[0];
    } else {
      message.error('Ocurrió un error al obtener el detalle del tipo de documento');
    }
  };

  const editarTipoDocumentoAction = (id: number) => {
    form.resetFields();
    initCampos();
    getTipoDocumento(id).then((value) => setVisibleModal(true));
  };

  const addTipoDocumentoAction = () => {
    form.resetFields();
    initCampos();
    setTipoDocumentSelect(null);
    setVisibleModal(true);
  };
  const eliminarTipoDocumento = async (id: number) => {
    const axiosConfig = buildAxiosRequestConfig(api, res, { data: { operacion: 'B', entidad: 'Tipo Documento', id: id } });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListTipoDocumento();
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al eliminar el tipo de documento');
    }
  };

  const modifyTipoDocumento = async (id: number, values: any) => {
    const axiosConfig = buildAxiosRequestConfig(api, res, {
      data: { operacion: 'M', entidad: 'Tipo Documento', id: id, parametros: values },
    });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListTipoDocumento();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al agregar el tipo de documento');
    }
  };

  const createTipoDocumento = async (values: any) => {
    const axiosConfig = buildAxiosRequestConfig(api, res, {
      data: { operacion: 'A', entidad: 'Tipo Documento', parametros: values },
    });
    const response = await axios.request<any>(axiosConfig);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListTipoDocumento();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al modificar el tipo de documento');
    }
  };

  const submitModal = (values: any) => {
    if (values['archivoPuedeGenerar'] === null || !values['archivoPuedeGenerar']) values['archivoPuedeGenerar'] = 0;
    else if (values['archivoPuedeGenerar']) values['archivoPuedeGenerar'] = 1;

    if (values['areaCentralPuedeGenerar'] === null || !values['areaCentralPuedeGenerar']) values['areaCentralPuedeGenerar'] = 0;
    else if (values['areaCentralPuedeGenerar']) values['areaCentralPuedeGenerar'] = 1;

    if (values['sucursalPuedeGenerar'] === null || !values['sucursalPuedeGenerar']) values['sucursalPuedeGenerar'] = 0;
    else if (values['sucursalPuedeGenerar']) values['sucursalPuedeGenerar'] = 1;

    if (values['sectorPropietarioEsId'] === null || !values['sectorPropietarioEsId']) values['sectorPropietarioEsId'] = 0;
    else if (values['sectorPropietarioEsId']) values['sectorPropietarioEsId'] = 1;

    if (values['solicitarIngresoSucCCPropietario'] === null || !values['solicitarIngresoSucCCPropietario'])
      values['solicitarIngresoSucCCPropietario'] = 0;
    else if (values['solicitarIngresoSucCCPropietario']) values['solicitarIngresoSucCCPropietario'] = 1;

    if (values['ordenClaveExterna'] === undefined) values['ordenClaveExterna'] = '';
    if (values['ordenDetalle'] === undefined) values['ordenDetalle'] = '';
    if (values['ordenDniCuitTitular'] === undefined) values['ordenDniCuitTitular'] = '';
    if (values['ordenFechaCierre'] === undefined) values['ordenFechaCierre'] = '';
    if (values['ordenFechaDesde'] === undefined) values['ordenFechaDesde'] = '';
    if (values['ordenFechaDocumental'] === undefined) values['ordenFechaDocumental'] = '';
    if (values['ordenFechaHasta'] === undefined) values['ordenFechaHasta'] = '';
    if (values['ordenNombreTitular'] === undefined) values['ordenNombreTitular'] = '';
    if (values['ordenNumeroProducto'] === undefined) values['ordenNumeroProducto'] = '';

    if (tipoDocumentoSelect === null) {
      createTipoDocumento(values);
    } else {
      modifyTipoDocumento(tipoDocumentoSelect.id, values);
    }
  };

  const changeRequerido = (value: any, name: string) => {
    let c = [...campos] as CamposIncluir[];

    const a = c.find((i) => i.jsonName === name);
    if (a) {
      a.requiredOrden = value !== 'A';
      if (!a.requiredOrden) form.setFieldsValue({ ['orden' + name]: '' });
    }
    setCampos(c);
  };

  const renderListCampos = () => {
    let render = [];
    for (let i = 0; i < campos.length; i = i + 2) {
      if (i + 1 < campos.length) render.push(renderConjuntoCampos(campos[i], i, campos[i + 1], i + 1));
      else render.push(renderConjuntoCampos(campos[i], i));
    }
    return render;
  };

  const renderConjuntoCampos = (
    c1: CamposIncluir,
    i1: number,
    c2: CamposIncluir | undefined = undefined,
    i2: number | undefined = undefined,
  ) => {
    if (c2 !== undefined && i2 !== undefined) {
      return (
        <Row gutter={24} key={`row${i1}`}>
          {renderFormItem(c1, i1)} {renderFormItemOrden(c1, i1)} {renderFormItem(c2, i2)} {renderFormItemOrden(c2, i2)}
        </Row>
      );
    } else {
      return (
        <Row gutter={18} key={`row${i1}`}>
          {renderFormItem(c1, i1)} {renderFormItemOrden(c1, i1)}
        </Row>
      );
    }
  };

  const renderFormItem = (c: CamposIncluir, i: number) => {
    return (
      <Col span={8} key={`9${i}1`}>
        <Form.Item
          name={`inclusion${c.jsonName}`}
          label={c.label}
          rules={[
            {
              required: true,
              message: 'Seleccione una opción',
            },
          ]}
          initialValue={tipoDocumentoSelect ? tipoDocumentoSelect[('inclusion' + c.jsonName) as keyof TipoDocumentoDetail] : null}>
          <Select style={{ width: 200 }} onChange={(value) => changeRequerido(value, c.jsonName)}>
            <Option value="A">Ausente</Option>
            <Option value="N">No requerido</Option>
            <Option value="R">Requerido</Option>
            <Option value="I">Identificador</Option>
          </Select>
        </Form.Item>
      </Col>
    );
  };

  const renderFormItemOrden = (c: CamposIncluir, i: number) => {
    var required: boolean | undefined;
    var initial: number | string = '';

    if (c.requiredOrden === undefined && tipoDocumentoSelect) {
      required = tipoDocumentoSelect[('inclusion' + c.jsonName) as keyof TipoDocumentoDetail] !== 'A';
      initial = tipoDocumentoSelect[('orden' + c.jsonName) as keyof TipoDocumentoDetail] as number;
    } else {
      required = c?.requiredOrden;
    }
    return (
      <Col span={4} key={`9${i}2`}>
        <Form.Item name={`orden${c.jsonName}`} label="Orden" initialValue={initial === 0 ? '' : initial}>
          <InputNumber min={1} max={9} disabled={!required} />
        </Form.Item>
      </Col>
    );
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Button
        type="primary"
        onClick={() => {
          addTipoDocumentoAction();
        }}
        style={{ float: 'right', marginRight: 8 }}>
        Agregar
      </Button>
      <br style={{ visibility: listTipoDocumento.length > 0 ? 'visible' : 'hidden' }} />
      <br style={{ visibility: listTipoDocumento.length > 0 ? 'visible' : 'hidden' }} />
      <span style={{ marginBottom: 4, float: 'right', visibility: listTipoDocumento.length > 0 ? 'visible' : 'hidden' }}>
        <Tag color="orange">Cantidad de registros: {listTipoDocumento.length}</Tag>
      </span>
      <Table dataSource={listTipoDocumento} rowKey="id" size="small">
        <Column
          title="ID"
          dataIndex="id"
          key="id"
          align="right"
          width={140}
          sorter={{ compare: (a: TipoDocumento, b: TipoDocumento) => compare(+a.id, +b.id), multiple: -1 }}
        />
        <Column
          title="Descripción"
          dataIndex="descripcion"
          key="descripcion"
          ellipsis={true}
          sorter={{ compare: (a: TipoDocumento, b: TipoDocumento) => compare(a.descripcion, b.descripcion), multiple: -1 }}
        />
        <Column
          title="Clase de Documento"
          dataIndex="claseDocumento"
          key="claseDocumento"
          ellipsis={true}
          sorter={{ compare: (a: TipoDocumento, b: TipoDocumento) => compare(a.idClaseDocumento, b.idClaseDocumento), multiple: -1 }}
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
                  <Button size="small" onClick={() => editarTipoDocumentoAction(text)}>
                    Editar
                  </Button>
                  <Popconfirm title="Está seguro?" onConfirm={(_) => eliminarTipoDocumento(text)}>
                    <Button size="small">Eliminar</Button>
                  </Popconfirm>
                </Space>
              </>
            );
          }}
        />
      </Table>
      <Form form={form} labelCol={{ span: 10 }} onFinish={submitModal}>
        <Modal
          title={(tipoDocumentoSelect ? 'Editar' : 'Crear') + ' Tipo Documento'}
          centered
          visible={visibleModal}
          destroyOnClose={true}
          getContainer={false}
          width="80%"
          onCancel={() => {
            setVisibleModal(false);
            setTipoDocumentSelect(null);
          }}
          onOk={() => form.submit()}>
          <Row gutter={18}>
            <Col span={8} key={'011'}>
              <Form.Item
                name={'descripcion'}
                label={'Descripción'}
                initialValue={tipoDocumentoSelect?.descripcion}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: 'Ingrese una descripción',
                  },
                ]}>
                <Input placeholder="Ingrese una descripción" />
              </Form.Item>
            </Col>
            <Col offset={2} span={8} key={'012'}>
              <Form.Item
                name={'descripcionCorta'}
                label={'Descripción Corta'}
                initialValue={tipoDocumentoSelect?.descripcionCorta}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: 'Ingrese una descripción corta',
                  },
                ]}>
                <Input placeholder="Ingrese una descripción corta" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={8} key={214}>
              <Form.Item
                name={'idClaseDocumento'}
                label={'Clase de Documento'}
                initialValue={tipoDocumentoSelect?.idClaseDocumento}
                rules={[
                  {
                    required: true,
                    message: 'Seleccione una clase de documento',
                  },
                ]}>
                <Select key={'idClaseDocumento'} style={{ width: 270 }} placeholder="Seleccione una clase de documento">
                  {listClaseDocumento.map((i) => {
                    return (
                      <Option key={i.id} value={i.id}>
                        {i.descripcion}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col offset={2} span={8} key={225}>
              <Form.Item<number>
                name={'aniosParaVencimiento'}
                initialValue={tipoDocumentoSelect?.aniosParaVencimiento}
                label={'Años para el vencimiento'}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese años para el vencimiento',
                  },
                ]}>
                <InputNumber min={0} type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={8} key={316}>
              <Form.Item
                name="sucursalPuedeGenerar"
                label="Puede generar"
                valuePropName="checked"
                initialValue={tipoDocumentoSelect?.sucursalPuedeGenerar ? 'checked' : null}>
                <Checkbox>Sucursal</Checkbox>
              </Form.Item>
            </Col>
            <Col span={5} key={327}>
              <Form.Item
                name="areaCentralPuedeGenerar"
                valuePropName="checked"
                initialValue={tipoDocumentoSelect?.areaCentralPuedeGenerar ? 'checked' : null}
                noStyle>
                <Checkbox>Area Central</Checkbox>
              </Form.Item>
            </Col>
            <Col span={5} key={338}>
              <Form.Item
                name="archivoPuedeGenerar"
                valuePropName="checked"
                initialValue={tipoDocumentoSelect?.archivoPuedeGenerar ? 'checked' : null}
                noStyle>
                <Checkbox>Archivo</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={18}>
            <Col span={8} key={349}>
              <Form.Item
                name="sectorPropietarioEsId"
                valuePropName="checked"
                label="Suc/CC Propietario"
                initialValue={tipoDocumentoSelect?.sectorPropietarioEsId ? 'checked' : null}>
                <Checkbox>Es identificador</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8} key={351}>
              <Form.Item
                name="solicitarIngresoSucCCPropietario"
                valuePropName="checked"
                initialValue={tipoDocumentoSelect?.solicitarIngresoSucCCPropietario ? 'checked' : null}
                noStyle>
                <Checkbox>Solicitar ingreso</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Campos a incluir</Divider>
          {renderListCampos()}
        </Modal>
      </Form>
    </div>
  );
};
