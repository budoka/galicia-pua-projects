import { Button, List, Pagination } from 'antd';
import { ListItemMetaProps } from 'antd/lib/list';
import Modal, { ModalProps } from 'antd/lib/modal';
import { PaginationConfig } from 'antd/lib/pagination';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { BasicComponentProps, IElement } from '../../types';
import { Table, TablePropsEx } from '../table';
import styles from './style.module.less';

const paginationConfig = { pageSize: 20, hideOnSinglePage: true, showSizeChanger: false } as PaginationConfig;

interface TableModalProps<T> extends ModalProps {
  table: TablePropsEx<T>;
}

export const TableModal = <RecordType extends IElement = any>(props: TableModalProps<RecordType>) => {
  //export const TableModal: React.FC<TableModalProps> = React.memo((props) => {
  const { className, table, ...restProps } = props;

  const modalClassName = classNames(className, styles.modal);

  useEffect(() => {}, [table.dataSource]);

  return (
    <Modal
      {...restProps}
      className={modalClassName}
      closable
      centered
      destroyOnClose={true}
      width={restProps.width ?? '60%'}
      bodyStyle={{ paddingTop: 10 }}>
      <Table {...table} dataSource={table.dataSource} />
    </Modal>
  );
};
