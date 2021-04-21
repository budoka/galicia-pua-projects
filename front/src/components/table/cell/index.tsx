import { CheckOutlined, MinusOutlined } from '@ant-design/icons';
import { Checkbox, DatePicker, Input, Select } from 'antd';
import Form, { Rule } from 'antd/lib/form';
import { LabeledValue } from 'antd/lib/select';
import { SelectValue } from 'antd/lib/tree-select';
import classNames from 'classnames';
import moment from 'moment';
import { Moment, isMoment } from 'moment';
import React, { ReactElement, useEffect, useRef } from 'react';

import { DATE_DD_MM_YYYY_FORMAT, ELLIPSIS } from '../../../constants';
import { BasicComponentProps } from '../../../types';
import { InputType } from '..';
import styles from './style.module.less';

const { Option } = Select;

export interface CellProps extends BasicComponentProps<HTMLTableDataCellElement> {
  dataIndex: string;
  value: string | number | boolean | Moment;
  editing: boolean;
  inputType?: InputType;
  options?: LabeledValue[];
  hasFocus?: boolean;
  hasFeedback?: boolean;
  rules?: Rule[];
  onSelectChange?: (value: SelectValue, option: LabeledValue | any) => void;
}

export const Cell = React.memo((props: CellProps) => {
  const {
    dataIndex,
    value,
    title,
    editing,
    inputType,
    options,
    hasFocus,
    hasFeedback,
    rules,
    children,
    onSelectChange,
    ...restProps
  } = props;

  const cellRef = useRef<HTMLTableDataCellElement>(null);

  const className = classNames(styles.cell, props.className);

  useEffect(() => {
    if (hasFocus) {
      const input = cellRef?.current?.getElementsByTagName('input')[0];
      input && input.focus();
    }
  }, [editing, hasFocus]);

  const scrollOnFocus = () => {
    try {
      const parent = document.querySelector('.ant-table-body table')!;
      const parentX = parent.getBoundingClientRect().x;

      const child = document.querySelector('.ant-table-body')!;
      const childX = child.getBoundingClientRect().x;
      const childW = child.getBoundingClientRect().width;

      const cell = cellRef.current!;
      const cellX = cell.getBoundingClientRect().x;
      const cellW = cell.getBoundingClientRect().width;

      const verticalScrollbarWidth = 12;
      const actionColumnWidth = 210;

      const delta = cellX - (childW - actionColumnWidth - cellW) - (childX - verticalScrollbarWidth);

      const offSetParent = childX - parentX;

      child.scrollTo({ behavior: 'auto', left: Math.ceil(offSetParent + delta) });
    } catch (error) {}
  };

  const renderOptions = () => {
    if (!options) return null;
    return options!.map((option, index) => {
      const title = (option.label as ReactElement).props?.children ?? option.label;
      return (
        <Option key={option.key ?? option.value} value={option.value} title={title} className={styles.option}>
          {option.label}
        </Option>
      );
    });
  };

  const renderSelect = () => {
    if (editing)
      return (
        <Select showSearch showAction={['focus', 'click']} optionFilterProp="title" onChange={onSelectChange}>
          {renderOptions()}
        </Select>
      );

    const label =
      options?.find((option) => {
        return option.value === value;
      })?.label ?? React.Children.toArray(children)[0];

    const title = typeof label === 'object' ? (label as ReactElement).props.children : label;

    return (
      <span className={ELLIPSIS} title={title}>
        {label}
      </span>
    );

    // return <>{options?.find((option) => option.value === React.Children.toArray(children)[0])?.label ?? 'children'}</>;
  };

  const renderCheckbox = () => {
    if (editing) return <Checkbox />;
    return value ? <CheckOutlined /> : children;
  };

  const renderDatePicker = () => {
    if (editing) return <DatePicker format={DATE_DD_MM_YYYY_FORMAT} placeholder={''} allowClear />;
    const date = isMoment(value) ? (value as Moment).format(DATE_DD_MM_YYYY_FORMAT) : value;
    return <span title={date as string}>{date}</span>;
    //return <>{children}</>;
  };

  const renderText = () => {
    if (editing) return <Input />;
    //  return <span title={value as string}>{value}</span>;
    return children;
  };

  const renderField = (inputType?: InputType) => {
    if (dataIndex && dataIndex !== 'key' && dataIndex !== 'actions' && !value && value !== 0 && !editing) return <MinusOutlined />;

    switch (inputType) {
      case 'select':
        return renderSelect();
      case 'date':
        return renderDatePicker();
      case 'checkbox':
        return renderCheckbox();
      case 'text':
      default:
        return renderText();
    }
  };

  const getInitialValue = () => {
    if (inputType === 'select' && options?.length === 1) return options[0].value;
  };

  return (
    <td {...restProps} className={className} title={title} ref={cellRef} onFocus={scrollOnFocus}>
      {editing ? (
        <Form.Item
          // normalize={(value, prevValue, allValues) => normalizeValue(value)}
          initialValue={getInitialValue()}
          name={dataIndex}
          style={{ margin: 0, padding: 0 }}
          rules={rules}
          hasFeedback={inputType === 'checkbox' ? false : hasFeedback}
          valuePropName={inputType === 'checkbox' ? 'checked' : 'value'}>
          {renderField(inputType)}
        </Form.Item>
      ) : (
        renderField(inputType)
      )}
    </td>
  );
});
