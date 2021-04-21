import { Col, Row } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LoadingContent } from 'src/components/loading';
import { clearState } from 'src/features/cajas/cajas-pendientes/cajas-pendientes.slice';
import { ListCard } from '../../components/list-card';
import { IListCard, IListCardItem } from '../../components/list-card/interfaces';
import { RootState } from '../../reducers';
import { useAppDispatch } from '../../store';
import styles from './style.module.less';

export interface ReportesDashboard {
  reportes: IListCard[][];
}

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const reportes = useSelector((state: RootState) => state.reportes);
  const sesion = useSelector((state: RootState) => state.sesion);

  useEffect(() => {
    document.title = 'PUA - Portal Unificado';

    return () => {
      dispatch(clearState());
    };
  }, []);


  const cards = reportes.data.reportes.reduce<IListCard[]>((prev, curr, index, array): IListCard[] => {
    function BuildItem() {
      return {
        description: curr.Item,
        count: curr.Cantidad,
        path: curr.Ruta,
      } as IListCardItem;
    }

    if (index > 0 && array[index - 1].Proceso === curr.Proceso) {
      const _prev = prev[prev.length - 1].items;
      prev[prev.length - 1].items = [...(_prev || []), BuildItem()];

      return prev;
    } else {
      return [
        ...(prev || []),
        {
          title: curr.Proceso,
          items: [BuildItem()],
        },
      ];
    }
  }, [] as IListCard[]);

  const renderColumn = (card: ReactNode, key: React.Key) => {
    const className = classNames(styles.column);
    return (
      <Col key={key} className={className}>
        {card}
      </Col>
    );
  };

  const renderRow = (column: ReactNode, key: React.Key) => {
    const className = classNames(styles.row);
    return (
      <Row key={key} gutter={[16, 16]} className={className} justify="center" style={{ width: '100%' }}>
        {column}
      </Row>
    );
  };

  const renderListCard = (card: IListCard, key: React.Key) => {
    return (
      <ListCard
        className={styles.card}
        header={card.title ? <span className={styles.header}>{card.title}</span> : null}
        headerStyle={{
          textAlign: 'center',
        }}
        scrollHeight={200}
        items={card.items}
        showZero
      />
    );
  };

  const renderListCards = (maxColumns: number) => {
    const chunks = _.chunk(cards, maxColumns);

    const rows = chunks.map((row, rIndex) =>
      renderRow(
        row.map((card, cIndex) => renderColumn(renderListCard(card, `${rIndex}-${cIndex}`), cIndex)),
        rIndex,
      ),
    );

    return rows;
  };

  return <>{reportes.loading ? <LoadingContent style={{ height: '100%' }} /> : renderListCards(2)}</>;
};
