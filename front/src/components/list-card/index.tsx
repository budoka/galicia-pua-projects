import { Badge, Card } from 'antd';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import classNames from 'classnames';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import { ELLIPSIS, SHADOW, UNSELECTABLE } from '../../constants';
import { BasicComponentProps } from '../../types';
import { Loading } from '../loading';
import { IListCardItem } from './interfaces';
import styles from './style.module.less';

interface ListCardProps extends Pick<BasicComponentProps<HTMLDivElement>, 'className' | 'style'> {
  items?: IListCardItem[];
  header?: React.ReactNode;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  hoverable?: boolean;
  showZero?: boolean;
  theme?: MenuTheme;
  unselectable?: boolean;
  scrollWidth?: string | number;
  scrollHeight?: string | number;
}

export const ListCard: React.FC<ListCardProps> = (props) => {
  const className = classNames(styles.content, UNSELECTABLE, SHADOW, props.className);
  const cardDescriptionClassName = classNames(ELLIPSIS);

  const setBadgeStatus = (count: number) => {
    const { theme } = props;
    if (count === 0) return theme === 'dark' ? styles.badgeIdleDark : styles.badgeIdleLight;
    else if (count < 10) return theme === 'dark' ? styles.badgeLowDark : styles.badgeLowLight;
    else if (count < 50) return theme === 'dark' ? styles.badgeNormalDark : styles.badgeNormalLight;
    else return theme === 'dark' ? styles.badgeHighDark : styles.badgeHighLight;
  };

  const getBadgeClass = (count?: number) => {
    return count !== undefined ? classNames(setBadgeStatus(count)) : undefined;
  };

  const linkWrapper = (children: React.ReactNode, path: string, params?: string, query?: string) => {
    const url = [path, params, query].join('');
    return (
      <Link to={url} className={styles.link}>
        {children}
      </Link>
    );
  };

  const renderCard = (item: IListCardItem) => {
    const { hoverable, showZero } = props;

    return (
      <Card.Grid className={styles.cardGrid} hoverable={hoverable}>
        <span className={cardDescriptionClassName} title={item.description?.toString()}>
          {item.description}
        </span>
        {item.loading ? (
          <Loading />
        ) : (
          item?.count! >= 0 && <Badge className={getBadgeClass(item.count)} count={item.count} showZero={showZero} />
        )}
      </Card.Grid>
    );
  };

  const renderCards = () => {
    const { items } = props;
    return items
      ? items.map((item, index) => {
          return (
            <Card key={index} type="inner" className={styles.innerCard}>
              <div className={styles.cardContent}>
                {item.path && item.count ? linkWrapper(renderCard(item), item.path, item.params, item.query) : renderCard(item)}
              </div>
            </Card>
          );
        })
      : null;
  };

  return (
    <Card className={className} title={props.header} style={{ ...props.style }} headStyle={props.headerStyle} bodyStyle={props.bodyStyle}>
      <InfiniteScroll
        style={{ width: props.scrollWidth ?? '100%', height: props.scrollHeight ?? '100%', overflow: 'auto' }}
        loadMore={(page: number) => {}}
        useWindow={false}>
        {renderCards()}
      </InfiniteScroll>
    </Card>
  );
};
