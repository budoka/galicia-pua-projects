import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { IFilterItem } from '../filter-input/types';
import { LabeledValue, SelectValue } from 'antd/lib/select';

import './add-filter.less';
import { Filtro } from '../add-filter-type';
//import { Filtro } from '../../views/buscar-documentos-gd';

const { Option } = Select;

interface AddFilterProps {
  filtros: IFilterItem[];
  onChangeFilter: (itemSelected: IFilterItem) => void;
  filterType?: Filtro;
}

export const AddFilter: React.FC<AddFilterProps> = (props) => {
  const [valueSelected, setValueSelected] = useState<string | number | React.ReactText[] | LabeledValue | LabeledValue[] | undefined>(
    undefined,
  );

  const onChangeFilter = (value: SelectValue, fn: Function) => {
    fn(props.filtros.find((v) => v.label === value));
    setValueSelected('');
  };

  const renderOptions = () => {
    return props.filtros.map((item, i) => {
      return (
        <Option key={i} value={item.label}>
          {item.label}
        </Option>
      );
    });
  };

  return (
    <Select
      id="selFiltros"
      className="add-filter__select"
      placeholder="Seleccione un filtro"
      value={valueSelected}
      showSearch
      onChange={(value, option) => onChangeFilter(value, props.onChangeFilter)}>
      {renderOptions()}
    </Select>
  );
};
