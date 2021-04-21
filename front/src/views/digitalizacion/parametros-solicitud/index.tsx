import { Alert, Button, Col, Form, Input, message, Row, Select, Space } from 'antd';
import { Rule } from 'antd/lib/form';
import { useForm } from 'antd/lib/form/Form';
import { LabeledValue } from 'antd/lib/select';
import { AxiosRequestConfig } from 'axios';
import React, { useEffect, useState } from 'react';
import { DigitalizacionState, layout, messageLayout, Reglas, tailLayout } from '..';
import { getURLs } from '../../../utils/ConfigurationServices';
import axios from 'axios';
import styles from './style.module.less';

const { Option } = Select;

// Reglas de validación

const reglas: Reglas = {
  idOperacion: [
    {
      pattern: /^[\d\w ]+$/,
    },
  ],
};

interface ProcesoBodyResponse {
  id: number;
  descripcion: string;
}

interface SubprocesoBodyRequest {
  idProceso: number;
}

interface SubprocesoBodyResponse {
  id: number;
  descripcion: string;
  mensajeAyuda: string;
}

interface ParametrosSolicitudForm {
  proceso: LabeledValue;
  subproceso: LabeledValue;
  idOperacion: string;
}

interface ParametrosSolicitudState {
  listaProcesos?: ProcesoBodyResponse[];
  listaSubprocesos?: SubprocesoBodyResponse[];
  subprocesoVisible?: boolean;
  idOperacionVisible?: boolean;
  iniciadorSolicitudVisible?: boolean;
  mensaje?: string | null;
}

interface UIState {
  form?: { disabled: boolean };
}

interface ParametrosSolicitudProps {
  setParametrosSolicitud: React.Dispatch<
    React.SetStateAction<Pick<DigitalizacionState, 'idProceso' | 'idSubproceso' | 'idOperacion'> | null | undefined>
  >;
}

export const ParametrosSolicitud: React.FC<ParametrosSolicitudProps> = React.memo((props) => {
  const [form] = useForm<ParametrosSolicitudForm>();
  const [state, setState] = useState<ParametrosSolicitudState>({});
  const [uIState, setUIState] = useState<UIState>({});

  useEffect(() => {
    (async () => {
      const listaProcesos = await getProcesos();
      setState((prev) => ({ ...prev, listaProcesos }));
    })();
  }, []);

  const getProcesos = async () => {
    const endpoint = getURLs().ObtenerProcesos;

    const config: AxiosRequestConfig = {
      method: 'POST',
      url: endpoint,
    };
    // Consultar servicio.
    return await axios
      .request<ProcesoBodyResponse[]>(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        // message.error('Error al cargar los procesos. Por favor intente nuevamente.');
        return undefined;
      });
  };

  const getSubprocesos = async (data: SubprocesoBodyRequest) => {
    const endpoint = getURLs().ObtenerSubprocesosPorProceso;

    const config: AxiosRequestConfig = {
      method: 'POST',
      url: endpoint,
      data,
    };
    // Consultar servicio.
    return await axios
      .request<SubprocesoBodyResponse[]>(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        // message.error('Error al cargar los procesos. Por favor intente nuevamente.');
        return undefined;
      });
  };

  const handleForm = (values: ParametrosSolicitudForm) => {
    const { proceso, subproceso, idOperacion } = values;
    setUIState({ form: { disabled: true } });
    props.setParametrosSolicitud({ idProceso: +proceso.value, idSubproceso: +subproceso.value, idOperacion: idOperacion || '' });
  };

  const handleReset = () => {
    form.resetFields();
    setState((prev) => ({ listaProcesos: prev.listaProcesos, listaSubprocesos: prev.listaSubprocesos }));
    setUIState({});
    props.setParametrosSolicitud(null);
  };

  const handleProceso = async (value: LabeledValue, option: any) => {
    form.resetFields(['subproceso', 'idOperacion']);
    const listaSubprocesos = await getSubprocesos({ idProceso: +value.value });
    const mensaje = listaSubprocesos?.length === 0 ? 'No existen subprocesos disponibles para digitalizar' : null;

    setState((prev) => ({
      ...prev,
      subprocesoVisible: true,
      idOperacionVisible: false,
      iniciadorSolicitudVisible: false,
      listaSubprocesos,
      mensaje,
    }));
  };

  const handleSubproceso = (value: LabeledValue, option: any) => {
    form.resetFields(['idOperacion']);
    const mensaje = state.listaSubprocesos!.find((s) => s.id === form.getFieldValue('subproceso').value)?.mensajeAyuda;
    setState((prev) => ({ ...prev, idOperacionVisible: true, iniciadorSolicitudVisible: true, mensaje }));
  };

  useEffect(() => { }, [state.iniciadorSolicitudVisible]);

  const renderOptions = (options: any[]) => {
    return options.map((option, index) => (
      <Option key={option.id} value={option.id} id={option.id} descripcion={option.descripcion}>
        {option.descripcion}
      </Option>
    ));
  };

  return (
    <>
      <Form {...layout} className={styles.form} form={form} name="parametros" onFinish={handleForm}>
        <Form.Item name="proceso" label="Proceso" required>
          <Select labelInValue placeholder="Seleccione un proceso" onChange={handleProceso} disabled={uIState.form?.disabled}>
            {renderOptions(state.listaProcesos || [])}
          </Select>
        </Form.Item>

        {state.subprocesoVisible && state.listaSubprocesos?.length! > 0 && (
          <Form.Item name="subproceso" label="Subproceso" required>
            <Select labelInValue placeholder="Seleccione un subproceso" onChange={handleSubproceso} disabled={uIState.form?.disabled}>
              {renderOptions(state.listaSubprocesos || [])}
            </Select>
          </Form.Item>
        )}

        {state.idOperacionVisible && (
          <Form.Item name="idOperacion" label="ID Operación" rules={reglas['idOperacion']} hasFeedback>
            <Input placeholder={'Ingrese id de operación'} disabled={uIState.form?.disabled} allowClear />
          </Form.Item>
        )}

        {state.iniciadorSolicitudVisible && (
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" disabled={uIState.form?.disabled}>
              Generar
            </Button>

            <Button type="link" htmlType="button" onClick={handleReset}>
              Limpiar
            </Button>
          </Form.Item>
        )}
      </Form>

      {state.mensaje && (
        <Row style={{ marginBottom: messageLayout.row.marginBottom }}>
          <Col {...messageLayout.col}>
            <Alert message={`${state.mensaje}`} showIcon type="info" />
          </Col>
        </Row>
      )}
    </>
  );
});
