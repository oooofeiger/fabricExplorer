import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Tabs, Table, Menu, Dropdown, Button, Form, Input } from 'antd';
import { ChartCard } from 'components/Charts';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import InstallForm from './installForm';
import InstantiateForm from './instantiate';
import chanincode from '../../assets/合约.png';
import triangle from '../../assets/右三角形.png';
import peer from '../../assets/节点.png';

import styles from './Peer.less';

const { TabPane } = Tabs;

@connect(({ chart, network, loading }) => {
  return {
    chart,
    network,
    global,
    loading: loading.effects['chart/peerGetChannelList'],
  };
})
class Peer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPeer: null,
      listSwitch: true,
      channelSwitch: true,
      canUpload: false,
      visibleModal: false,
      button: '实例化',
      statusSwitch: true,
      addChannelButton: true,
    };

    this.togglePeer = this.togglePeer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addChannel = this.addChannel.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.disableButon = this.disableButon.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getDeployPeer',
    });
    dispatch({
      type: 'global/getPeerList',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.sessionId) return;
    const prevChart = prevProps.chart;
    const prevJoin2Channel = prevChart.join2Channel;
    const prevUpdateChaincodeList = prevProps.updateChaincodeList;
    const { dispatch, chart, getWsStatusData, list, updateChaincodeList, updateList } = this.props;
    const { join2Channel } = chart;
    const { token } = this.props.sessionId;
    const { currentPeer, statusSwitch } = this.state;
    list &&
      list.peerList.length &&
      this.state.listSwitch &&
      this.setState({
        currentPeer: list.peerList[0],
        listSwitch: false,
      });

    if (updateChaincodeList !== prevUpdateChaincodeList) {
      this.updateTable();
    }

    if (getWsStatusData && statusSwitch && list) {
      const { peerList, channelList } = list;
      const { currentPeer } = this.state;
      const currentPeerName = currentPeer ? currentPeer : peerList[0];
      peerList &&
        peerList.length &&
        channelList &&
        getWsStatusData('peer', channelList[0], currentPeerName.name);
      this.setState({
        statusSwitch: false,
      });
    }

    if (join2Channel && !prevJoin2Channel) {
      //加入通道时更新表格
      this.updateTable();
      updateList();
    } else if (join2Channel && prevJoin2Channel && join2Channel.time !== prevJoin2Channel.time) {
      this.updateTable();
      updateList();
    }

    if (currentPeer && this.state.channelSwitch) {
      dispatch({
        type: 'chart/peerGetChannelList',
        payload: {
          peerName: currentPeer.name,
          token: token,
        },
      });

      dispatch({
        type: 'chart/peerGetChaincodeList',
        payload: {
          peerName: currentPeer.name,
          token: token,
        },
      });

      dispatch({
        type: 'chart/installedChaincodeList',
        payload: {
          peerName: currentPeer.name,
        },
      });

      dispatch({
        type: 'network/getDeployPeer',
      });

      dispatch({
        type: 'global/getPeerList',
      });

      this.setState({
        channelSwitch: false,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'chart/clear',
    });
  }

  updateTable() {
    this.setState({
      channelSwitch: true,
    });
  }

  togglePeer = ({ key }) => {
    const { dispatch, sessionId, getWsStatusData, list } = this.props;
    const { channelList } = list;
    const { token } = sessionId;
    const { currentPeer } = this.state;
    let peer = null;
    this.props.list.peerList.map((item, i) => {
      if (item.name === key) {
        peer = item;
      }
    });
    getWsStatusData('peer', channelList[0], key);

    this.setState({
      currentPeer: peer,
      channelSwitch: true,
    });
  };

  handleChange = e => {
    if (e.target.value.length) {
      this.setState({
        addChannelButton: false,
      });
    } else {
      this.setState({
        addChannelButton: true,
      });
    }
    this.setState({
      willAddChannel: e.target.value,
    });
  };

  disableButon = status => {
    const { addChannelButton } = this.state;
    if (addChannelButton === false) {
      this.setState({
        addChannelButton: status,
      });
    }
  };

  addChannel = () => {
    if (!this.state.willAddChannel || !this.state.currentPeer) return;
    const { dispatch } = this.props;
    const { token } = this.props.sessionId;
    dispatch({
      type: 'chart/join2Channel',
      payload: {
        channelName: this.state.willAddChannel,
        peerName: this.state.currentPeer.name,
        token: token,
      },
    });
  };

  render() {
    const { currentPeer } = this.state;
    const { chart, loading, list, status, network } = this.props;
    const { deployPeer } = network;
    const { peerChannelList, peerChaincodeList } = chart;

    console.log('this.props', this.props);
    console.log('this.state', this.state);

    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      style: { marginBottom: 24 },
    };

    const ToggleMenu = (
      <Menu onClick={this.togglePeer}>
        {deployPeer
          ? deployPeer.map((item, i) => {
              return (
                <Menu.Item key={item.peerName}>
                  <a style={{ color: '#008dff', cursor: 'pointer' }}>{item.peerName}</a>
                </Menu.Item>
              );
            })
          : ''}
      </Menu>
    );

    const detailInfo = (
      <div className={styles.peer}>节点 - {currentPeer ? currentPeer.name : '当前还没有节点'}</div>
    );

    const toggleSwitch = (
      <div className={styles.toggleSwitch}>
        <Dropdown overlay={ToggleMenu} placement="bottomLeft">
          <Button>
            切换节点 <Icon type="down" />
          </Button>
        </Dropdown>
      </div>
    );

    const leftContent = (
      <div className={styles.leftContent}>
        {currentPeer ? (
          <ul>
            <li>
              <span>地址</span>
              {currentPeer.request}
            </li>
            <li>
              <span>域名</span>
              {currentPeer.host}
            </li>
          </ul>
        ) : (
          ''
        )}
      </div>
    );

    peerChannelList &&
      peerChannelList.map((item, i) => {
        return (peerChannelList[i].key = i);
      });
    const peerChannelListColumns = [
      {
        title: '通道名称',
        dataIndex: 'channelName',
      },
      {
        title: '区块数量',
        dataIndex: 'blockCount',
      },
      {
        title: '交易数量',
        dataIndex: 'txCount',
      },
      {
        title: '合约数量',
        dataIndex: 'chaincodeCount',
      },
      {
        title: 'key数量',
        dataIndex: 'keyCount',
      },
    ];

    peerChaincodeList &&
      peerChaincodeList.map((item, i) => {
        return (peerChaincodeList[i].key = i);
      });
    const peerChaincodeListColumns = [
      {
        title: '合约名称',
        dataIndex: 'chaincodeName',
      },
      {
        title: '合约版本',
        dataIndex: 'version',
      },
      {
        title: '合约路径',
        dataIndex: 'path',
      },
      {
        title: '合约状态',
        dataIndex: 'status',
        render: text => {
          if (text === 'instantiated') return '已实例化';
          else if (text === 'installed') return '已安装';
        },
      },
      {
        title: '所在通道(已实例化)',
        dataIndex: 'channelName',
      },
    ];

    // let canJoinChannel = null;   //存放未加入的通道名
    // if(this.props.list && this.props.list.channelList && peerChannelList){
    //   const channelName = peerChannelList.map((item,i)=>{
    //     return item.channelName;
    //   })

    //   canJoinChannel = this.props.list.channelList.filter((item)=>{
    //     return channelName.indexOf(item) < 0;
    //   })
    // }

    const rightContent = (
      <div className={styles.rightContent}>
        <span>加入通道：</span>
        {/* <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select a channel"
            optionFilterProp="children"
            onChange={this.handleChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {
              canJoinChannel && canJoinChannel.map((item,i)=>{
                return (<Option key={i} value={item}>{item}</Option>)
              })
            }
          </Select> */}
        <Input onChange={this.handleChange} style={{ width: 200 }} placeholder="请输入通道名" />
        <Button
          onClick={this.addChannel}
          disabled={this.state.addChannelButton}
          style={{ marginLeft: '10px' }}
          type="primary"
        >
          确认
        </Button>
      </div>
    );

    return (
      <PageHeaderLayout
        detailInfo={detailInfo}
        toggleSwitch={toggleSwitch}
        logo={peer}
        leftContent={leftContent}
        rightContent={rightContent}
      >
        <Fragment>
          <Tabs defaultActiveKey="1" className={styles.tabs}>
            <TabPane
              className={styles.tabChildren}
              tab={
                <span>
                  <Icon type="file-text" />
                  详情展示
                </span>
              }
              key="1"
            >
              <Row gutter={24}>
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
                <Col {...topColResponsiveProps}>
                  <ChartCard
                    bordered={false}
                    loading={loading}
                    icon={chanincode}
                    title="合约数量"
                    count={status ? status.chaincodeCount : 0}
                    backgroundImg="#dd4b39"
                  />
                </Col>

                <Col md={24}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>通道列表</div>
                    <Table
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      bordered
                      dataSource={peerChannelList}
                      columns={peerChannelListColumns}
                    />
                  </div>
                </Col>

                <Col md={24} style={{ marginTop: '24px' }}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>合约列表</div>
                    <Table
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      bordered
                      dataSource={peerChaincodeList}
                      columns={peerChaincodeListColumns}
                    />
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane
              className={styles.tabChildren}
              tab={
                <span>
                  <Icon type="profile" />
                  安装合约
                </span>
              }
              key="2"
            >
              <Row guter={24}>
                <Col md={24}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>安装合约</div>
                    <div style={{ marginTop: '20px' }}>
                      {currentPeer ? (
                        <InstallForm updateTable={this.updateTable} currentPeer={currentPeer} />
                      ) : (
                        <div className={styles.noPeer}>当前还没有节点可以安装合约</div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane
              className={styles.tabChildren}
              tab={
                <span>
                  <Icon type="team" />
                  实例化合约
                </span>
              }
              key="3"
            >
              <Row guter={24}>
                <Col md={24}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>实例化合约</div>
                    <div style={{ marginTop: '20px' }}>
                      {currentPeer ? (
                        <InstantiateForm
                          disableButon={this.disableButon}
                          updateTable={this.updateTable}
                          {...this.props}
                          currentPeer={currentPeer}
                        />
                      ) : (
                        <div className={styles.noPeer}>当前还没有节点可以实例化合约</div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Fragment>
      </PageHeaderLayout>
    );
  }
}
const WrapFormPeer = Form.create({})(Peer);
export default WrapFormPeer;
