import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Checkbox, DatePicker } from 'antd';
import { TipoCaja } from '../types/TipoCaja';
import { DatePickerSelect } from './DatePickerSelect';
import { Plantilla } from './PlantillaSelect';
import { Moment } from 'moment';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { buscarFechaVencimiento } from '../API/AbrirCajaAPI';
import { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import { Texts } from 'src/constants/texts';

const { RangePicker } = DatePicker;

type SelectGroupProps = {
  currentCaja: string | undefined;
  currentContenido: string | undefined;
  setCurrentCaja: (e: string | undefined) => void;
  tiposCajas: TipoCaja[];
  tiposContenido: string[];
  setCurrentContenido: (e: string | undefined) => void;
  currentPlantilla: string | undefined;
  setCurrentPlantilla: (e: string | undefined) => void;
  setCurrentFechaVencimiento: (e: Moment | null) => void;
  currentFechaDocDesde: Moment | null;
  currentFechaDocHasta: Moment | null;
  setCurrentFechaDocDesde: (e: Moment | null) => void;
  setCurrentFechaDocHasta: (e: Moment | null) => void;
  currentRestringido: boolean;
  setCurrentRestringido: (e: boolean) => void;
  currentDescripcion: string;
  setCurrentDescripion: (e: string) => void;
  buscarIdCaja: () => TipoCaja | undefined;
  error: boolean;
  setError: (e: boolean) => void;
};

export const SelectGroup = (props: SelectGroupProps) => {
  //const [error, setError] = useState<boolean>(false)

  const [componentSize, setComponentSize] = useState<number | string>('middle');

  const [form] = Form.useForm();

  /*
    useEffect(() => {
        setError(props.error)
    },[props.error]);
    */

  useEffect(() => {
    form.resetFields(['tipo Contenido']);
    form.resetFields(['plantilla']);
    form.resetFields(['fecha']);
    // form.resetFields(['Fecha documentación hasta']);
  }, [props.currentCaja]);

  useEffect(() => {
    form.resetFields(['plantilla']);
    form.resetFields(['fecha']);
    //  form.resetFields(['Fecha documentación hasta']);
  }, [props.currentContenido]);

  const onFormLayoutChange = (size: number) => {
    setComponentSize(size);
  };

  const actualizarPlantillaSeleccionada = (plantilla: string | undefined) => {
    props.setError(false);
    props.setCurrentPlantilla(plantilla);
  };

  const actualizarFechaVencimiento = (e: Moment | null) => {
    let idCaja: any = props.buscarIdCaja()?.id;
    props.setError(false);
    props.setCurrentFechaDocHasta(e);

    buscarFechaVencimiento(idCaja, props.currentContenido)
      .then((anios) => {
        props.setCurrentFechaVencimiento(e ? e.clone().add(anios, 'year') : null);
      })
      .catch((e) => e);
  };

  const actualizarFechaDocDesde = (e: Moment | null) => {
    props.setError(false);
    props.setCurrentFechaDocDesde(e);
  };

  const onChangeCheck = (e: CheckboxChangeEvent) => {
    props.setCurrentRestringido(e.target.checked);
  };

  return (
    <div className="container">
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        initialValues={{ size: componentSize }}
        onValuesChange={() => onFormLayoutChange}
        size={'middle'}>
        <Form.Item
          name="tipo de Caja"
          label="Tipo de caja"
          hasFeedback
          validateStatus={props.error && !props.currentCaja ? 'error' : undefined}
          help={props.error && !props.currentCaja ? 'Debe seleccionar un tipo de caja' : undefined}
          rules={[{ required: true, message: 'Un tipo de caja es requerido' }]}
        //shouldUpdate={true}
        >
          <Select
            value={props.currentCaja}
            onChange={(e) => {
              props.setCurrentContenido(undefined);
              props.setCurrentPlantilla(undefined);
              props.setCurrentFechaDocDesde(null);
              props.setCurrentFechaDocHasta(null);
              props.setCurrentFechaVencimiento(null);
              props.setError(false);
              props.setCurrentCaja(e);
              //form.validateFields() // muestra el mensaje de error, atencion con esto !!
              //form.resetFields(['fecha desde'])
              //form.resetFields(['fecha hasta'])
            }}>
            {props.tiposCajas &&
              props.tiposCajas.map((tipo, key) => (
                <Select.Option value={tipo.descripcion} key={key}>
                  {tipo.descripcion}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tipo Contenido"
          label="Tipo de contenido"
          validateStatus={props.error && props.currentCaja && !props.currentContenido ? 'error' : undefined}
          help={props.error && props.currentCaja && !props.currentContenido ? 'Debe seleccionar un tipo de contenido' : undefined}
          hasFeedback
          rules={[{ required: true, message: 'Un tipo de contenido es requerido' }]}>
          <Select
            value={props.currentContenido}
            onChange={(e) => {
              props.setCurrentPlantilla(undefined);
              props.setCurrentFechaDocDesde(null);
              props.setCurrentFechaDocHasta(null);
              props.setCurrentFechaVencimiento(null);
              props.setError(false);
              props.setCurrentContenido(e);
            }}>
            {props.tiposContenido &&
              props.tiposContenido.map((c, key) => (
                <Select.Option value={c} key={key}>
                  {c}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        {props.currentContenido && props.currentContenido === 'Caja con Detalle' ? (
          <>
            <Plantilla
              name={'plantilla'}
              seleccionada={props.currentPlantilla}
              setSeleccionada={actualizarPlantillaSeleccionada}
              error={props.error}
            />

            <Form.Item
              name="fecha"
              label="Fecha de documentación"
              help={
                props.error && !props.currentFechaDocDesde && !props.currentFechaDocHasta
                  ? 'Debe ingresar una fecha de documentación'
                  : undefined
              }
              validateStatus={props.error && !props.currentFechaDocDesde && !props.currentFechaDocHasta ? 'error' : undefined}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'La fecha de documentación es requerida',
                },
              ]}
            /* initialValue={[props.currentFechaDocDesde, props.currentFechaDocHasta]} */
            >
              <RangePicker
                format={'DD/MM/YYYY'}
                allowClear={false}
                style={{ width: '100%' }}
                ranges={{
                  Hoy: [moment(), moment().endOf('day')],
                  [`1 ${Texts.MONTH}`]: [moment(), moment().add(1, 'month').endOf('day')],
                  [`3 ${Texts.MONTHS}`]: [moment(), moment().add(3, 'month').endOf('day')],
                  [`6 ${Texts.MONTHS}`]: [moment(), moment().add(6, 'month').endOf('day')],
                  [`1 ${Texts.YEAR}`]: [moment(), moment().add(1, 'year').endOf('day')],
                }}
                onChange={(values) => {
                  const fechaDesde = values && values.length > 0 && values[0];

                  actualizarFechaDocDesde(fechaDesde ? fechaDesde : null);

                  const fechaHasta = values && values.length > 1 && values[1];

                  actualizarFechaVencimiento(fechaHasta ? fechaHasta : null);
                }}
              />
            </Form.Item>
          </>
        ) : props.currentContenido && props.currentContenido === 'Caja con Etiqueta' ? (
          <>
            <Form.Item
              name="fecha"
              label="Fecha de documentación"
              help={
                props.error && !props.currentFechaDocDesde && !props.currentFechaDocHasta
                  ? 'Debe ingresar una fecha de documentación'
                  : undefined
              }
              validateStatus={props.error && !props.currentFechaDocDesde && !props.currentFechaDocHasta ? 'error' : 'success'}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'La fecha de documentación es requerida',
                },
              ]}
              initialValue={[props.currentFechaDocDesde, props.currentFechaDocHasta]}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(values) => {
                  const fechaDesde = values && values.length > 0 && values[0];

                  props.setCurrentFechaDocDesde(fechaDesde ? fechaDesde : null);

                  const fechaHasta = values && values.length > 1 && values[1];

                  actualizarFechaVencimiento(fechaHasta ? fechaHasta : null);
                }}
              />
            </Form.Item>

            {/*  <DatePickerSelect
              fechaDocDesde={props.currentFechaDocDesde}
              fechaDocHasta={props.currentFechaDocHasta}
              onChangeFechaDesde={actualizarFechaDocDesde}
              onChangeFechaHasta={actualizarFechaVencimiento}
              error={props.error}
              contenido={props.currentContenido}
              default={null}
            /> */}
          </>
        ) : (
          <></>
        )}

        <Form.Item name={['user', 'introduction']} label="Descripción">
          <Input.TextArea
            allowClear
            value={props.currentDescripcion}
            maxLength={200}
            onChange={(e) => props.setCurrentDescripion(e.currentTarget.value)}
          />
        </Form.Item>

        <Form.Item label="Restringir" style={{ textAlign: 'left' }}>
          <Checkbox checked={props.currentRestringido} onChange={(e) => onChangeCheck(e)} />
        </Form.Item>
      </Form>
    </div>
  );
};
