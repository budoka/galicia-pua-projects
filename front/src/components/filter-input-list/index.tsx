import React from 'react';
import { FilterInput } from '../filter-input';
import { IFilterItem } from '../filter-input/types';

interface FilterInputListProps {
  filters: IFilterItem[]; // los filtros seleccionados
  onDeleteFilter: (itemSelected: IFilterItem) => void;
  options: boolean; // un boolean que indica si se tiene que mostrar o no el filtro de opciones de busqueda
  onChangeFilter?: (itemSelected: string) => void;
  onUpload?: (field: string, data: string[]) => void;
}

export const FilterInputList: React.FC<FilterInputListProps> = (props) => {
  const { filters, onDeleteFilter, options, onChangeFilter, onUpload } = props;

  const renderList = () => {
    return filters.map((item, i) => {
      return (
        <FilterInput
          filter={item}
          key={item.label}
          onDeleteFilter={onDeleteFilter}
          onChangeFilter={onChangeFilter}
          options={options}
          onUpload={onUpload}>
        </FilterInput>
      );
    });
  };

  return <div>{renderList()}</div>;
};
