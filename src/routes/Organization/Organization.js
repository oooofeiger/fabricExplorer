import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import { ChartCard, NetworkGraph } from 'components/Charts';
import { heartTickStatus as heartTick } from '../../common/heartTick';

import styles from './Organization.less';
import triangle from '../../assets/右三角形.png';
import node from '../../assets/节点.png';

@connect(({ chart, loading }) => {
  console.log(loading);
  return {
    chart,
    loading: loading.effects['chart/getNetWorkData'],
  };
})
export default class Organization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusSwitch: true,
      netWorkSwitch: true,
      isCurrent: false,
    };
    this.wsStatus = null;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.setState({
      isCurrent: true,
    });
  }

  componentDidUpdate() {
    const that = this;
    if (!this.props.sessionId) return;
    const { statusSwitch } = this.state;
    const { dispatch, getWsStatusData, list } = this.props;
    const { token } = this.props.sessionId;

    if (statusSwitch && list && getWsStatusData) {
      const { peerList, channelList } = list;
      channelList &&
        peerList &&
        peerList.length &&
        getWsStatusData('organization', channelList[0], peerList[0].name);
      this.setState({
        statusSwitch: false,
      });
    }

    if (token && this.state.netWorkSwitch) {
      dispatch({
        type: 'chart/getNetWorkData',
        token: token,
      });
      this.setState({
        netWorkSwitch: false,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'chart/clear',
    });
    this.setState({
      isCurrent: false,
    });
  }

  reconnect = (token, sectionName, channelName, peerName) => {
    console.log('重连websocket');
    this.wsStatus = new WebSocket(
      `ws://${window.hostIp}/websocket/status/${token}/${sectionName}/${channelName}/${peerName}`
    );
  };

  render() {
    console.log('this.props', this.props);
    console.log('this.state', this.state);
    const { chart, loading, status } = this.props;
    const { netWorkData, channelList, peerList } = chart;

    const topColResponsiveProps = {
      xs: 24,
      sm: 24,
      md: 12,
      lg: 12,
      xl: 12,
      style: { marginBottom: 24 },
    };

    return (
      <Fragment>
        <Row gutter={24}>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              icon={node}
              title={'PEER节点数量'}
              count={status ? status.peerCount : 0}
            />
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              icon={triangle}
              title={'通道数量'}
              count={status ? status.channelCount : 0}
              size={{ width: 50, height: 50 }}
            />
          </Col>
        </Row>

        <Row>
          <Col md={24}>
            <div className={styles.netWorkTitle}>组织结构图</div>
            <div ref={this.netWorkWrap}>
              {netWorkData && JSON.stringify(netWorkData) !== '{}' ? (
                <NetworkGraph data={netWorkData} />
              ) : (
                ''
              )}
            </div>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
