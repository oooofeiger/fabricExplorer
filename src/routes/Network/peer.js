import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import {
  Row,
  Col,
  Icon,
  Tabs,
  Table,
  Menu,
  Dropdown,
  Button,
  message,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import WrapDeployPeer from './peerDeploy';
import WrapGenerateCert from './generateCert';
import PeerSettingForm from './peerSetting';
import styles from './index.less';

import peer from '../../assets/节点.png';

const { TabPane } = Tabs;

const host = window.hostIp;
@connect(({ network, loading }) => {
  return {
    network,
    loading: loading.effects['network/peerGetChannelList'],
  };
})
export default class PeerNetwork extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPeer: null,
      listSwitch: true,
      peerGetSwitch: true,
      updateSwitch: true,
    };
    this.downloadFile = React.createRef();
    this.managePeer = this.managePeer.bind(this);
    this.togglePeer = this.togglePeer.bind(this);
    this.peerDownload = this.peerDownload.bind(this);
    this.peerDelete = this.peerDelete.bind(this);
    this.checkName = this.checkName.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.downloadFileFunc = this.downloadFileFunc.bind(this);
    this.updateTable = this.updateTable.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getConfigPeer',
    });
    dispatch({
      type: 'network/getConfigOrderer',
    });
    dispatch({
      type: 'network/peerImageVersion',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.sessionId) return;
    const prevNetwork = prevProps.network;
    const prevPeerDelete = prevNetwork.peerDelete;
    const prevManagePeer = prevNetwork.managePeer;
    const { updateSwitch } = this.state;
    const { dispatch, network, updateList } = this.props;
    const { peerDelete, managePeer } = network;
    const { token } = this.props.sessionId;
    network.peerConfig &&
      this.state.listSwitch &&
      this.setState({
        currentPeer: network.peerConfig[0],
        listSwitch: false,
      });

    if(managePeer && !prevManagePeer){
      dispatch({
        type: 'network/getConfigPeer',
      });
    }else if(prevManagePeer && managePeer && managePeer.time !== prevManagePeer.time){
      dispatch({
        type: 'network/getConfigPeer',
      });
    }

    if (peerDelete && !prevPeerDelete) {
      this.updateTable();
      updateList();
    } else if (prevPeerDelete && peerDelete && peerDelete.time !== prevPeerDelete.time) {
      this.updateTable();
      updateList();
    }

    if (updateSwitch) {
      dispatch({
        type: 'network/getConfigPeer',
      });
      dispatch({
        type: 'network/getConfigOrderer',
      });
      this.setState({
        updateSwitch: false,
      });
    }

    if (this.state.currentPeer && this.state.peerGetSwitch) {
      dispatch({
        type: 'network/peerGet',
        payload: {
          peerName: this.state.currentPeer.peerName,
          token: token,
        },
      });
      this.setState({
        peerGetSwitch: false,
      });
    }
  }

  updateTable() {
    this.setState({
      updateSwitch: true,
      peerGetSwitch: true,
    });
  }

  togglePeer = ({ key }) => {
    console.log(key);
    const { peerConfig } = this.props.network;
    peerConfig.map((item, i) => {
      if (item.peerName === key) {
        this.setState({
          currentPeer: item,
        });
      }
    });
    this.setState({
      peerGetSwitch: true,
    });
  };

  managePeer = (name, oper, message) => {
    // debugger;
    console.log(message==undefined)
    const { dispatch } = this.props;
    if (typeof message !== 'undefined') {
      if (confirm(message)) {
        dispatch({
          type: 'network/managePeer',
          payload: {
            peerName: name,
            oper,
          },
        });
      }
    } else {
      dispatch({
        type: 'network/managePeer',
        payload: {
          peerName: name,
          oper,
        },
      });
    }
  };

  downloadFileFunc(values, download, host, url) {
    const params = JSON.stringify(values);
    const option = {
      method: 'POST',
      body: params,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
      },
    };
    const fileName = `cert_${values.name}.zip`;
    fetch(`http://${host}${url}`, option)
      .then(res => {
        if (res.status !== 200) {
          message.error(res.message);
          return;
        }
        if (download) {
          return res.blob();
        } else {
          return res.json();
        }
      })
      .then(res => {
        if (!download) {
          if(!res) {
            message.info('服务出错请稍后重试！');
            return;
          }
          message.info(res.message);
          this.updateTable();
          return;
        }
        const downloadFile = this.downloadFile.current;
        const href = window.URL.createObjectURL(res);
        ReactDOM.render(<a href={href} download={fileName} />, downloadFile);
        downloadFile.querySelector('a').click();
        this.updateTable();
      });
  }

  peerDownload = name => {
    const { sessionId } = this.props;
    const { token } = sessionId;
    this.downloadFileFunc({ name, token }, true, host, '/network/peer/cert/download');
  };

  peerDelete = peerName => {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/peerDelete',
      payload: {
        peerName,
      },
    });
  };

  checkName = (rule, value, callback) => {
    const { data, type } = this.props;
    data.map((item, i) => {
      if (type === 'peer') {
        if (item.peerName === value) {
          callback('节点已经存在！');
        } else {
          callback();
        }
      } else {
        if (item.ordererName === value) {
          callback('节点已经存在！');
        } else {
          callback();
        }
      }
    });
  };

  render() {
    const { currentPeer } = this.state;
    const { network, loading, list, sessionId } = this.props;
    const { peerConfig, ordererConfig, peerImageVersion } = network;

    console.log('peerState', this.state, 'peerProps', this.props);

    let token = null;
    if (sessionId) {
      token = sessionId.token;
    }

    const detailInfo = (
      <div className={styles.peer}>
        节点 - {currentPeer ? currentPeer.peerName : '当前还没有节点'}
      </div>
    );

    const ToggleMenu = (
      <Menu onClick={this.togglePeer}>
        {peerConfig && peerConfig.map((item, i) => {
              return (
                <Menu.Item key={item.peerName}>
                  <a style={{ color: '#008dff', cursor: 'pointer' }}>{item.peerName}</a>
                </Menu.Item>
              );
            })
         }
      </Menu>
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

    let peerConfigMan = []; //管理节点data
    let notPeerDeployed = [];
    peerConfig &&
      peerConfig.map((item, i) => {
        if (item.deployedBySystem === true) {
          peerConfigMan.push(item);
        }
        if (item.deploy === false) {
          notPeerDeployed.push(item);
        }
        return (peerConfig[i].key = i);
      });

    const peerConfigCol = [
      {
        title: '名称',
        dataIndex: 'peerName',
      },
      {
        title: '是否部署',
        dataIndex: 'deploy',
        render: text => {
          if (text === true) return '是';
          else return '否';
        },
      },
      {
        title: '部署信息',
        children: [
          {
            title: 'ip',
            dataIndex: 'deployInfo.ip',
          },
          {
            title: '服务请求端口',
            dataIndex: 'deployInfo.requestPort',
          },
          {
            title: '链码监听端口',
            dataIndex: 'deployInfo.chaincodePort',
          },
          {
            title: '区块监听端口',
            dataIndex: 'deployInfo.blockPort',
          },
          {
            title: '镜像版本',
            dataIndex: 'deployInfo.imageVersion',
          },
          {
            title: '容器名称',
            dataIndex: 'deployInfo.containerName',
          },
          {
            title: 'orderer访问地址',
            dataIndex: 'deployInfo.ordererHost',
          },
          {
            title: '组织的mspId',
            dataIndex: 'deployInfo.orgName',
          },
          {
            title: '是否使用了tls',
            dataIndex: 'deployInfo.useTls',
            render: text => {
              if (text === true) return '是';
              else return '否';
            },
          },
        ],
      },
      {
        title: '下载证书',
        dataIndex: 'download',
        render: (text, record) => {
          return (
            <a href="javascript:;" onClick={() => this.peerDownload(record.peerName)}>
              下载
            </a>
          );
        },
      },
      {
        title: '删除',
        dataIndex: 'delete',
        render: (text, record) => {
          return (
            <a href="javascript:;" onClick={() => this.peerDelete(record.peerName)}>
              删除
            </a>
          );
        },
      },
    ];

    const managePeerCol = [
      {
        title: '名称',
        dataIndex: 'peerName',
      },
      {
        title: '创建节点',
        dataIndex: 'create',
        render: (text, record) => {
          return (
            <a href="javascript:;" onClick={() => this.managePeer(record.peerName, 'create')}>
              启动
            </a>
          );
        },
      },
      {
        title: '启动服务',
        dataIndex: 'start',
        render: (text, record) => {
          return (
            <a href="javascript:;" onClick={() => this.managePeer(record.peerName, 'start')}>
              启动
            </a>
          );
        },
      },
      {
        title: '停止服务',
        dataIndex: 'stop',
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              onClick={() => this.managePeer(record.peerName, 'stop', '确定停止吗？')}
            >
              停止
            </a>
          );
        },
      },
      {
        title: '重启服务',
        dataIndex: 'restart',
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              onClick={() => this.managePeer(record.peerName, 'restart', '确定重启吗？')}
            >
              重启
            </a>
          );
        },
      },
      {
        title: '移除节点',
        dataIndex: 'remove',
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              onClick={() => this.managePeer(record.peerName, 'remove', '确定移除吗？')}
            >
              移除
            </a>
          );
        },
      },
      {
        title: '销毁节点',
        dataIndex: 'destroy',
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              onClick={() => this.managePeer(record.peerName, 'destroy', '确定销毁吗？')}
            >
              销毁
            </a>
          );
        },
      },
    ];

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };

    ordererConfig &&
      ordererConfig.map((item, i) => {
        return (ordererConfig[i].key = i);
      });
    return (
      <PageHeaderLayout
        detailInfo={detailInfo}
        toggleSwitch={toggleSwitch}
        logo={peer}
        // leftContent={leftContent}
      >
        <Tabs defaultActiveKey="1" className={styles.tabs}>
          <TabPane
            className={styles.tabChildren}
            tab={
              <span>
                <Icon type="file-text" />
                节点信息
              </span>
            }
            key="1"
          >
            <Row gutter={24}>
              <Col md={24}>
                <div className={styles.blockListTable}>
                  <div className={styles.blockTitle}>节点配置信息</div>
                  <Table
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    dataSource={peerConfig}
                    columns={peerConfigCol}
                  />
                </div>
              </Col>
              <Col md={24} style={{ marginTop: '24px' }}>
                <div className={styles.blockListTable}>
                  <div className={styles.blockTitle}>管理节点</div>
                  <Table
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    dataSource={peerConfigMan}
                    columns={managePeerCol}
                  />
                </div>
              </Col>
              <Col md={24} style={{ marginTop: '24px' }}>
                <div className={styles.blockListTable}>
                  <div className={styles.blockTitle}>生成证书</div>
                  <WrapGenerateCert
                    type="peer"
                    downloadFileFunc={this.downloadFileFunc}
                    data={peerConfig}
                    {...this.props}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane
            className={styles.tabChildren}
            tab={
              <span>
                <Icon type="setting" />
                配置节点
              </span>
            }
            key="2"
          >
            <Row gutter={24}>
              <Col md={24}>
                <div className={styles.blockListTable}>
                  <div className={styles.blockTitle}>节点配置信息</div>
                  <PeerSettingForm
                    currentPeer={currentPeer}
                    updateTable={this.updateTable}
                    {...this.props}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane
            className={styles.tabChildren}
            tab={
              <span>
                <Icon type="cloud-upload" />
                部署节点
              </span>
            }
            key="3"
          >
            <Row gutter={24}>
              <Col md={24}>
                <div className={styles.blockListTable}>
                  <div className={styles.blockTitle}>节点配置信息</div>
                  {peerImageVersion && token ? (
                    <WrapDeployPeer
                      token={token}
                      peerImageVersion={peerImageVersion}
                      peerDeployed={notPeerDeployed}
                      updateTable={this.updateTable}
                    />
                  ) : (
                    ''
                  )}
                </div>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <div ref={this.downloadFile} style={{ display: 'none' }} />
      </PageHeaderLayout>
    );
  }
}
