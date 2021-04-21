import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Form, DatePicker, InputNumber, Upload, message, Tooltip } from 'antd';
import { IFilterItem, IItemValue } from './types';
import { MinusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import styles from './style.module.less';
import { getValuesFromColumn } from 'src/utils/ExportExcel';
import { FormInstance } from 'antd/lib/form';

const { Option } = Select;
const { RangePicker } = DatePicker;

const listCompareDefaultNumber: IItemValue[] = [
  { id: 'igual', descripcion: 'igual' },
  { id: 'distinto', descripcion: 'distinto' },
  { id: 'mayor', descripcion: 'mayor que' },
  { id: 'menor', descripcion: 'menor que' },
  { id: 'mayorIgual', descripcion: 'mayor igual que' },
  { id: 'menorIgual', descripcion: 'menor igual que' },
];

const listCompareDefaultText: IItemValue[] = [
  { id: 'contiene', descripcion: 'contiene' },
  { id: 'igual', descripcion: 'igual' },
  { id: 'distinto', descripcion: 'distinto' },
  { id: 'mayor', descripcion: 'mayor que' },
  { id: 'menor', descripcion: 'menor que' },
  { id: 'mayorIgual', descripcion: 'mayor igual que' },
  { id: 'menorIgual', descripcion: 'menor igual que' },
];

const listCompareDefaultDate: IItemValue[] = [
  { id: 'entre', descripcion: 'entre' },
  { id: 'igual', descripcion: 'igual' },
  { id: 'distinto', descripcion: 'distinto' },
  { id: 'mayor', descripcion: 'mayor que' },
  { id: 'menor', descripcion: 'menor que' },
  { id: 'mayorIgual', descripcion: 'mayor igual que' },
  { id: 'menorIgual', descripcion: 'menor igual que' },
];

const listCompareDefaultList: IItemValue[] = [
  { id: 'igual', descripcion: 'igual' },
  { id: 'distinto', descripcion: 'distinto' },
];

interface SearchFilterProps {
  filter: IFilterItem;
  onDeleteFilter: (itemSelected: IFilterItem) => void;
  options: boolean;
  onChangeFilter?: (itemSelected: string) => void;
  onUpload?: (field: string, data: string[]) => void;
}

export const FilterInput: React.FC<SearchFilterProps> = (props) => {
  const { filter, onDeleteFilter, options, onChangeFilter, onUpload } = props;

  const [criteria, setCriteria] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);

  const renderCompare = (): React.ReactNode => {
    if (filter.listCompare == undefined) {
      switch (filter.type) {
        case 'number':
          filter.listCompare = listCompareDefaultNumber;
          break;
        case 'date':
          filter.listCompare = listCompareDefaultDate;
          break;
        case 'list':
        case 'list-search':
          filter.listCompare = listCompareDefaultList;
          break;
        default:
          filter.listCompare = listCompareDefaultText;
          break;
      }
    }
    const options = filter.listCompare.map((item, i) => {
      return itemToJSX(item);
    });

    return (
      <Select className={styles.selectbefore} onChange={(value, option) => setCriteria(String(value))}>
        {options}
      </Select>
    );
  };

  const itemToJSX = (item: IItemValue) => {
    return (
      <Option key={item.id} value={item.id}>
        {item.descripcion}
      </Option>
    );
  };

  const renderOptions = (item: IItemValue) => {
    return itemToJSX(item);
  };

  const filterOptions = (input: string, option: any) => {
    return option?.props.children.toLowerCase().indexOf(input.toLowerCase()) == 0;
  };

  const renderControl = () => {
    switch (filter.type) {
      case 'number':
        return (
          <>
            {options && (
              <Form.Item name={`${filter.wsField}Filtro`} initialValue="igual" noStyle>
                {renderCompare()}
              </Form.Item>
            )}
            <Form.Item
              name={filter.wsField}
              noStyle
              rules={[
                {
                  required: true,
                  message: 'Por favor ingrese un valor',
                },
              ]}>
              <InputNumber min={0} placeholder={filter.label} autoFocus className={styles.input}></InputNumber>
            </Form.Item>
          </>
        );
      case 'date':
        return (
          <>
            {options && (
              <Form.Item name={`${filter.wsField}Filtro`} initialValue="igual" noStyle>
                {renderCompare()}
              </Form.Item>
            )}
            {criteria != 'entre' ? (
              <Form.Item name={`${filter.wsField}Desde`} noStyle rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}>
                <DatePicker placeholder={filter.label} autoFocus format="DD/MM/YYYY" className={styles.input}></DatePicker>
              </Form.Item>
            ) : (
              <Form.Item name={`${filter.wsField}Hasta`} noStyle rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}>
                <RangePicker placeholder={['desde', 'hasta']} autoFocus format="DD/MM/YYYY" className={styles.rangedate}></RangePicker>
              </Form.Item>
            )}
          </>
        );
      case 'list-search':
        return (
          <>
            {options && (
              <Form.Item name={`${filter.wsField}Filtro`} initialValue="igual" noStyle>
                {renderCompare()}
              </Form.Item>
            )}
            <Form.Item name={filter.wsField} noStyle rules={[{ required: true, message: 'Por favor seleccione una opción' }]}>
              <Select
                placeholder={filter.label}
                autoFocus
                className={styles.input}
                showSearch
                style={{ width: '300px' }}
                optionFilterProp="children"
                onChange={(e) => {
                  onChangeFilter && onChangeFilter(e.toString());
                }}
                filterOption={(input, option) => filterOptions(input, option)}>
                {filter.listValues?.map((item, i) => renderOptions(item))}
              </Select>
            </Form.Item>
          </>
        );
      case 'list':
        return (
          <>
            {options && (
              <Form.Item name={`${filter.wsField}Filtro`} initialValue="igual" noStyle>
                {renderCompare()}
              </Form.Item>
            )}
            <Form.Item name={filter.wsField} noStyle rules={[{ required: true, message: 'Por favor seleccione una opción' }]}>
              <Select placeholder={filter.label} autoFocus className={styles.input}>
                {filter.listValues?.map((item, i) => renderOptions(item))}
              </Select>
            </Form.Item>
          </>
        );
      case 'multiple':
        return (
          <>
            {options && (
              <Form.Item name={`${filter.wsField}Filtro`} initialValue="contiene" noStyle>
                {renderCompare()}
              </Form.Item>
            )}

            <Form.Item name={filter.wsField} noStyle rules={[{ required: true, message: 'Por favor ingrese un valor' }]}>
              <Select
                mode="tags"
                autoFocus
                placeholder={filter.label}
                allowClear
                className={styles.multiple}
                dropdownStyle={{ display: 'none' }}
                onDeselect={() => {}}></Select>
            </Form.Item>

            <Form.Item noStyle>
              <Upload
                accept=".csv,.xls,.xlsx"
                showUploadList={false}
                beforeUpload={(file) => {
                  const allowedTypes = [
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv',
                  ];
                  if (!allowedTypes.includes(file.type)) {
                    message.error(`El formato del archivo no es válido para importar`);
                  } else {
                    setLoading(true);
                    (async () => {
                      const values = await getValuesFromColumn(file, 'A');
                      const data = Array.from(values.values());
                      onUpload && onUpload(filter.wsField, data);
                      setLoading(false);
                    })();
                  }

                  // Prevent upload
                  return false;
                }}>
                <Tooltip placement="top" title={'Importar archivo'}>
                  <span style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
                    <Button
                      className={styles.importButton}
                      style={{ pointerEvents: 'none' }}
                      loading={loading}
                      icon={<UploadOutlined />}></Button>
                  </span>
                </Tooltip>
              </Upload>
            </Form.Item>
          </>
        );
      default:
        return (
          <>
            {options && (
              <Form.Item name={`${filter.wsField}Filtro`} initialValue="contiene" noStyle>
                {renderCompare()}
              </Form.Item>
            )}

            <Form.Item name={filter.wsField} noStyle>
              <Input placeholder={filter.label} autoFocus className={styles.input}></Input>
            </Form.Item>
          </>
        );
    }
  };

  return (
    <Form.Item label={filter.label}>
      <Input.Group compact>
        {renderControl()}
        <Tooltip placement="top" title={'Eliminar filtro'}>
          <Button className="buttonDelete" type="link" icon={<MinusCircleOutlined />} onClick={(event) => onDeleteFilter(filter)} />
        </Tooltip>
      </Input.Group>
    </Form.Item>
  );
};
