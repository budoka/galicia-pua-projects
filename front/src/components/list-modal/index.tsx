import { Button, List, Pagination } from 'antd';
import { ListItemMetaProps } from 'antd/lib/list';
import Modal, { ModalProps } from 'antd/lib/modal';
import { PaginationConfig } from 'antd/lib/pagination';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.less';

const paginationConfig = { pageSize: 20, hideOnSinglePage: true, showSizeChanger: false } as PaginationConfig;

interface ListModalProps extends ModalProps {
  items: ListItemMetaProps[];
  pagination: {
    current: number;
  };
  onSelectItem?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const ListModal: React.FC<ListModalProps> = React.memo((props) => {
  const { className, items, pagination, onSelectItem, ...restProps } = props;

  const modalClassName = classNames(className, styles.modal);

  return (
    <Modal
      {...restProps}
      className={modalClassName}
      closable
      centered
      footer={null}
      destroyOnClose={true}
      width={restProps.width ?? 600}
      bodyStyle={{ paddingTop: 10 }}>
      <List
        id="list-modal"
        itemLayout="horizontal"
        dataSource={items}
        style={{ height: 500, overflowY: 'scroll', scrollBehavior: 'smooth' }}
        pagination={{
          ...paginationConfig,
          total: items.length,
          current: pagination?.current,
          style: { display: 'none' },
        }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta {...item} />
            {onSelectItem && (
              <Button type="link" style={{ paddingRight: 30 }} onClick={onSelectItem}>
                Seleccionar
              </Button>
            )}
          </List.Item>
        )}
      />

      <Pagination
        {...paginationConfig}
        total={items.length}
        current={pagination?.current}
        showTotal={(total, range) => <span>{`${range[0]}-${range[1]} de ${total}`}</span>}
        style={{ marginTop: 10, textAlign: 'right' }}
        onChange={(page: number, pageSize?: number) => {
          //  setState((prev) => ({ ...prev, listaUsuarios: { ...prev.listaUsuarios!, visible: true, pagination: { current: page } } }));

          const listaUsuarios = document.getElementById('list-modal');
          listaUsuarios && (listaUsuarios as HTMLDivElement).scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </Modal>
  );
});
