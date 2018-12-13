import React from 'react';
import { Card } from 'antd';
// import classNames from 'classnames';
import styles from './index.less';

const renderTotal = total => {
  let totalDom;
  switch (typeof total) {
    case 'undefined':
      totalDom = null;
      break;
    case 'function':
      totalDom = <div className={styles.total}>{total()}</div>;
      break;
    default:
      totalDom = <div className={styles.total}>{total}</div>;
  }
  return totalDom;
};

const ChartCard = ({
  loading = false,
  contentHeight,
  icon,
  title,
  count,
  children,
  size,
  backgroundImg,
  ...rest
}) => {
  const content = (
    <div className={styles.chartCard}>
      <div className={styles.imgWrap} style={backgroundImg ? { background: backgroundImg } : {}}>
        <img className={styles.icon} style={size} src={icon} />
      </div>
      <div className={styles.rightCon}>
        <span>{title}</span>
        <span>{count}</span>
      </div>
    </div>
  );

  return (
    <Card loading={loading} bodyStyle={{ padding: 0 }} {...rest}>
      {content}
    </Card>
  );
};

export default ChartCard;
