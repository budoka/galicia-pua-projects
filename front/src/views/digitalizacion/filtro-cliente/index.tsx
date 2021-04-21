import { unwrapResult } from '@reduxjs/toolkit';
import { Alert, Button, Col, Form, Input, message, Row, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { ArgsProps } from 'antd/lib/message';
import { PaginationConfig } from 'antd/lib/pagination';
import { LabeledValue } from 'antd/lib/select';
import { stringify } from 'query-string';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Texts } from 'src/constants/texts';
import { fetchPersonas } from 'src/features/shared';
import { Filtro, Persona } from 'src/features/shared/types';
import { RootState } from 'src/reducers';
import { useAppDispatch } from 'src/store';
import { compare } from 'src/utils/string';
import { DigitalizacionState, layout, messageLayout, Reglas, tailLayout } from '..';
import { BasicComponentProps, Opcion } from '../../../types';
import { ListaClientes } from './lista-clientes';
import styles from './style.module.less';

const { Option } = Select;

// Para testear el modal de resultados de usuarios

/* const data = new Array(100).fill('').map((e, i) => {
  return { title: i };
}) as any[]; */

// MAURO EMANUEL PORTILLO DU: 0035157861 BOUCHARD HIPOLITO 4181 JOSE MARMOL B1845CYG

// Reglas de validación

const reglas: Reglas = {
  CUIT: [
    {
      required: true,
      pattern: /^(?:\d{11}|(?:\d{2}-\d{8}-\d{1}))$/,
    },
  ],
  CUIL: [
    {
      required: true,
      pattern: /^(?:\d{11}|(?:\d{2}-\d{8}-\d{1}))$/,
    },
  ],
  DU: [
    {
      required: true,
      // pattern: /^\d+$/,
    },
  ],
  LE: [
    {
      required: true,
      // pattern: /^\d+$/,
    },
  ],
  LC: [
    {
      required: true,
      // pattern: /^\d+$/,
    },
  ],
  CI: [
    {
      required: true,
      // pattern: /^\d+$/,
    },
  ],
  NombreApellido: [
    {
      required: true,
      // pattern: /^[a-záéíóúäëïöü]+( ?[a-záéíóúäëïöü])+$/i,
    },
  ],
  RazonSocial: [
    {
      required: true,
      //  pattern: /^[a-záéíóúäëïöü]+( ?[a-záéíóúäëïöü]\.\,\*\-\_)+$/i,
    },
  ],
};

const loadingMessage: ArgsProps = {
  key: 'loading',
  type: 'loading',
  content: Texts.LOADING,
  duration: 0,
};

interface FiltroClienteForm {
  filtro: LabeledValue;
  valor1: string;
  valor2: string;
}

export interface FiltroClienteState {
  placeholderValor?: string | string[];
  valorVisible?: boolean;
  listaUsuarios?: ListaState;
  cliente?: Persona | null;
}

interface ListaState {
  clientes: Persona[];
  visible: boolean;
  pagination?: PaginationConfig;
}

interface UIState {
  form?: { disabled: boolean };
}

interface FiltroClienteProps extends BasicComponentProps<HTMLFormElement> {
  setFiltroCliente: React.Dispatch<
    React.SetStateAction<
      Pick<DigitalizacionState, 'hostId' | 'clienteTipoDoc' | 'documentoCliente' | 'nombreCliente' | 'nombreSolicitante'> | null | undefined
    >
  >;
  setParametrosSolicitud: React.Dispatch<
    React.SetStateAction<Pick<DigitalizacionState, 'idProceso' | 'idSubproceso' | 'idOperacion'> | null | undefined>
  >;
}

export const FiltroCliente: React.FC<FiltroClienteProps> = React.memo((props) => {
  const [form] = useForm<FiltroClienteForm>();
  const [state, setState] = useState<FiltroClienteState>({});
  const [uIState, setUIState] = useState<UIState>({});

  const sesion = useSelector((state: RootState) => state.sesion);
  const digitalizaciones = useSelector((state: RootState) => state.digitalizaciones.digitalizaciones);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (digitalizaciones.data.personas.loading) {
      message.loading(loadingMessage);
    }
  }, [digitalizaciones.data.personas.loading]);



  useEffect(() => {
    if (digitalizaciones.data?.personas?.value?.length === 0) return;

    const clientes: Persona[] = digitalizaciones.data?.personas?.value;

    let cantidadClientes = clientes?.length;

    // Si usuario === 1 muestro el usuario encontrado.
    if (cantidadClientes === 1) setCliente(clientes[0]);
    // Si usuarios > 1 muestro la lista de usuarios encontrados.
    else if (cantidadClientes > 1)
      setState((prev) => ({ ...prev, listaUsuarios: { clientes: clientes, visible: true, pagination: { current: 1 } } }));
  }, [digitalizaciones.data.personas]);

  useEffect(() => {
    handleReset();
  }, []);


  const setCliente = (cliente?: Persona) => {
    setState((prev) => ({
      ...prev,
      listaUsuarios: { clientes: [], visible: false },
      cliente: cliente,
    }));

    setUIState({ form: { disabled: true } });
    props.setFiltroCliente({
      hostId: cliente?.idHost!,
      clienteTipoDoc: cliente?.documento?.tipo!,
      documentoCliente: cliente?.documento?.numeroDocumento!,
      nombreCliente: cliente?.razonSocial ? cliente?.razonSocial : (cliente?.apellido! + ', ' + cliente?.nombre!), // reemplazar acá
      nombreSolicitante: sesion.data.nombreUsuario!,
    });
  };

  const handleForm = (values: FiltroClienteForm) => {
    const filtro: Filtro =
      values.filtro.value === 'NombreApellido'
        ? 'PorNombreApellido'
        : values.filtro.value === 'RazonSocial'
          ? 'PorRazonSocial'
          : (values.filtro.value as Filtro);
    const nombre = filtro === 'PorNombreApellido' ? values.valor1 : undefined;
    const apellido = filtro === 'PorNombreApellido' ? values.valor2 : undefined;
    const razonSocial = filtro === 'PorRazonSocial' ? values.valor1 : undefined;
    //const documento = !nombre && !razonSocial ? values.valor1.replaceAll('-', '') : undefined;
    const documento = !nombre && !razonSocial ? values.valor1.split('-').join('') : undefined;

    dispatch(
      fetchPersonas({
        data: {
          filtro,
          legajo: sesion.data.legajo!,
          nombre,
          apellido,
          razonSocial,
          documento,
          tipoBusqueda: 2,
        },
      }),
    )
      .then(unwrapResult)
      .then(() => {
        message.success({ key: 'loading', content: Texts.SEARCH_PERSON_OK, duration: 3 });
        //buscarCliente()
      })
      .catch((err) => {
        message.error({ key: 'loading', content: Texts.SEARCH_PERSON_ERROR, duration: 3 });
      });
  };

  const handleReset = () => {
    form.resetFields();
    setState({
      placeholderValor: '',
      valorVisible: false,
      cliente: null,
      listaUsuarios: { clientes: [], visible: false },
    });
    setUIState({});
    props.setFiltroCliente(null);
    props.setParametrosSolicitud(null);
  };

  const handleTipoDocumento = (value: LabeledValue, option: any) => {
    form.resetFields(['valor1', 'valor2']);
    let placeholder: string | string[];

    if (value.value === 'NombreApellido') placeholder = ['Nombre', 'Apellido'];
    else placeholder = value.label?.toString()!;

    setState((prev) => ({
      placeholderValor: placeholder,
      valorVisible: true,
      listaUsuarios: { ...prev.listaUsuarios!, visible: false },
    }));
  };

  return (
    <>
      <Form {...layout} className={styles.form} form={form} name="filtro" onFinish={handleForm}>
        <Form.Item label="Buscar cliente por" style={{ marginBottom: 0 }} required>
          <Input.Group>
            <Form.Item name={['filtro']}>
              <Select labelInValue placeholder="Seleccione un filtro" onChange={handleTipoDocumento} disabled={uIState.form?.disabled}>
                <Option value="CUIT">CUIT</Option>
                <Option value="CUIL">CUIL</Option>
                <Option value="DU">DU</Option>
                <Option value="CI">CI</Option>
                <Option value="LE">LE</Option>
                <Option value="LC">LC</Option>
                <Option value="NombreApellido">Nombre y Apellido</Option>
                <Option value="RazonSocial">Razón Social</Option>
              </Select>
            </Form.Item>

            {state.valorVisible &&
              ((typeof state.placeholderValor === 'string' && (
                <Form.Item name={['valor1']} rules={reglas[form.getFieldValue(['filtro']).value]} required hasFeedback>
                  <Input placeholder={`Ingrese ${state.placeholderValor?.toLowerCase()}`} disabled={uIState.form?.disabled} allowClear />
                </Form.Item>
              )) ||
                (Array.isArray(state.placeholderValor) &&
                  state.placeholderValor.map((value, index) => (
                    <Form.Item
                      key={value}
                      name={['valor' + (index + 1)]}
                      rules={reglas[form.getFieldValue(['filtro']).value]}
                      required
                      hasFeedback>
                      <Input placeholder={`Ingrese ${value.toLowerCase()}`} disabled={uIState.form?.disabled} allowClear />
                    </Form.Item>
                  ))))}
          </Input.Group>
        </Form.Item>

        {state.valorVisible && (
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" disabled={uIState.form?.disabled}>
              Buscar
            </Button>

            <Button type="link" htmlType="button" onClick={handleReset}>
              Limpiar
            </Button>
          </Form.Item>
        )}
      </Form>

      <ListaClientes state={state} setState={setState} setCliente={setCliente} />

      {state.cliente && (
        <Row style={{ marginBottom: messageLayout.row.marginBottom }}>
          <Col {...messageLayout.col}>
            <Alert
              message={
                <>
                  <span className={styles.labelAlert}>Cliente:</span>
                  <span>{state.cliente.nombre ? `${state.cliente.nombre} ${state.cliente.apellido}` : `${state.cliente.razonSocial}`}</span>
                </>
              }
              description={
                <Col>
                  {state.cliente.documento?.numeroDocumento && (
                    <Row>
                      <>
                        <span className={styles.labelAlert}>{`${state.cliente.documento?.tipo}:`}</span>
                        <span>{`${state.cliente.documento?.numeroDocumento}`}</span>
                      </>
                    </Row>
                  )}
                  <Row>
                    <>
                      <span className={styles.labelAlert}>Dirección:</span>
                      <span>{`${Object.values(state.cliente.direccion).join(' ')}`}</span>
                    </>
                  </Row>
                </Col>
              }
              showIcon
              type="success"
            />
          </Col>
        </Row>
      )}
    </>
  );
});
