import { LoadingOutlined } from '@ant-design/icons';
import { Button, Form, message, Popconfirm, Tag } from 'antd';
import { Rule } from 'antd/lib/form';
import { LabeledValue, SelectValue } from 'antd/lib/select';
import TableAnt, { ColumnType, TableProps } from 'antd/lib/table';
import { SorterResult, TableCurrentDataSource, TablePaginationConfig, TableRowSelection } from 'antd/lib/table/interface';
import classNames from 'classnames';
import _ from 'lodash';
import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { SHADOW, UNSELECTABLE } from '../../constants';
import { Texts } from '../../constants/texts';
import { IElement } from '../../types';
import { compare } from '../../utils/string';
import { Wrapper } from '../wrapper';
import { Cell, CellProps } from './cell';
import { Column } from './column';
import { AddButton } from './extra/add-button';
import { DeleteButton } from './extra/delete-button';
import { RecordsCounter } from './extra/record-counter-tag';
import { RefreshButton } from './extra/refresh-button';
import styles from './style.module.less';

export type InputType = 'text' | 'date' | 'select' | 'checkbox';
export type TableAction = 'idle' | 'adding' | 'editing' | 'deleting';
export type ActionNode = 'add-button' | 'delete-button' | 'refresh-button' | 'records-count-tag';
export type Position = 'top' | 'bottom' | 'both';
export interface ExtraComponentTable {
  key?: React.Key;
  node: ActionNode | /*| ((records: RecordType[]) => ReactNode) */ ReactNode;
  position: Position;
  order?: (number | null)[];
  style?: CSSProperties;
}

// Column properties
export interface ColumnTypeEx<RecordType> extends ColumnType<RecordType> {
  validationTitle?: string;
  editable?: boolean;
  forceEditing?: boolean;
  inputType?: InputType;
  options?: LabeledValue[];
  rules?: Rule[];
  onSelectChange?: (value: SelectValue, option: LabeledValue | any) => void;
  // required?: boolean;
  // order?: number;
  //minWidth?: number;
  style?: CSSProperties;
}

// Table properties
export interface TablePropsEx<RecordType> extends TableProps<RecordType> {
  sortable?: boolean;
  hideRowSelection?: boolean;
  hidePagination?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  fill?: boolean;
  extraColumns?: { showKeyColumn?: boolean; showActionsColumn?: boolean };
  extraComponents?: ExtraComponentTable[];
  onDataChange?: (records: RecordType[]) => void;
  onActionChange?: (action: TableAction, data: RecordType[], columnKey?: React.Key) => void;
}

interface TableState<RecordType> {
  action: { previous?: TableAction; current: TableAction };
  currentPage: number;
  editingRow: { previous?: React.Key; current?: React.Key };
  pageSize: number;
  selectedRows: React.Key[];
  sort: SorterResult<RecordType>[];
}

export const Table = <RecordType extends IElement = any>(props: TablePropsEx<RecordType>) => {
  const [form] = Form.useForm();

  const [state, setState] = useState<TableState<RecordType>>({
    action: { current: 'idle' },
    currentPage: 1,
    editingRow: {},
    pageSize: (props.pagination && props.pagination.pageSize) || 10,
    selectedRows: [],
    sort: [],
  });

  const [stateRefreshButton, setStateRefreshButton] = useState(false);

  const keyColumn = React.useMemo(
    () =>
      ({
        key: 'key',
        dataIndex: 'key',
        title: '#',
        width: 60,
        sorter: {
          compare: (a, b) => compare(+a.key, +b.key),
          multiple: -1,
        },
      } as ColumnTypeEx<RecordType>),
    [],
  );

  const actionColumn = React.useMemo(
    () =>
      ({
        key: 'actions',
        dataIndex: 'actions',
        title: Texts.ACTIONS,
        fixed: 'right',
        width: 210,
      } as ColumnTypeEx<RecordType>),
    [],
  );

  const {
    className,
    columns: rawColumns,
    dataSource: rawDataSource,
    onDataChange,
    onActionChange,
    extraColumns,
    extraComponents,
    sortable,
    fill,
    hideRowSelection,
    hidePagination,
    hideHeader,
    hideFooter,
    loading,
    pagination,
    ...restProps
  } = props;

  const tableClassName = classNames(styles.tableWrapper, UNSELECTABLE, SHADOW, className);

  const dataSource = rawDataSource ?? [];

  const columns = React.useMemo(() => {
    let columns: ColumnTypeEx<RecordType>[] = rawColumns as ColumnTypeEx<RecordType>[];
    if (!columns || columns.length === 0) return;

    if (extraColumns?.showKeyColumn) columns = [keyColumn, ...columns];
    if (extraColumns?.showActionsColumn) columns = [...columns, actionColumn];

    if (props.fill)
      columns = [
        ...columns,
        {
          style: {
            /*  border: 'none' backgroundColor: '#fafafa'*/
          },
        } as ColumnTypeEx<RecordType>,
      ];

    let isInputFocused = false;

    columns = (columns as ColumnTypeEx<RecordType>[]).map((col, index) => {
      return {
        ...col,
        align: col.align ?? 'center',
        ellipsis: col.ellipsis ?? true,
        sorter: sortable && col.sorter,
        sortOrder: sortable && state.sort.length > 0 && state.sort.find((s) => s.columnKey === col.key)?.order,
        shouldCellUpdate: (record, prevRecord) => {
          if (!record) return;
          // Ignore fill cell
          const rowKey = props.rowKey;
          if (typeof rowKey === 'string' && record[rowKey] === undefined) return false;
          //if (record.key === undefined) return false;

          // Update cell when a record was deleted.
          if (state.action.previous === 'deleting') return true;

          const isEditing = record.key === state.editingRow.current || record.key === state.editingRow.previous;

          const isActionColumn = col.dataIndex === 'actions';
          const shouldUpdateAction =
            isActionColumn &&
            (state.action.current === 'adding' ||
              state.action.current === 'editing' ||
              state.action.previous === 'adding' ||
              state.action.previous === 'editing');

          if (shouldUpdateAction) return true;

          const columnName = col.dataIndex! as string;
          const prevValue = prevRecord[columnName];
          const nextValue = record[columnName];

          const shouldUpdate = prevValue !== nextValue || isEditing;

          return shouldUpdate;
        },
        onHeaderCell: (column: ColumnTypeEx<RecordType>) => {
          return {
            /*  style: { fontWeight: 'bold' }, */
          };
        },
        onCell: (record: RecordType) => {
          if (!record) return;
          const dataIndex = col.dataIndex as string;
          const { forceEditing, editable, inputType, options, rules } = col;

          // Change focus to next empty field on select element has been selected.
          const value =
            inputType === 'select' && options && options.length === 1
              ? options[0].value
              : record[dataIndex] ?? form.getFieldValue(dataIndex);
          const shouldFocusInput = !isInputFocused && !!editable && isEditing(record) && (value === '' || value === undefined);

          if (shouldFocusInput) isInputFocused = true;

          return {
            key: dataIndex,
            dataIndex,
            value,
            editing: forceEditing || (editable && isEditing(record)),
            inputType,
            options,
            hasFocus: shouldFocusInput,
            rules,
            hasFeedback: true,
            form,
            style: col.style,
            onSelectChange: col.onSelectChange,
          } as CellProps;
        },
        render: col.render
          ? col.render
          : (value, record, index) => {
              if (col.key === 'key') return dataSource.indexOf(record) + 1;
              else if (col.key === 'actions') return renderActionsColumn(record);
              else return value;
            },
      } as ColumnTypeEx<RecordType>;
    });

    return columns;
  }, [state, props.columns]);

  useEffect(() => {
    onActionChange && onActionChange(state.action.current, dataSource, state.editingRow.current);
  }, [state.action.current]);

  useEffect(() => {}, [form]);

  useEffect(() => {
    if (state.action.current === 'idle') form.resetFields();
  }, [state.action.current]);

  useEffect(() => {
    if (state.action.current !== 'adding') setState((prev) => ({ ...prev, selectedRows: [] }));
  }, [state.currentPage, state.sort]);

  const renderComponents = (position: RegExp) => {
    const index = +(String(position) === String(/bottom|both/)); // header/both = 0, footer/both = 1

    return extraComponents
      ?.filter((component) => component && position.test(component.position))
      .sort((a, b) => compare(_.isEmpty(a.order) ? null : a.order![index], _.isEmpty(b.order) ? null : b.order![index]))
      .map((component) => {
        const { key, style, node } = component;

        switch (node) {
          case 'add-button':
            const addDisabled = !isEditable;
            return {
              key,
              component: (
                <AddButton
                  disabled={addDisabled}
                  editing={!!state.editingRow.current}
                  onAdd={handleAddRecord}
                  onCancel={handleCancelRecord}
                />
              ),
              style,
            };

          case 'delete-button':
            const deleteDisabled = !isEditable || !(state.selectedRows.length > 0 && state.action.current !== 'adding');

            return {
              key,
              component: <DeleteButton disabled={deleteDisabled} onDelete={() => handleDeleteRecord(state.selectedRows)} />,
              style,
            };

          case 'refresh-button':
            const refreshDisabled = !isEditable || state.action.current !== 'idle' || stateRefreshButton;
            return {
              key,
              component: <RefreshButton disabled={refreshDisabled} running={stateRefreshButton} setRefresh={setStateRefreshButton} />,
              style,
            };

          case 'records-count-tag':
            return { key, component: <RecordsCounter count={dataSource.length} />, style };

          default:
            return { key, component: node, style };
        }
      })
      .map(({ key, component, style }) => {
        return (
          <Wrapper key={key} className={styles.extraComponent} style={style} horizontal="center" vertical="middle">
            {component}
          </Wrapper>
        );
      });
  };

  const isEditable = !!onDataChange;
  const isEditing = (record: RecordType) => record.key === state.editingRow.current;

  const handleAddRecord = () => {
    if (!onDataChange) return;

    const key = dataSource.length + 1;
    const record: RecordType = { key } as RecordType;
    const sort: SorterResult<RecordType> = { columnKey: 'key', order: undefined };

    onDataChange([...dataSource, record]);

    setState((prev) => ({
      ...prev,
      action: { previous: state.action.current, current: 'adding' },
      currentPage: Math.ceil((dataSource.length + 1) / state.pageSize!),
      editingRow: { previous: state.editingRow.current, current: key },
      selectedRows: [key],
      sort: [sort],
    }));
  };

  const handleSaveRecord = async (key: React.Key) => {
    if (!isEditable) return;

    try {
      const record = (await form.validateFields()) as RecordType;

      const index = dataSource.findIndex((record) => key === record.key);

      if (index === -1) return;

      const records = [...dataSource];
      records[index] = { ...records[index], ...record };

      onDataChange!(records);

      setState((prev) => ({
        ...prev,
        editingRow: { previous: state.editingRow.current, current: undefined },
        action: { previous: state.action.current, current: 'idle' },
      }));

      if (state.action.current === 'adding') message.success(Texts.SAVE_REGISTRY_SUCCESS);
      else if (state.action.current === 'editing') message.success(Texts.UPDATE_REGISTRY_SUCCESS);
    } catch (err) {
      const map = new Map<string, string>();

      const columnsKey: string[] = err.errorFields.map((f: any) => f.name[0]);

      columnsKey.forEach((key) => map.set(key, ''));

      columns &&
        columns.forEach((c) => {
          const hasKey = map.has(`${c.key}`);
          if (hasKey) map.set(`${c.key}`, c.validationTitle!);
        });

      const columnsName = Array.from(map.values());

      const renderColumns = columnsName.map((column, index) => {
        return (
          <Tag key={index} color="red">
            {column}
          </Tag>
        );
      });
      message.error(
        <>
          {Texts.FIELDS_VALIDATION_FAILURE + ': '}
          {renderColumns}
        </>,
      );
      //  message.error(Texts.FIELDS_VALIDATION_FAILURE + ': ' + columnsName.join(', '));
    }
  };

  const handleEditRecord = (record: RecordType) => {
    setState((prev) => ({
      ...prev,
      selectedRows: [record.key],
      editingRow: { previous: state.editingRow.current, current: record.key },
      action: { previous: state.action.current, current: 'editing' },
    }));

    form.setFieldsValue({ ...record });
  };

  const handleDeleteRecord = (keys: React.Key[]) => {
    if (dataSource.length === 0 || !isEditable) return;
    const records = _.reject(dataSource, (e) => _.includes(keys, e.key));

    onDataChange!(records);

    setState((prev) => ({
      ...prev,
      selectedRows: [],
      editingRow: { previous: state.editingRow.current, current: undefined },
      action: { previous: 'deleting', current: 'idle' },
    }));
  };

  const handleCancelRecord = () => {
    if (dataSource.length === 0 || !isEditable) return;

    if (state.action.current === 'adding') {
      const records = dataSource.slice(0, dataSource.length - 1);
      onDataChange!(records);
    }

    setState((prev) => ({
      ...prev,
      selectedRows: [],
      editingRow: { previous: state.editingRow.current, current: undefined },
      action: { previous: state.action.current, current: 'idle' },
    }));
  };

  const handleChangeTable = (
    pagination: TablePaginationConfig,
    filters: Record<string, React.ReactText[] | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>,
  ) => {
    setState((prev) => ({
      ...prev,
      sort: Array.isArray(sorter) ? sorter : [sorter],
    }));

    handleCancelRecord();
  };

  const rowSelection: TableRowSelection<RecordType> = {
    selectedRowKeys: state.selectedRows,
    onChange: (selectedRowKeys, selectedRows) => {
      if (state.action.current !== 'idle') return;
      const keys: React.Key[] = selectedRows.map((r) => r.key);

      setState((prev) => ({
        ...prev,
        selectedRows: keys,
      }));
    },
    getCheckboxProps: (record: RecordType) => ({
      //* name: record.name,
      //name: record.id + '',
      disabled: state.action.current !== 'idle' && !isEditing(record),
    }),
  };

  const preventFocus = (e: React.FocusEvent<any>) => {
    e.stopPropagation();
  };

  const renderActionsColumn = (record: RecordType) => {
    return isEditing(record) ? (
      <>
        {renderButtonSave()} {renderDivider()} {renderButtonCancel()}
      </>
    ) : (
      <>
        {renderButtonEdit()} {renderDivider()} {renderButtonDelete()}
      </>
    );

    function renderButtonEdit() {
      const disabled = !isEditable || state.action.current !== 'idle';
      return (
        <div className={styles.buttonWrapper}>
          <Button
            className={styles.buttonEdit}
            disabled={disabled}
            type="link"
            onFocus={preventFocus}
            onClick={(e) => {
              handleEditRecord(record);
            }}>
            {Texts.EDIT}
          </Button>
        </div>
      );
    }

    function renderButtonDelete() {
      const disabled = !isEditable || state.action.current !== 'idle';
      return (
        <div className={styles.buttonWrapper}>
          <Popconfirm
            placement="left"
            disabled={disabled}
            title={Texts.DELETE_ROW}
            okText={Texts.YES}
            cancelText={Texts.NO}
            okButtonProps={{ onFocus: preventFocus }}
            cancelButtonProps={{ onFocus: preventFocus }}
            onConfirm={(e) => {
              handleDeleteRecord([record.key]);
            }}>
            <Button
              className={styles.buttonDelete}
              disabled={disabled}
              type="link"
              onFocus={(e) => {
                e.stopPropagation();
              }}>
              {Texts.DELETE}
            </Button>
          </Popconfirm>
        </div>
      );
    }

    function renderButtonSave() {
      const disabled = !isEditable;
      return (
        <div className={styles.buttonWrapper}>
          <Button
            className={styles.buttonSave}
            disabled={disabled}
            type="link"
            onFocus={preventFocus}
            onClick={(e) => {
              handleSaveRecord(record.key);
            }}>
            {Texts.SAVE}
          </Button>
        </div>
      );
    }

    function renderButtonCancel() {
      const disabled = !isEditable;
      return (
        <div className={styles.buttonWrapper}>
          <Button
            className={styles.buttonCancel}
            disabled={disabled}
            type="link"
            onFocus={preventFocus}
            onClick={(e) => {
              handleCancelRecord();
            }}>
            {Texts.CANCEL}
          </Button>
        </div>
      );
    }

    function renderDivider() {
      return (
        <Button type="link" disabled style={{ cursor: 'default', color: 'gray', margin: 0, padding: 0 }}>
          |
        </Button>
      );
    }
  };

  const Loading = React.memo(() => <LoadingOutlined />);

  /*   const renderHeader = React.useMemo(() => {
    const regex = /top|both/;
    const hasComponents = extraComponents && extraComponents.filter((component) => regex.test(component.position)).length > 0;

    const components = renderComponents(regex);
    return hasComponents && !_.isEmpty(components) ? (
      <Wrapper className={styles.header} direction="row" horizontal="left" vertical="middle" style={{ width: '100%' }}>
        {components}
      </Wrapper>
    ) : undefined;
  }, [extraComponents]); */

  const renderTitle = () => {
    const regex = /top|both/;
    return renderExtra(regex);
  };

  const renderFooter = () => {
    const regex = /bottom|both/;
    return renderExtra(regex);
  };

  const renderExtra = (regex: RegExp) => {
    const hasExtra = extraComponents && extraComponents.filter((component) => component && regex.test(component.position)).length > 0;

    const components = renderComponents(regex);
    return hasExtra && !_.isEmpty(components) ? components : undefined;
  };

  return (
    <Wrapper direction="column" horizontal="center" style={{ width: '100%' }}>
      <Form form={form} component={false}>
        <TableAnt
          loading={loading ? { indicator: <Loading />, tip: Texts.LOADING } : loading}
          className={tableClassName}
          components={{
            header: {
              cell: Column,
            },
            body: {
              cell: Cell,
            },
          }}
          columns={columns}
          dataSource={dataSource}
          showSorterTooltip={false}
          title={hideHeader ? undefined : renderTitle}
          footer={hideFooter ? undefined : renderFooter}
          rowSelection={hideRowSelection ? undefined : rowSelection}
          pagination={
            hidePagination
              ? false
              : {
                  style: { marginRight: 12 },
                  disabled: state.action.current !== 'idle',
                  position: ['bottomRight'],
                  current: state.currentPage,
                  pageSize: state.pageSize,
                  pageSizeOptions: ['10', '20', '30', '50'],
                  showSizeChanger: true,
                  onChange: (page, pageSize) => {
                    setState((prev) => ({
                      ...prev,
                      currentPage: page,
                      pageSize: pageSize!,
                      editingRow: { previous: state.editingRow.current, current: undefined },
                    }));
                    //* setCurrentPage(page);
                    //*  setPageSize(pageSize);
                    //*  setEditingRow({ previous: stateT.editingRow.current, current: undefined });
                  },
                  ...pagination,
                }
          }
          onChange={(pagination, filters, sorter, extra) => {
            handleChangeTable(pagination, filters, sorter, extra);
          }}
          {...restProps}
        />
      </Form>
    </Wrapper>
  );
};
