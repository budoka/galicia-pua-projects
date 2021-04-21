import { Checkbox, Col, Form, Input, Radio, Row, Space } from 'antd';
import React from 'react';
import { ABMDinamico, ABMDinamicoCampos } from '../../../components/abm-dinamico';

const renderCheck = (value: any, record: unknown, index: number) => {
  return <Checkbox checked={value === 1} disabled={true} />;
};

export const campos: ABMDinamicoCampos[] = [
  { camposWS: 'claveExterna', titulo: 'Clave Externa', widthCol: 140, align: 'right' },
  { camposWS: 'descripcion', titulo: 'Descripción' },
  {
    camposWS: 'sucursal',
    titulo: 'Sucursal',
    widthCol: 120,
    align: 'center',
    render: renderCheck,
  },
  {
    camposWS: 'areaCentral',
    titulo: 'Area Central',
    widthCol: 120,
    align: 'center',
    render: renderCheck,
  },
  {
    camposWS: 'archivo',
    titulo: 'Archivo',
    widthCol: 120,
    align: 'center',
    render: renderCheck,
  },
  {
    camposWS: 'enviaCajas',
    titulo: 'Envía Cajas',
    widthCol: 120,
    align: 'center',
    render: renderCheck,
  },
  {
    camposWS: 'retiraCajas',
    titulo: 'Retira Cajas',
    widthCol: 120,
    align: 'center',
    render: renderCheck,
  },
];

export type SectorRecord = {
  id: number;
  descripcion: string;
  claveExterna: boolean;
  sucursal: boolean;
  areaCentral: boolean;
  archivo: boolean;
  enviaCajas: boolean;
  retiraCajas: boolean;
  caja: string;
  sector: string[];
};

export const ABMSector: React.FC = () => {
  const changeValues = (values: any) => {
    values['archivo'] = 0;
    values['areaCentral'] = 0;
    values['sucursal'] = 0;
    values['sector'].forEach((i: string) => {
      switch (i) {
        case 'archivo':
          values['archivo'] = 1;
          break;
        case 'areaCentral':
          values['areaCentral'] = 1;
          break;
        case 'sucursal':
          values['sucursal'] = 1;
          break;
      }
    });
    values['puedeGenerarCajasOtrosSectores'] = values['puedeGenerarCajasOtrosSectores'] ? 1 : 0;
    values['restringeCajas'] = values['restringeCajas'] ? 1 : 0;

    if (values['caja'] == 'enviaCajas') {
      values['enviaCajas'] = 1;
      values['retiraCajas'] = 0;
    } else {
      values['enviaCajas'] = 0;
      values['retiraCajas'] = 1;
    }
    return values;
  };

  const changeData = (o: SectorRecord) => {
    if (o.enviaCajas) o.caja = 'enviaCajas';
    else if (o.retiraCajas) o.caja = 'retiraCajas';

    o.sector = [];
    if (o.archivo) o.sector.push('archivo');
    if (o.areaCentral) o.sector.push('areaCentral');
    if (o.sucursal) o.sector.push('sucursal');

    const ret: any = o;
    return ret;
  };

  return (
    <ABMDinamico<SectorRecord>
      entidad="Sector"
      titulo="Sector"
      rowKey="id"
      campos={campos}
      fnBeforeSubmit={changeValues}
      fnAfterGetByID={changeData}>
      <div>
        <Row gutter={24}>
          <Col span={12} key={11}>
            <Form.Item
              name={'claveExterna'}
              label={'Clave Externa'}
              rules={[
                {
                  required: true,
                  message: 'Ingrese una clave externa',
                  whitespace: true,
                },
              ]}>
              <Input maxLength={50} />
            </Form.Item>
          </Col>
          <Col span={12} key={12}>
            <Form.Item
              name="sector"
              rules={[
                {
                  required: true,
                  message: 'Debe seleccionar una opción',
                },
              ]}>
              <Checkbox.Group
                options={[
                  { label: 'Archivo', value: 'archivo' },
                  { label: 'Area Central', value: 'areaCentral' },
                  { label: 'Sucursal', value: 'sucursal' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12} key={21}>
            <Form.Item
              name={'descripcion'}
              label={'Descripción'}
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
          <Col span={12} key={22}>
            <Space>
              <Form.Item name="puedeGenerarCajasOtrosSectores" valuePropName="checked" noStyle>
                <Checkbox>Puede generar cajas de otros sectores</Checkbox>
              </Form.Item>
              <Form.Item name="restringeCajas" valuePropName="checked" noStyle>
                <Checkbox>Restringir Cajas</Checkbox>
              </Form.Item>
            </Space>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12} key={31}>
            <Form.Item name={'email'} label={'Email'}>
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12} key={32}>
            <Form.Item
              name="caja"
              rules={[
                {
                  required: true,
                  message: 'Debe seleccionar una opción',
                },
              ]}>
              <Radio.Group>
                <Radio.Button value="enviaCajas">Envía cajas</Radio.Button>
                <Radio.Button value="retiraCajas">Retira cajas</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </div>
    </ABMDinamico>
  );
};
