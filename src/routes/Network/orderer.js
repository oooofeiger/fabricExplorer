import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import {
  Row,
  Col,
  Icon,
  Tabs,
  Table,
  Radio,
  Select,
  Menu,
  Dropdown,
  Button,
  Form,
  message,
  Upload,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import WrapGenerateCert from './generateCert';
import OrdererSettingForm from './ordererSetting';
import styles from './index.less';

import peer from '../../assets/节点.png';

const { TabPane } = Tabs;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const host = window.hostIp;
@connect(({ network, loading }) => {
  return {
    network,
    loading: loading.effects['network/getConfigOrderer'],
  };
})
class OrdererNetwork extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentOrderer: null,
      listSwitch: true,
      certId: null,
      shouldCheck: true,
      disabled: false,
      certTypeFlag: true,
      certType: 'tls',
      tlsFileList: [],
      addSet: true,
      ordererSwitch: true,
    };
    this.downloadFile = React.createRef();
    this.togglePeer = this.togglePeer.bind(this);
    this.downloadCert = this.downloadCert.bind(this);
    this.deleteOrderer = this.deleteOrderer.bind(this);
    this.downloadFileFunc = this.downloadFileFunc.bind(this);
    this.updateTable = this.updateTable.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getConfigOrderer',
    });
    dispatch({
      type: 'network/ordererImageVersion',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.sessionId) return;
    const prevNetwork = prevProps.network;
    const prevOrdererDelete = prevNetwork.ordererDelete;

    const { dispatch, network, updateList } = this.props;
    const { ordererConfig, ordererDelete } = network;
    const { token } = this.props.sessionId;
    const { updateSwitch } = this.state;
    if (ordererConfig && this.state.listSwitch) {
      this.setState({
        currentOrderer: ordererConfig[0],
        listSwitch: false,
      });
    }

    if (ordererDelete && !prevOrdererDelete) {
      this.updateTable();
      updateList();
      ordererConfig.length === 1 && this.setState({
          currentOrderer: null
      })
    } else if (
      prevOrdererDelete &&
      ordererDelete &&
      ordererDelete.time !== prevOrdererDelete.time
    ) {
      this.updateTable();
      updateList();
      ordererConfig.length === 1 && this.setState({
        currentOrderer: null
    })
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

    if (this.state.currentOrderer && this.state.ordererSwitch) {
      dispatch({
        type: 'network/ordererGet',
        payload: {
          ordererName: this.state.currentOrderer.ordererName,
        },
      });
      this.setState({
        ordererSwitch: false,
      });
    }
  }

  updateTable() {
    this.setState({
      updateSwitch: true,
      ordererSwitch: true,
    });
  }

  beforeUpload = file => {
    const fileName = file.name;
    const matchArr = fileName.split('.');
    if(!matchArr){
        message.error('只能上传zip格式的文件！');
        return false;
    }else{
        const type = matchArr[matchArr.length-1];
        if (type !== 'zip') {
            message.error('只能上传zip格式的文件！');
            return false;
        }
    }
  };

  togglePeer = ({ key }) => {
    console.log(key);
    const { ordererConfig } = this.props.network;
    ordererConfig.map((item, i) => {
      if (item.ordererName === key) {
        this.setState({
          currentOrderer: item,
          ordererSwitch: true,
        });
      }
    });
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

  downloadCert = name => {
    const { sessionId } = this.props;
    const { token } = sessionId;
    this.downloadFileFunc({ name, token }, true, host, '/network/orderer/cert/download');
  };

  deleteOrderer = ordererName => {
    const { dispatch } = this.props;
    if (confirm('确定删除吗？')) {
      dispatch({
        type: 'network/ordererDelete',
        payload: { ordererName },
      });
    }
  };

  render() {
    const { currentOrderer, tlsFileList, addSet } = this.state;
    const { network, loading, sessionId } = this.props;
    const {
      ordererConfig,
      ordererCertId,
      ordererDownload,
      ordererDelete,
      ordererGet,
      ordererImageVersion,
    } = network;
    const { getFieldDecorator } = this.props.form;
    console.log('ordererState', this.state, 'ordererProps', this.props);

    const detailInfo = (
      <div className={styles.peer}>
        节点 - {currentOrderer ? currentOrderer.ordererName : '当前没有节点'}
      </div>
    );

    const ToggleMenu = (
      <Menu onClick={this.togglePeer}>
        {ordererConfig &&
          ordererConfig.map((item, i) => {
            return (
              <Menu.Item key={item.ordererName}>
                <a style={{ color: '#008dff', cursor: 'pointer' }}>{item.ordererName}</a>
              </Menu.Item>
            );
          })}
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

    ordererConfig &&
      ordererConfig.map((item, i) => {
        return (ordererConfig[i].key = i);
      });
    const ordererConfigCol = [
      {
        title: '名称',
        dataIndex: 'ordererName',
      },
      {
        title: '是否已部署',
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
            title: '镜像版本',
            dataIndex: 'deployInfo.imageVersion',
          },
          {
            title: '容器名称',
            dataIndex: 'deployInfo.containerName',
          },
          {
            title: '节点使用权限',
            dataIndex: 'deployInfo.permission',
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
            <a href="javascript:;" onClick={() => this.downloadCert(record.ordererName)}>
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
            <a href="javascript:;" onClick={() => this.deleteOrderer(record.ordererName)}>
              删除
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

    return (
      <PageHeaderLayout detailInfo={detailInfo} toggleSwitch={toggleSwitch} logo={peer}>
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
                    dataSource={ordererConfig}
                    columns={ordererConfigCol}
                  />
                </div>
              </Col>
              <Col md={24} style={{ marginTop: '24px' }}>
                <div className={styles.blockListTable}>
                  <div className={styles.blockTitle}>生成证书</div>
                  {sessionId ? (
                    <WrapGenerateCert
                      token={sessionId.token}
                      type="orderer"
                      data={ordererConfig}
                      downloadFileFunc={this.downloadFileFunc}
                    />
                  ) : (
                    ''
                  )}
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
                  <OrdererSettingForm
                    updateTable={this.updateTable}
                    currentOrderer={currentOrderer}
                  />
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

const WrapOrdererNetwork = Form.create({})(OrdererNetwork);
export default WrapOrdererNetwork;
