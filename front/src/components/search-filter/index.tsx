import React, { useState, useEffect } from 'react';
import { AddFilter } from '../add-filter';
import { FilterInputList } from '../filter-input-list';
import { IFilterItem } from '../filter-input/types';
import { Button, Form, message } from 'antd';
import { Moment, isMoment } from 'moment';
import { isArray } from 'lodash';
import { useForm } from 'antd/lib/form/Form';
import axios, { AxiosRequestConfig } from 'axios';
import { BasicComponentProps } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/reducers';

interface SearchFilterProps extends BasicComponentProps<HTMLDivElement> {
  filters: IFilterItem[];
  wrapperClassName?: string;
  wsConfig: AxiosRequestConfig;
  didSearched: (values: any, openResult: boolean, searchParams?: any) => void;

}

export const SearchFilter: React.FC<SearchFilterProps> = (props) => {
  const { filters, className, didSearched, wsConfig } = props;

  const [form] = useForm();

  const [availableFilters, setAvailableFilters] = useState<IFilterItem[]>(filters);
  const [currentFilters, setCurrentFilters] = useState<IFilterItem[]>([]);
  const [searching, setSearching] = useState<boolean>(false);


  const sesion = useSelector((state: RootState) => state.sesion);

  const userData = {
    roles: sesion.data.roles,
    sector: sesion.data.idSector,
    idUsuario: sesion.data.idUsuario
  };


  useEffect(() => {
    if (currentFilters.length === 0) didSearched([], false);
  }, [currentFilters]);

  const search = async (values: any) => {
    message.loading('Buscando...');
    setSearching(true);
    try {
      const data = { ...wsConfig.data, ...userData, ...values };
      const response = await axios.request({ ...wsConfig, data });
      didSearched(response.data, true, values);
      setSearching(false);
    } catch (error) {
      message.error('Error al llamar al buscar los documentos. Intente de nuevo');
      setSearching(false);
    }
    message.destroy();
  };

  const onChangeFilter = (filterToAdd: IFilterItem) => {
    if (!filterToAdd) return;

    // agrega filtro a los seleccionados
    const currentFilters = addFilter(filterToAdd);

    // actualiza filtros disponibles
    updateAvailableFilters(currentFilters);
  };

  const onDeleteFilter = (filterToRemove: IFilterItem) => {
    if (!filterToRemove) return;

    // elimina filtro de los seleccionados
    const currentFilters = removeFilter(filterToRemove);

    // actualiza filtros disponibles
    updateAvailableFilters(currentFilters);

    // limpia valores del input del formulario
    cleanFilter(filterToRemove);
  };

  const addFilter = (filterToAdd: IFilterItem) => {
    const selectedFilters = [...currentFilters, filterToAdd];
    setCurrentFilters([...selectedFilters]);
    return selectedFilters;
  };

  const removeFilter = (filterToRemove: IFilterItem) => {
    const selectedFilters = currentFilters.filter((filter) => filter !== filterToRemove);
    setCurrentFilters([...selectedFilters]);
    return selectedFilters;
  };

  const updateAvailableFilters = (selectedFilters: IFilterItem[]) => {
    let allFilters = [...filters];
    allFilters = allFilters.filter((filter) => !selectedFilters.includes(filter));
    setAvailableFilters(allFilters);
  };

  const cleanFilter = (removedItem: IFilterItem) => {
    if (removedItem.type === 'date') {
      form.resetFields([`${removedItem.wsField}Desde`]);
      form.resetFields([`${removedItem.wsField}Hasta`]);
      form.resetFields([`${removedItem.wsField}Filtro`]);
    } else {
      form.resetFields([`${removedItem.wsField}`]);
      form.resetFields([`${removedItem.wsField}Filtro`]);
    }
  };

  const handleFinishForm = (values: any) => {
    Object.keys(values).forEach((item) => {
      // si es un valor fecha
      if (isMoment(values[item])) {
        values[item] = (values[item] as Moment).format('YYYY-MM-DD 00:00:00.000');
      }
      // si es un array y los dos elementos son fecha
      else if (isArray(values[item]) && isMoment(values[item][0]) && isMoment(values[item][1])) {
        values[item.replace('Hasta', 'Desde')] = (values[item][0] as Moment).format('YYYY-MM-DD 00:00:00.000');
        values[item] = (values[item][1] as Moment).format('YYYY-MM-DD 00:00:00.000');
      }
    });

    search(values);
  };

  const resetForm = () => {
    setAvailableFilters([...filters]);
    setCurrentFilters([]);
    form.resetFields();
    didSearched([], false);
  };

  return (
    <div className={className}>
      <AddFilter onChangeFilter={onChangeFilter} filtros={availableFilters} />

      <Form form={form} onFinish={(values) => handleFinishForm(values)} layout="horizontal" labelCol={{ span: 5 }}>
        <FilterInputList
          filters={currentFilters}
          onDeleteFilter={onDeleteFilter}
          options={true}
          onUpload={(field, data) => {
            form.setFieldsValue({ [field]: data });
          }}
        />
        {currentFilters.length > 0 ? (
          <>
            <Button name="btn" type="primary" htmlType="submit" style={{ width: 200 }} disabled={searching}>
              Buscar
            </Button>
            <Button
              name="btnLimpiar"
              style={{ width: 120, marginLeft: 10 }}
              disabled={searching}
              onClick={() => {
                resetForm();
              }}>
              Limpiar
            </Button>
          </>
        ) : undefined}
      </Form>
    </div>
  );
};
