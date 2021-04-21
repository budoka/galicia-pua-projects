import { Col, Form, Input, Row } from 'antd';
import React from 'react';
import { ABMDinamico, ABMDinamicoCampos } from '../../../components/abm-dinamico';

export const campos: ABMDinamicoCampos[] = [
  { camposWS: 'id', titulo: 'ID', align: 'right', widthCol: 140 },
  { camposWS: 'descripcion', titulo: 'Descripción' },
];

export type EtiquetaRecord = {
  id: number;
  descripcion: string;
};

export const ABMEtiquetas: React.FC = () => {
  return (
    <ABMDinamico<EtiquetaRecord> entidad="Etiquetas" titulo="Etiqueta" rowKey="id" campos={campos}>
      <div>
        <Row gutter={24}>
          <Col span={12} key={11}>
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
              <Input maxLength={100} style={{ width: '200%' }} />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </ABMDinamico>
  );
};
