import { getElementError } from '@testing-library/dom';
import { Button, Form, message, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import form from 'antd/lib/form';
import { GetRowKey } from 'antd/lib/table/interface';
import axios from 'axios';
import React, { ReactComponentElement, useEffect, useState } from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { compare } from 'src/utils/string';

import styles from './style.module.less';

const { Column } = Table;
const { Option } = Select;

type WrappedProps<T> = {
  entidad: string;
  titulo: string;
  campos: ABMDinamicoCampos[];
  rowKey: string;
  fnBeforeSubmit?: (values: any) => Function;
  fnAfterGetByID?: (object: T) => Function;
};

export type ABMDinamicoCampos = {
  titulo: string;
  camposWS: string;
  widthCol?: number | undefined;
  align?: 'center' | 'right' | 'left' | undefined;
  render?: (value: any, record: unknown, index: number) => React.ReactNode;
};

type ABMDinamicoProps<T> = React.PropsWithChildren<WrappedProps<T>>;

export const ABMDinamico = <T extends object>(props: ABMDinamicoProps<T>) => {
  const { entidad, titulo, campos, children, fnBeforeSubmit, rowKey, fnAfterGetByID } = props;

  const [list, setList] = useState<T[]>([]);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [elementSelect, setElementSelect] = useState<T | null>(null);
  const [id, setID] = useState<any | null>(null);

  useEffect(() => {
    getList();
  }, []);

  const [form] = Form.useForm();

  /* METODOS DE APIS */
  var api = apis['ABM_ENTIDADES'];
  var res = api.resources['REALIZAR_OPERACION'];

  const executeCall = (operacion: string, entidad: string, parametros: any | null = null, id: any | null = null) => {
    const axiosConfig = buildAxiosRequestConfig(api, res, {
      data: { operacion: operacion, entidad: entidad, id: id, parametros: parametros },
    });
    return axios.request<any>(axiosConfig);
  };

  /* METODOS DE ABM CON WS */
  const getList = async () => {
    const response = await executeCall('L', entidad);
    if (response.status === 200) {
      setList(response.data);
    } else {
      message.error('Ocurrió un error al obtener el listado');
    }
  };

  const getElementByID = async (id: any) => {
    const response = await executeCall('D', entidad, null, id);
    if (response.status === 200 && response.data.length > 0) {
      setElementSelect(response.data[0]);

      const data = fnAfterGetByID ? fnAfterGetByID(response.data[0]) : response.data[0];
      setObjectToForm(data);
      return data;
    } else {
      message.error('Ocurrió un error al obtener el elemento');
    }
  };

  const createElement = async (values: any) => {
    const response = await executeCall('A', entidad, values);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getList();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al agregar el elemento');
    }
  };

  const editElement = async (id: any, values: any) => {
    const response = await executeCall('M', entidad, values, id);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getList();
        setVisibleModal(false);
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al modificar el elemento');
    }
  };

  const deleteElement = async (id: number) => {
    const response = await executeCall('B', entidad, null, id);
    if (response.status === 200) {
      if (response.data.length > 0 && response.data[0].Estado === 'OK') {
        message.success(response.data[0].Respuesta);
        getList();
      } else {
        message.error(response.data[0].Respuesta);
      }
    } else {
      message.error('Ocurrió un error al eliminar el elemento');
    }
  };

  /* METODOS DE ABM DE FORMULARIO */
  const prepareCreateElement = () => {
    form.resetFields();
    setElementSelect(null);
    setVisibleModal(true);
  };

  const prepareEditElement = (id: number) => {
    form.resetFields();
    setID(id);
    getElementByID(id);
  };

  const setObjectToForm = (e: T) => {
    var keys = Object.keys(e);
    keys.forEach((i) => {
      form.setFieldsValue({ [i]: e[i as keyof T] });
    });
    setVisibleModal(true);
  };

  const submitForm = (values: any) => {
    if (fnBeforeSubmit) values = fnBeforeSubmit(values);
    elementSelect === null ? createElement(values) : editElement(id, values);
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Button
        type="primary"
        onClick={() => {
          prepareCreateElement();
        }}
        style={{ float: 'right', marginRight: 8 }}>
        Agregar
      </Button>
      <br style={{ display: list.length > 0 ? 'block' : 'none' }} />
      <br style={{ display: list.length > 0 ? 'block' : 'none' }} />
      <span style={{ marginBottom: 4, float: 'right', visibility: list.length > 0 ? 'visible' : 'hidden' }}>
        <Tag color="orange">Cantidad de registros: {list.length}</Tag>
      </span>
      <Table key={`table${entidad}`} dataSource={list} rowKey={rowKey} size="small">
        {campos.map((i) => {
          return (
            <Column
              title={i.titulo}
              dataIndex={i.camposWS}
              align={i.align}
              key={i.titulo}
              width={i.widthCol}
              ellipsis={true}
              sorter={{ compare: (a: T, b: T) => compare(a[i.camposWS as keyof T], b[i.camposWS as keyof T]), multiple: -1 }}
              render={(text, record, index) => {
                return i.render === undefined ? text : i.render(text, record, index);
              }}
            />
          );
        })}
        <Column
          title="Acciones"
          dataIndex={rowKey}
          width={160}
          align="center"
          key="acciones"
          ellipsis={true}
          render={(text: number) => {
            return (
              <>
                <Space>
                  <Button size="small" onClick={() => prepareEditElement(text)}>
                    Editar
                  </Button>
                  <Popconfirm title="Está seguro?" onConfirm={(_) => deleteElement(text)}>
                    <Button size="small">Eliminar</Button>
                  </Popconfirm>
                </Space>
              </>
            );
          }}
        />
      </Table>
      <Modal
        title={(elementSelect ? 'Editar ' : 'Crear ') + titulo}
        centered
        visible={visibleModal}
        destroyOnClose={true}
        getContainer={false}
        width="80%"
        onCancel={() => {
          setVisibleModal(false);
          setElementSelect(null);
        }}
        onOk={() => form.submit()}>
        <Form form={form} labelCol={{ span: 10 }} wrapperCol={{ span: 10 }} onFinish={submitForm}>
          {children}
        </Form>
      </Modal>
    </div>
  );
};
