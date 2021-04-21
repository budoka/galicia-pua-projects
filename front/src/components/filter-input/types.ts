import { LabeledValue } from 'antd/lib/select';

export interface IListFilters {
  title: React.ReactNode;
  item: IFilterItem;
}

export interface IFilterItem {
  label: string;
  type: string;
  wsField: string;
  validateFn?: (value: string) => boolean;
  listCompare?: IItemValue[];
  listValues?: IItemValue[];
}

export interface IFilterItemExtended extends IFilterItem {
  wsField2?: string;
  type2?: string;
  label1?: string;
  label2?: string;
}

export interface IItemValue {
  id: string;
  codigo?: number;
  descripcion: string;
}
