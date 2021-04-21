import { Checkbox, Col, Form, Input, Row } from 'antd';
import React from 'react';
import { ABMDinamico, ABMDinamicoCampos } from '../../../components/abm-dinamico';

export const campos: ABMDinamicoCampos[] = [
  { camposWS: 'id', titulo: 'ID', align: 'right', widthCol: 140 },
  { camposWS: 'descripcion', titulo: 'Descripción' },
];

export type ClaseDocumentosRecord = {
  id: number;
  descripcion: string;
  admiteDocumentosHijos: boolean;
};

export const ABMClaseDocumentos: React.FC = () => {
  const changeValues = (values: any) => {
    values['admiteDocumentosHijos'] = values['admiteDocumentosHijos'] ? 1 : 0;
    return values;
  };

  return (
    <ABMDinamico<ClaseDocumentosRecord>
      entidad="Clases de Documento"
      titulo="Clase de Documento"
      rowKey="id"
      campos={campos}
      fnBeforeSubmit={changeValues}>
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
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12} key={12}>
            <Form.Item name={'admiteDocumentosHijos'} noStyle valuePropName="checked">
              <Checkbox>Admite documentos hijos</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </div>
    </ABMDinamico>
  );
};
