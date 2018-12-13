import React from 'react';
import { connect } from 'dva';
import { Icon, Radio, Select, Button, Form, Input, Tooltip } from 'antd';
import { clearSpacing } from '../../utils/utils';

const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ network }) => {
  return {
    network,
  };
})
class DeployPeer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useCouchdb: true,
      working: false,
    };
    this.changeCoucndb = this.changeCoucndb.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.changePeer = this.changePeer.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getConfigOrderer',
    });
    dispatch({
      type: 'network/getConfigCouchdb',
    });
    dispatch({
      type: 'network/getPeerNotDeploy',
    });
  }

  componentDidUpdate(prevProps) {
    const prevNetwork = prevProps.network;
    const prevpeerDeploy = prevNetwork.peerDeploy;
    const { network, updateTable } = this.props;
    const { peerDeploy } = network;

    if(peerDeploy && !prevpeerDeploy){
      updateTable()
    }else if(peerDeploy && prevpeerDeploy && peerDeploy.time !== prevpeerDeploy.time){
      updateTable()
    }
  }

  changeCoucndb = e => {
    const value = e.target.value;
    if (value === false) {
      this.setState(
        {
          useCouchdb: false,
        },
        () => {
          const { form } = this.props;
          form.resetFields(['couchdbName']);
          form.validateFields(['couchdbName'], { force: true });
        }
      );
    } else {
      this.setState({
        useCouchdb: true,
      });
    }
  };

  changePeer = ({ key }) => {
    console.log(key);
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getPeerNotDeploy',
    });
    this.setState({
      working: false,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { dispatch, form, token } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('deployPeer', values);
        values.block = values.block_;
        values.chaincodePort = values.chaincodePort_;
        values.containerName = values.containerName_;
        values.blockPort = values.blockPort_;
        values.imageVersion = values.imageVersion_;
        values.ip = values.ip_;
        values.requestPort = values.requestPort_;
        values.hostName = values.hostName_;
        values.token = token;
        dispatch({
          type: 'network/peerDeploy',
          payload: clearSpacing(values),
        });
        this.setState({
          working: true,
        });
      }
    });
  };

  render() {
    const { network, form, peerImageVersion, peerDeployed } = this.props;
    const { ordererConfig, couchdbConfig, peerNotDeploy } = network;
    const { getFieldDecorator } = form;

    console.log('deployPeerState', this.state, 'deployPeerProps', this.props);

    let notOrdererDeploy = [];
    ordererConfig &&
      ordererConfig.forEach(item => {
        if (item.deploy === true) {
          notOrdererDeploy.push(item);
        }
      });

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

    const CardLabel = ({ name, text }) => (
      <span>
        {name}
        &nbsp;
        <Tooltip title={text}>
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>
    );
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} hasFeedback={true} label="服务器ip">
          {getFieldDecorator('ip_', {
            rules: [
              {
                required: true,
                message: '请输入节点名称！',
              },
              {
                pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                message: '输入的IP不正确！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="服务器端口">
          {getFieldDecorator('port', {
            initialValue: '22',
            rules: [
              {
                required: true,
                message: '请输入节点请求端口！',
              },
              {
                pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                message: '输入的端口不正确！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="服务器用户名">
          {getFieldDecorator('userName', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入部署服务器的用户名！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="服务器密码">
          {getFieldDecorator('password', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入部署服务器的密码！',
              },
            ],
          })(<Input type="password" />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="容器名称">
          {getFieldDecorator('containerName_', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入容器名称！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="镜像版本">
          {getFieldDecorator('imageVersion_', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请选择镜像版本！',
              },
            ],
          })(
            <Select
              showSearch
              placeholder="选择一个镜像版本"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {peerImageVersion &&
                peerImageVersion.map((item, i) => {
                  return (
                    <Option key={i} value={item}>
                      {item}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="docker-compose版本">
          {getFieldDecorator('composeFileFormat', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入docker-compose版本！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="docker网络名称">
          {getFieldDecorator('network', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入docker网络名称！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback={true}
          label={<CardLabel name="对外请求端口" text="推荐使用默认端口" />}
        >
          {getFieldDecorator('requestPort_', {
            initialValue: '7051',
            rules: [
              {
                required: true,
                message: '请输入端口！',
              },
              {
                pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                message: '输入的端口不正确！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback={true}
          label={<CardLabel name="链码事件监听端口" text="推荐使用默认端口" />}
        >
          {getFieldDecorator('chaincodePort_', {
            initialValue: '7052',
            rules: [
              {
                required: true,
                message: '请输入端口！',
              },
              {
                pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                message: '输入的端口不正确！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          hasFeedback={true}
          label={<CardLabel name="区块事件监听端口" text="推荐使用默认端口" />}
        >
          {getFieldDecorator('blockPort_', {
            initialValue: '7053',
            rules: [
              {
                required: true,
                message: '请输入端口！',
              },
              {
                pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                message: '输入的端口不正确！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="orderer节点">
          {getFieldDecorator('ordererName', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: 'orderer不能为空！',
              },
            ],
          })(
            <Select placeholder="选择一个orderer">
              {notOrdererDeploy &&
                notOrdererDeploy.map((item, i) => {
                  return (
                    <Option key={i} value={item.ordererName}>
                      {item.ordererName}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="是否使用couchdb">
          {getFieldDecorator('useCouchdb', {
            initialValue: true,
          })(
            <RadioGroup onChange={this.changeCoucndb}>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="couchdb节点">
          {getFieldDecorator('couchdbName', {
            initialValue: '',
            rules: [
              {
                required: this.state.useCouchdb,
                message: 'couchdb不能为空！',
              },
            ],
          })(
            <Select placeholder="选择一个couchdb" disabled={!this.state.useCouchdb}>
              {couchdbConfig &&
                couchdbConfig.map((item, i) => {
                  return (
                    <Option key={i} value={item.couchdbName}>
                      {item.couchdbName}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="peer节点">
          {getFieldDecorator('peerName', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: 'peer节点不能为空！',
              },
            ],
          })(
            <Select onChange={this.changePeer} placeholder="选择一个peer节点">
              {peerNotDeploy &&
                peerNotDeploy.map((item, i) => {
                  return (
                    <Option key={i} value={item}>
                      {item}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="日志级别">
          {getFieldDecorator('logLevel', {
            initialValue: 'info',
          })(
            <RadioGroup>
              <Radio value="info">info</Radio>
              <Radio value="debug">debug</Radio>
              <Radio value="warn">warn</Radio>
              <Radio value="error">error</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="是否开启tls">
          {getFieldDecorator('useTls', {
            initialValue: true,
          })(
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem wrapperCol={{ span: 8, offset: 8 }}>
          <Button type="primary" block htmlType="submit">
            部署
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrapDeployPeer = Form.create()(DeployPeer);
export default WrapDeployPeer;
