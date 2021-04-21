import { Checkbox, DatePicker, Form, Input, Select } from 'antd';
import { FormInstance, useForm } from 'antd/lib/form/Form';
import _ from 'lodash';
import React from 'react';
import { DATE_DD_MM_YYYY_FORMAT } from 'src/constants';
import { ObjectLiteral } from 'src/types';
import { Parametro, TipoDatoParametro } from '../../types';
import styles from './style.module.less';

interface FormModalProps<T = any> {
  form: FormInstance<T>;
  parametros: Parametro[];
  disabled: boolean;
}

export function FormModal(props: FormModalProps) {
  const { form, parametros, disabled } = props;

  const renderInputText = () => <Input disabled={disabled} />;
  const renderInputList = () => (
    <Select showAction={['focus', 'click']} optionFilterProp="title" disabled={disabled} onChange={() => {}}>
      {/* options */}
    </Select>
  );
  const renderInputDate = () => <DatePicker format={DATE_DD_MM_YYYY_FORMAT} placeholder={''} disabled={disabled} allowClear />;
  const renderInputBoolean = () => <Checkbox disabled={disabled} />;

  const renderField = (tipoDato: TipoDatoParametro) => {
    switch (tipoDato) {
      case 'TEXTO':
      case 'NUMERO':
        return renderInputText();
      case 'LISTA':
        return renderInputList();
      case 'FECHA':
        return renderInputDate();
      case 'BOOLEAN':
        return renderInputBoolean();
    }
  };

  const renderFormItems = (parametros: Parametro[]) =>
    parametros.map((param) => {
      const pattern = param.patron ? new RegExp(param.patron) : undefined;
      const required = !!pattern;
      const rules = [_.pickBy({ required, pattern }, (v) => v !== undefined)];

      return (
        <Form.Item key={param.parametro} name={param.parametro} label={param.descripcion} hasFeedback rules={rules} required={required}>
          {renderField(param.tipoDato)}
        </Form.Item>
      );
    });

  return (
    <Form className={styles.form} form={form} name="form">
      {renderFormItems(parametros)}
    </Form>
  );
}
