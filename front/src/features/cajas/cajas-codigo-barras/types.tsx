import { ColumnTypeEx } from 'src/components/table';
import { IElement } from 'src/types';

export const columns = [
  {
    key: 'sucursal',
    dataIndex: 'sucursal',
    title: 'Sucursal',
    width: 150,
  },
  {
    key: 'fecha',
    dataIndex: 'fecha',
    title: 'Fecha',
    width: 150,
  },
] as ColumnTypeEx<DocumentoCodigoBarras>[];

export interface DocumentoCodigoBarras {
  key: React.Key;
  sucursal: string;
  fecha: string;
}

export interface CajasCodigoBarrasSliceState {
  input: string;
  currentDocumentType: { value?: number; label?: string };
  documentTypes?: { value: number; label: string }[];
  data: DocumentoCodigoBarras[];
  visible: boolean;
  loading: Loading;
  error: string | null;
}

// Modelo front

export interface Loading {
  saving?: boolean;
}
