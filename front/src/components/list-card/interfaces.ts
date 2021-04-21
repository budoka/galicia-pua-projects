export interface IListCard {
  title?: React.ReactNode;
  items?: IListCardItem[];
}

export interface IListCardItem {
  description: React.ReactNode;
  loading?: boolean;
  count?: number;
  path?: string;
  params?: string;
  query?: string;
}
