import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Input,
  Space,
  Table,
  Tag,
  Select,
  Divider,
  message,
  Popconfirm,
  InputNumber,
  DatePicker,
  Checkbox,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';

import styles from '../style.module.less';
import { compare } from 'src/utils/string';
import axios from 'axios';
import Moment from 'moment';

const { Column } = Table;
const { Option } = Select;

interface Plantilla {
  descripcion: string;
  fechaDesde: Date;
  fechaHasta: Date;
  id: number;
  legacy: number;
  nombre: string;
}

interface ColumnaPlantilla {
  id: number;
  titulo: string | undefined;
  tipo: 'fecha' | 'lista' | 'decimal' | 'entero' | 'texto' | 'valores' | null;
  opcional: boolean | undefined;
  longitud: number | undefined;
  orden: number | undefined;
  idPlantilla: number | undefined;
}

interface TiposColumna {
  id: string;
  descripcion: string;
}

interface SectoresPlantilla {
  id: number;
  descripcion: string;
}

export const ABMPlantilla: React.FC = () => {
  const tipos: TiposColumna[] = [
    { id: 'fecha', descripcion: 'Fecha' },
    { id: 'lista', descripcion: 'Lista' },
    { id: 'decimal', descripcion: 'Número Decimal' },
    { id: 'entero', descripcion: 'Número Entero' },
    { id: 'texto', descripcion: 'Texto' },
    { id: 'valores', descripcion: 'Valores Fijo' },
  ];

  var api = apis['ABM_ENTIDADES'];
  var res = api.resources['REALIZAR_OPERACION'];

  const [form] = Form.useForm();
  const [formTable] = Form.useForm();

  const [listPlantilla, setListPlantilla] = useState<Plantilla[]>([]);
  const [listColumnaPlantilla, setListColumnaPlantilla] = useState<ColumnaPlantilla[]>([]);
  const [listSectores, setListSectores] = useState<SectoresPlantilla[]>([]);
  const [listSectoresPlantilla, setListSectoresPlantilla] = useState<string[]>([]);
  const [listSectoresGuardar, setListSectoresGuardar] = useState<number[]>([]);
  const [tipoColumna, setTipoColumna] = useState<string | null>(null);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [plantillaSelect, setPlantillaSelect] = useState<Plantilla | null>(null);
  const [editingColumna, setEditingColumna] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    getListPlantilla();
    getListSectores();
  }, []);

  useEffect(() => {
    if (plantillaSelect) {
      setVisibleModal(true);
    }
  }, [plantillaSelect]);

  useEffect(() => {
    if (plantillaSelect && editingColumna === null) getColumnasPlantilla(plantillaSelect.id);
  }, [editingColumna]);

  const executeCallWS = (operacion: string, entidad: string, parametros: any | null = null, id: number | null = null) => {
    const axiosConfig = buildAxiosRequestConfig(api, res, {
      data: { operacion: operacion, entidad: entidad, id: id, parametros: parametros },
    });
    return axios.request<any>(axiosConfig);
  };

  const getListPlantilla = async () => {
    const response = await executeCallWS('L', 'Plantilla');
    if (response.status === 200) {
      setListPlantilla(response.data);
    } else {
      message.error('Ocurrió un error al obtener las plantillas');
    }
  };

  const eliminarPlantilla = async (id: number) => {
    const response = await executeCallWS('B', 'Plantilla', null, id);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListPlantilla();
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al eliminar la plantilla');
    }
  };

  const getListSectores = async () => {
    const response = await executeCallWS('L', 'Sector');
    if (response.status === 200) {
      setListSectores(response.data);
    } else {
      message.error('Ocurrió un error al obtener los sectores');
    }
  };

  const getPlantilla = async (id: number) => {
    getSectoresPlantilla(id);
    const response = await executeCallWS('D', 'Plantilla', null, id);
    if (response.status === 200 && response.data.length > 0) {
      setPlantillaSelect(response.data[0]);
      getColumnasPlantilla(id);
      return response.data[0];
    } else {
      message.error('Ocurrió un error al obtener la plantilla');
    }
  };

  const getSectoresPlantilla = async (id: number) => {
    const response = await executeCallWS('D', 'PlantillaPorSector', null, id);
    if (response.status === 200 && response.data.length > 0) {
      renderSectoresPlantilla(response.data);
    } else if (response.status !== 200) {
      message.error('Ocurrió un error al obtener los sectores de la plantilla');
    } else renderSectoresPlantilla([]);
  };

  const editarPlantillaAction = (id: number) => {
    form.resetFields();
    getPlantilla(id);
  };

  const addPlantillaAction = () => {
    form.resetFields();
    setPlantillaSelect(null);
    setListColumnaPlantilla([]);
    setEditingColumna(null);
    setVisibleModal(true);
  };

  const addRowColumnasPlantilla = () => {
    let list = [...listColumnaPlantilla];
    list.unshift({ id: 0, titulo: '', tipo: null, opcional: undefined, idPlantilla: undefined, longitud: undefined, orden: undefined });
    setEditingColumna(0);
    setCurrentPage(1);
    setListColumnaPlantilla(list);
  };

  const modifyPlantilla = async (id: number, values: any) => {
    const response = await executeCallWS('M', 'Plantilla', values, id);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListPlantilla();
        setVisibleModal(false);

        if (listSectoresGuardar.length > 0) updateSectoresPlantilla(id);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al modificar la plantilla');
    }
  };

  const updateSectoresPlantilla = async (id: number) => {
    const response = await executeCallWS('B', 'PlantillaPorSector', null, id);
    if (response.status === 200) {
      listSectoresGuardar.forEach((item: number) => {
        executeCallWS('A', 'PlantillaPorSector', { idSector: item, idPlantilla: id });
      });
    } else {
      message.error('Ocurrió un error al modificar la plantilla');
    }
  };

  const createPlantilla = async (values: any) => {
    const response = await executeCallWS('A', 'Plantilla', values);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getListPlantilla();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al agregar la plantilla');
    }
  };

  const getColumnasPlantilla = async (id: number) => {
    const response = await executeCallWS('D', 'PlantillaColumna', null, id);
    if (response.status === 200 && response.data.length > 0) {
      setListColumnaPlantilla(response.data);
    } else if (response.status !== 200) {
      message.error('Ocurrió un error al obtener las columnas de la plantilla');
    } else setListColumnaPlantilla([]);
  };

  const submitModal = (values: any) => {
    setEditingColumna(null);

    values['fechaDesde'] = Moment(values['fechaDesde']).format('MM/DD/YYYY');
    values['fechaHasta'] = Moment(values['fechaHasta']).format('MM/DD/YYYY');

    plantillaSelect === null ? createPlantilla(values) : modifyPlantilla(plantillaSelect.id, values);
  };

  const addColumnaPlantilla = async (parametros: any) => {
    const response = await executeCallWS('A', 'PlantillaColumna', parametros);
    if (response.status === 200) {
      if (response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al agregar la columna');
    }
    setEditingColumna(null);
  };

  const submitColumna = (values: any) => {
    if (plantillaSelect && editingColumna !== null && editingColumna === 0) {
      values['opcional'] = values['opcional'] ? 1 : 0;
      addColumnaPlantilla(values);
    }
    formTable.resetFields();
  };

  const deleteColumna = async (id: number) => {
    if (plantillaSelect) {
      const response = await executeCallWS('B', 'PlantillaColumna', null, id);
      if (response.status === 200) {
        if (response.data[0].Estado === 'OK') {
          setEditingColumna(-1);
          setEditingColumna(null);
          message.success(response.data[0].Respuesta);
        } else {
          message.error(response.data[0].Respuesta);
        }
      } else {
        message.error('Ocurrió un error al eliminar la columna');
      }

      formTable.resetFields();
    }
  };

  const cancelColumna = () => {
    setEditingColumna(null);
    formTable.resetFields();
  };

  const filterOptions = (input: string, option: any) => {
    return option?.props.children.toLowerCase().indexOf(input.toLowerCase()) == 0;
  };

  const setSectoresToWS = (list: any) => {
    let ret: any[] = [];
    list.forEach((i: any) => {
      ret.push(i.key);
    });

    setListSectoresGuardar(ret);
  };

  const renderSectoresPlantilla = (list: SectoresPlantilla[]) => {
    let ret: string[] = [];
    list.forEach((i) => ret.push(i.descripcion));
    setListSectoresPlantilla(ret);
    form.setFieldsValue({ ['sectores']: ret });
  };

  const renderTablaColumnas = () => {
    return (
      <Form form={formTable} onFinish={submitColumna}>
        <Form.Item noStyle hidden={true} name={'idPlantilla'} initialValue={plantillaSelect?.id}>
          <Input hidden={true} />
        </Form.Item>
        <Divider>Columnas</Divider>
        <Button
          type="primary"
          size="small"
          disabled={editingColumna != null}
          onClick={() => {
            addRowColumnasPlantilla();
          }}
          style={{ float: 'right', marginRight: 8 }}>
          Agregar
        </Button>
        <br style={{ display: listColumnaPlantilla.length > 0 ? 'block' : 'none' }} />
        <br style={{ display: listColumnaPlantilla.length > 0 ? 'block' : 'none' }} />
        <span style={{ marginBottom: 4, float: 'right', visibility: listColumnaPlantilla.length > 0 ? 'visible' : 'hidden' }}>
          <Tag color="orange">Cantidad de registros: {listColumnaPlantilla.length}</Tag>
        </span>
        <Table
          dataSource={listColumnaPlantilla}
          rowKey="id"
          size="small"
          pagination={{ current: currentPage, onChange: (page) => setCurrentPage(page) }}>
          <Column
            title="Título"
            dataIndex="titulo"
            key="titulo"
            ellipsis={true}
            align="left"
            render={(text: string, record: ColumnaPlantilla) => {
              return editingColumna === record.id ? (
                <Form.Item
                  name={'titulo'}
                  initialValue={text}
                  noStyle
                  rules={[
                    {
                      required: false,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          message.error('Ingrese título');
                          return Promise.reject('Ingrese título');
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}>
                  <Input maxLength={100} size="small" />
                </Form.Item>
              ) : (
                text
              );
            }}
          />
          <Column
            title="Tipo"
            dataIndex="tipo"
            key="tipo"
            ellipsis={true}
            width={180}
            align="center"
            render={(text: string, record: ColumnaPlantilla) => {
              return editingColumna === record.id && editingColumna === 0 ? (
                <Form.Item
                  name={'tipo'}
                  noStyle
                  rules={[
                    {
                      required: false,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          message.error('Debe seleccionar un tipo');
                          return Promise.reject('Debe seleccionar un tipo');
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  initialValue={null}>
                  <Select
                    key={'select' + editingColumna.toString()}
                    style={{ width: 160 }}
                    showSearch
                    placeholder="Seleccione un tipo"
                    optionFilterProp="children"
                    onChange={(value) => {
                      setTipoColumna(value.toString());
                    }}
                    filterOption={(input, option) => filterOptions(input, option)}
                    size="small">
                    {tipos.map((i) => {
                      return (
                        <Option key={i.id} value={i.id}>
                          {i.descripcion}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              ) : (
                text
              );
            }}
          />
          <Column
            title="Orden"
            dataIndex="orden"
            key="orden"
            ellipsis={true}
            align="center"
            width={100}
            render={(text: string, record: ColumnaPlantilla) => {
              return editingColumna === record.id ? (
                <Form.Item
                  name={'orden'}
                  initialValue={text}
                  noStyle
                  rules={[
                    {
                      required: false,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || value < 0) {
                          message.error('Ingrese un orden válido');
                          return Promise.reject('Ingrese un orden válido');
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}>
                  <InputNumber type="number" size="small" style={{ width: 70 }} />
                </Form.Item>
              ) : (
                text
              );
            }}
          />

          <Column
            title="Opcional"
            dataIndex="opcional"
            key="opcional"
            ellipsis={true}
            align="center"
            width={100}
            render={(text: number, record: ColumnaPlantilla) => {
              return editingColumna === record.id ? (
                <Form.Item name={'opcional'} initialValue={text} noStyle valuePropName="checked">
                  <Checkbox />
                </Form.Item>
              ) : (
                <Checkbox checked={text === 1} disabled={true} />
              );
            }}
          />
          {editingColumna !== null && tipoColumna === 'texto' && (
            <Column
              title="Longitud"
              dataIndex="longitud"
              key="longitud"
              ellipsis={true}
              align="center"
              width={100}
              render={(text: string, record: ColumnaPlantilla) => {
                return editingColumna === record.id ? (
                  <Form.Item
                    name={'longitud'}
                    initialValue={text}
                    noStyle
                    rules={[
                      {
                        required: false,
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || value < 0) {
                            message.error('Ingrese una longitud válida');
                            return Promise.reject('Ingrese una longitud válida');
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}>
                    <InputNumber type="number" size="small" style={{ width: 70 }} />
                  </Form.Item>
                ) : null;
              }}
            />
          )}

          {editingColumna !== null && tipoColumna === 'lista' && (
            <Column
              title="Referencia"
              dataIndex="referencia"
              key="referencia"
              ellipsis={true}
              align="center"
              width={200}
              render={(text: string, record: ColumnaPlantilla) => {
                return editingColumna === record.id ? (
                  <Form.Item name={'referencia'} noStyle initialValue={'sector'}>
                    <Select key={'selectReferencia' + editingColumna.toString()} style={{ width: 180 }} size="small">
                      <Option key={'sector'} value={'sector'}>
                        Sector
                      </Option>
                    </Select>
                  </Form.Item>
                ) : (
                  text
                );
              }}
            />
          )}

          <Column
            title="Acciones"
            dataIndex="id"
            key="idDocumento"
            ellipsis={true}
            width={240}
            align="center"
            render={(text: number, record: ColumnaPlantilla, index: number) => {
              return editingColumna === record.id ? (
                <Space>
                  <Button type="default" key="btnConfirmar" htmlType="submit" size="small">
                    Confirmar
                  </Button>
                  <Button
                    htmlType="button"
                    size="small"
                    key="btnCancelar"
                    onClick={(event) => {
                      editingColumna === 0 ? cancelColumna() : deleteColumna(record.id);
                    }}>
                    Cancelar
                  </Button>
                </Space>
              ) : (
                <Space>
                  <Popconfirm title="Está seguro?" onConfirm={(_) => deleteColumna(record.id)}>
                    <Button size="small" key="btnEliminar" disabled={editingColumna != null}>
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
          addPlantillaAction();
        }}
        style={{ float: 'right', marginRight: 8 }}>
        Agregar
      </Button>
      <br style={{ display: listPlantilla.length > 0 ? 'block' : 'none' }} />
      <br style={{ display: listPlantilla.length > 0 ? 'block' : 'none' }} />
      <span style={{ marginBottom: 4, float: 'right', visibility: listPlantilla.length > 0 ? 'visible' : 'hidden' }}>
        <Tag color="orange">Cantidad de registros: {listPlantilla.length}</Tag>
      </span>
      <Table dataSource={listPlantilla} rowKey="id" size="small">
        <Column
          title="Nombre"
          dataIndex="nombre"
          key="nombre"
          ellipsis={true}
          sorter={{ compare: (a: Plantilla, b: Plantilla) => compare(a.nombre, b.nombre), multiple: -1 }}
        />
        <Column
          title="Descripción"
          dataIndex="descripcion"
          key="descripcion"
          ellipsis={true}
          sorter={{ compare: (a: Plantilla, b: Plantilla) => compare(a.descripcion, b.descripcion), multiple: -1 }}
        />
        <Column
          title="Fecha Desde"
          dataIndex="fechaDesde"
          key="fechaDesde"
          width={140}
          ellipsis={true}
          sorter={{ compare: (a: Plantilla, b: Plantilla) => compare(a.fechaDesde, b.fechaDesde), multiple: -1 }}
          render={(value) => Moment(value).format('DD/MM/YYYY')}
        />
        <Column
          title="Fecha Hasta"
          dataIndex="fechaHasta"
          key="fechaHasta"
          width={140}
          ellipsis={true}
          sorter={{ compare: (a: Plantilla, b: Plantilla) => compare(a.fechaHasta, b.fechaHasta), multiple: -1 }}
          render={(value) => Moment(value).format('DD/MM/YYYY')}
        />
        <Column
          title="Acciones"
          dataIndex="id"
          width={160}
          align="center"
          key="acciones"
          ellipsis={true}
          render={(text: number) => {
            return (
              <>
                <Space>
                  <Button size="small" onClick={() => editarPlantillaAction(text)}>
                    Editar
                  </Button>
                  <Popconfirm title="Está seguro?" onConfirm={(_) => eliminarPlantilla(text)}>
                    <Button size="small">Eliminar</Button>
                  </Popconfirm>
                </Space>
              </>
            );
          }}
        />
      </Table>
      <Modal
        title={(plantillaSelect ? 'Editar' : 'Crear') + ' Plantilla'}
        centered
        visible={visibleModal}
        destroyOnClose={true}
        getContainer={false}
        width="80%"
        onCancel={() => {
          setVisibleModal(false);
          setPlantillaSelect(null);
          setListColumnaPlantilla([]);
          setEditingColumna(null);
        }}
        onOk={() => form.submit()}>
        <Form form={form} labelCol={{ span: 10 }} wrapperCol={{ span: 10 }} onFinish={submitModal}>
          <Row gutter={24}>
            <Col span={12} key={11}>
              <Form.Item
                name={'nombre'}
                label={'Nombre'}
                initialValue={plantillaSelect?.nombre}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese un nombre',
                    whitespace: true,
                  },
                ]}>
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12} key={12}>
              <Form.Item
                name={'descripcion'}
                label={'Descripción'}
                initialValue={plantillaSelect?.descripcion}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese una descripción',
                    whitespace: true,
                  },
                ]}>
                <Input maxLength={255} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12} key={21}>
              <Form.Item
                name={'fechaDesde'}
                label={'Fecha Desde'}
                initialValue={plantillaSelect?.fechaDesde ? Moment(plantillaSelect?.fechaDesde) : null}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese fecha desde',
                  },
                ]}>
                <DatePicker format="DD/MM/YYYY" placeholder="" />
              </Form.Item>
            </Col>
            <Col span={12} key={22}>
              <Form.Item
                name={'fechaHasta'}
                label={'Fecha Hasta'}
                initialValue={plantillaSelect?.fechaHasta ? Moment(plantillaSelect?.fechaHasta) : null}
                rules={[
                  {
                    required: true,
                    message: 'Ingrese fecha hasta',
                  },
                ]}>
                <DatePicker format="DD/MM/YYYY" placeholder="" />
              </Form.Item>
            </Col>
          </Row>
          {plantillaSelect && (
            <Row gutter={24}>
              <Col span={12} key={31}>
                <Form.Item
                  name={'sectores'}
                  label={'Sectores'}
                  initialValue={listSectoresPlantilla}
                  rules={[
                    {
                      required: true,
                      message: 'Seleccione al menos un sector',
                    },
                  ]}>
                  <Select
                    mode="multiple"
                    allowClear={false}
                    style={{ width: '200%' }}
                    showSearch
                    onChange={(value, option) => {
                      setSectoresToWS(option);
                    }}
                    optionFilterProp="children"
                    filterOption={(input, option) => filterOptions(input, option)}>
                    {listSectores.map((i) => {
                      return (
                        <Option key={i.id} value={i.descripcion}>
                          {i.descripcion}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        {plantillaSelect ? renderTablaColumnas() : null}
      </Modal>
    </div>
  );
};
