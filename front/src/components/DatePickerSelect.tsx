import { Moment } from 'moment';
import { useState, useEffect } from 'react';
import React from 'react';
import { Form, DatePicker, Row, Col } from 'antd';

type DatePickerSelectProps = {
  fechaDocDesde: Moment | null | undefined;
  fechaDocHasta: Moment | null | undefined;
  onChangeFechaDesde: (e: Moment | null) => void;
  onChangeFechaHasta: (e: Moment | null) => void;
  error: boolean;
  planilla?: string;
  contenido?: string;
  default: Moment | null; // NO SE ESTÁ USANDO Y ROMPIA TODO
  disabled?: boolean;
  setChange?: (e: boolean) => void;
};

export const DatePickerSelect: React.FC<DatePickerSelectProps> = (props) => {
  const [error, setError] = useState<boolean>(props.error);

  useEffect(() => {
    setError(props.error);
  }, [props.error]);

  //props.planilla ? error && props.planilla && !props.fechaDocDesde : error && props.contenido && !props.fechaDocDesde
  const esValidaFechaDesde = () => {
    return (
      (error && props.planilla && !props.fechaDocDesde) ||
      (error && props.contenido && !props.fechaDocDesde) ||
      ((props.contenido || props.planilla) && error && props.fechaDocDesde && props.fechaDocHasta)
    );
  };

  // (error && props.fechaDocDesde && !props.fechaDocHasta)
  const esValidoFechaHasta = () => {
    return (
      (error && props.fechaDocDesde && !props.fechaDocHasta) ||
      (error && props.fechaDocDesde && props.fechaDocHasta && props.fechaDocDesde > props.fechaDocHasta)
    );
  };

  const helpFechaDesde = () => {
    if ((error && props.planilla && !props.fechaDocDesde) || (error && props.contenido && !props.fechaDocDesde))
      return 'fecha doc. Desde es requerida';
    else {
      if (error && props.fechaDocDesde && props.fechaDocHasta && props.fechaDocDesde > props.fechaDocHasta) {
        return 'fecha doc. Desde debe ser menor o igual a fecha doc. Hasta';
      } else {
        return undefined;
      }
    }
  };

  // (error && props.fechaDocDesde && !props.fechaDocHasta) ? 'fecha doc. Hasta es requerida' : undefined
  const helpFechaHasta = () => {
    if (error && props.fechaDocDesde && !props.fechaDocHasta) return 'fecha doc. Hasta es requerida';
    else {
      if (error && props.fechaDocDesde && props.fechaDocHasta && props.fechaDocDesde > props.fechaDocHasta)
        return 'fecha doc. Hasta debe ser mayor o igual a fecha doc. Desde';
      else {
        return undefined;
      }
    }
  };

  return (
    <Col>
      <Row gutter={24}>
        <Col flex={1}>
          <Form.Item
            style={{ width: '100%' }}
            hasFeedback
            validateStatus={esValidaFechaDesde() ? 'error' : props.fechaDocDesde ? 'success' : undefined}
            initialValue={props.fechaDocDesde}
            help={helpFechaDesde()}
            label="Fecha Desde"
            labelCol={{ span: 4 }}
            name="Fecha documentación desde"
            rules={[{ required: true, message: 'fecha doc. desde es requerida' }]}>
            <DatePicker
              style={{ width: '180px' }}
              disabled={props.disabled}
              placeholder="dd/mm/aaaa"
              format={'DD/MM/YYYY'}
              value={props.fechaDocDesde}
              onChange={(e) => {
                props.setChange && props.setChange(true);
                props.onChangeFechaDesde(e);
              }}
            />
          </Form.Item>
        </Col>
        <Col flex={1}>
          <Form.Item
            style={{ paddingLeft: '10px', width: '100%' }}
            hasFeedback
            validateStatus={esValidoFechaHasta() ? 'error' : props.fechaDocHasta ? 'success' : undefined}
            initialValue={props.fechaDocHasta}
            help={helpFechaHasta()}
            labelCol={{ style: { marginRight: '0px' } }}
            label="Fecha Hasta"
            name="Fecha documentación hasta"
            rules={[{ required: true, message: 'fecha doc. hasta es requerida' }]}>
            <DatePicker
              placeholder="dd/mm/aaaa"
              style={{ width: '180px' }}
              disabled={props.disabled}
              format={'DD/MM/YYYY'}
              value={props.fechaDocHasta}
              onChange={(e) => {
                props.setChange && props.setChange(true);
                props.onChangeFechaHasta(e);
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Col>
  );
};
