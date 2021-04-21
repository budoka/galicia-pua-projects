//import { Filtro } from "../../views/buscar-documentos-gd";
import React, { useState } from "react";
import { Form, Select } from 'antd';
import { LabeledValue, SelectValue } from "antd/lib/select";

const { Option } = Select;

export interface Filtro {
  id: string,
  label: string,
}
interface AddFilterTypeProps {
    filtros: Filtro[];
    onChangeFiltro: (filtroSelected: Filtro) => void;
  }

  
export const AddfilterType: React.FC<AddFilterTypeProps> = (props) => {
  //const [valueSelected, setValueSelected] = useState<string | number | React.ReactText[] | LabeledValue | LabeledValue[] | undefined>(undefined);

  
  const onChangeFiltro = (value: SelectValue, f: Function) => {
    f(props.filtros.find((v) => v.label === value));
    //setValueSelected('');
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
      id="selTipoFiltro"
      className="add-type-filter__select"
      placeholder="Seleccione un tipo de filtro"
      //value={valueSelected}
      showSearch
      onChange={(value, option) => onChangeFiltro(value, props.onChangeFiltro)}>
      {renderOptions()}
    </Select>
  );
};

