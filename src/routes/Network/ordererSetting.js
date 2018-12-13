import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Row, Col, Icon, Radio, Select, Button, Form, Input, Upload, message, Tooltip } from 'antd';
import { clearSpacing } from '../../utils/utils';

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
class OrdererSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      certId: null,
      shouldCheck: true,
      disabled: false,
      certTypeFlag: true,
      certType: 'tls',
      tlsFileList: [],
      allFileList: [],
      addSet: true,
      uploadSwitch: true,
      certIdSwitch: false,
    };
    this.changeDeployed = this.changeDeployed.bind(this);
    this.getCertId = this.getCertId.bind(this);
    this.beforeUpload = this.beforeUpload.bind(this);
    this.changeUploadTls = this.changeUploadTls.bind(this);
    this.changeUseTls = this.changeUseTls.bind(this);
    this.changeCertType = this.changeCertType.bind(this);
    this.checkName = this.checkName.bind(this);
    this.changeOper = this.changeOper.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { currentOrderer, form } = this.props;
    if (
      nextProps.currentOrderer &&
      currentOrderer &&
      nextProps.currentOrderer.ordererName !== currentOrderer.ordererName
    ) {
      form.setFieldsValue({
        certId: '',
      });
      this.setState({
        uploadSwitch: false,
        tlsFileList: [],
        allFileList: [],
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { network, updateTable, form } = this.props;
    const prevNetwork = prevProps.network;
    const prevOrdererGet = prevProps.network;
    const prevOrdererCertId = prevNetwork.ordererCertId;
    const { ordererCertId, ordererGet } = network;
    const { certIdSwitch } = this.state;
    if (!prevOrdererCertId && ordererCertId) {
      updateTable();
      form.setFieldsValue({
        certId: ordererCertId.certId,
      });
    } else if (
      prevOrdererCertId &&
      ordererCertId &&
      prevOrdererCertId.time !== ordererCertId.time
    ) {
      updateTable();
      form.setFieldsValue({
        certId: ordererCertId.certId,
      });
    }

    if(!prevOrdererGet && ordererGet){
        updateTable();
    }else if(prevOrdererGet && ordererGet && prevOrdererGet.time !== ordererGet.time){
        updateTable();
    }
  }

  changeDeployed = e => {
    console.log('value', value);
    const value = e.target.value;
    if (value === false) {
      this.setState(
        {
          shouldCheck: false,
          disabled: true,
        },
        () => {
          const { form } = this.props;
          form.resetFields(['ip', 'port', 'hostName']);
          form.setFieldsValue({ deployed: false });
          form.validateFields(['ip', 'port', 'hostName'], { force: true });
        }
      );
    } else {
      this.setState({
        shouldCheck: true,
        disabled: false,
      });
    }
  };

  getCertId = () => {
    const { dispatch, form } = this.props;
    form.validateFields(
      [
        'name',
        'orgName',
        'deployed',
        'ip',
        'port',
        'hostName',
        'useTls',
        'certType',
        'imageVersion',
        'containerName',
        'firstSet',
      ],
      (err, values) => {
        if (!err) {
          dispatch({
            type: 'network/getOrdererCertId',
            payload: clearSpacing(values),
          });
          this.setState({
            uploadSwitch: true,
          });
        }
      }
    );
  };

  beforeUpload = file => {
    const { form } = this.props;
    const certType = form.getFieldValue('certType');
    const fileName = file.name;
    const typeArr = fileName.split('.');
    if(!typeArr.length){
        message.error('上传文件格式不正确！');
        return false;
    }
    const type = typeArr[typeArr.length - 1];
    console.log('file.type', type);
    if (certType === 'tls') {
      if (type !== 'crt') {
        message.error('只能上传crt格式的文件！');
        return false;
      }
    } else {
      if (type !== 'zip') {
        message.error('只能上传zip格式的文件！');
        return false;
      }
    }
  };

  changeUploadTls = info => {
    const { form, updateTable } = this.props;
    let { fileList, file } = info;
    fileList = fileList.slice(-1);
    this.setState({
        tlsFileList:fileList,
    });

    if (file.status === 'done') {
      if(file.response){
        file.response.message && message.info(file.response.message) 
      } 
      updateTable();
      form.setFieldsValue({
        certId: '',
      });
      this.setState({
        uploadSwitch: false,
      });
    }
  };

  changeUploadAll = info => {
    const { form, updateTable } = this.props;
    let { fileList, file } = info;
    fileList = fileList.slice(-1);
    this.setState({
      allFileList : fileList,
    });

    if (file.status === 'done') {
        if(file.response){
            file.response.message && message.info(file.response.message) 
        }
        updateTable();
        form.setFieldsValue({
            certId: '',
        });
        this.setState({
            uploadSwitch: false,
        });
    }
  };

  changeUseTls = e => {
    const { form } = this.props;
    const value = e.target.value;
    console.log(value);
    if (value === true) {
      this.setState(
        {
          certTypeFlag: true,
          certType: 'all',
        },
        () => {
          form.setFieldsValue({ certType: 'all' });
          form.validateFields(['certType'], { force: true });
        }
      );
    } else if (value === false) {
      this.setState(
        {
          certTypeFlag: false,
          certType: 'all',
        },
        () => {
          form.setFieldsValue({ certType: 'all' });
          form.validateFields(['certType'], { force: true });
        }
      );
    }
  };

  changeCertType = e => {
    const value = e.target.value;
    if (value === 'tls') {
      this.setState({
        certType: 'tls',
      });
    } else if (value === 'all') {
      this.setState({
        certType: 'all',
      });
    }
  };

  checkName = (rule, value, callback) => {
    const { ordererConfig } = this.props.network;
    let flag = false;
    ordererConfig &&
      ordererConfig.map((item, i) => {
        if (value === item.ordererName) {
          flag = true;
        }
      });
    if (flag) {
      callback('节点已存在！');
      flag = false;
    } else {
      callback();
    }
  };

  changeOper = e => {
    const { form, network } = this.props;
    this.setState(
      {
        addSet: e.target.value,
        certTypeFlag: e.target.value,
        certType: network.ordererGet.certType,
        shouldCheck: network.ordererGet.deployed,
        disabled: !e.target.value,
      },
      () => {
        form.resetFields();
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields(
      [
        'name',
        'ip',
        'port',
        'hostName',
        'firstSet',
        'useTls',
        'deployed',
        'orgName',
        'certType',
        'imageVersion',
        'containerName',
      ],
      (err, values) => {
        if (!err) {
          dispatch({
            type: 'network/getOrdererCertId',
            payload: clearSpacing(values),
          });
        }
      }
    );
  };

  render() {
    const { tlsFileList, addSet, uploadSwitch, allFileList } = this.state;
    const { network, loading, sessionId } = this.props;
    const {
      ordererConfig,
      ordererDownload,
      ordererDelete,
      ordererGet,
      ordererImageVersion,
      ordererCertId,
    } = network;
    const { getFieldDecorator } = this.props.form;

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

    //获取上传id提示
    const labelArgs = (
      <span>
        获取上传Id&nbsp;
        <Tooltip title="修改任何配置之后都要重新获取上传Id，否则上传无效">
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>
    );

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="选择操作">
          {getFieldDecorator('firstSet', {
            initialValue: addSet,
          })(
            <RadioGroup disabled={!ordererConfig || JSON.stringify(ordererConfig)==='[]'} onChange={this.changeOper}>
              <Radio value={true}>新增配置</Radio>
              <Radio value={false}>修改配置</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="orderer节点名称">
          {getFieldDecorator('name', {
            initialValue: addSet ? '' : ordererGet.name,
            rules: [
              {
                required: true,
                message: '请输入节点名称！',
              },
              {
                validator: addSet ? this.checkName : '',
              },
              {
                pattern: /^[0-9a-zA-Z]+$/,message:'只能输入数字或者字母组成的名称'
              }
            ],
          })(<Input disabled={!addSet} />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="节点域名">
          {getFieldDecorator('hostName', {
            initialValue: addSet ? '' : ordererGet.hostName,
            rules: [
              {
                required: true,
                message: '请输入节点域名！',
              },
              {
                pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/,
                message: '输入的域名不正确！',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="组织名称">
          {getFieldDecorator('orgName', {
            initialValue: addSet ? '' : ordererGet.orgName,
            rules: [
              {
                required: true,
                message: '请输入节点所属组织的mspId！',
              },
              {
                pattern: /^[a-zA-Z0-9]+$/g, message:'请输入字母或者数字的组合！'
              }
            ],
          })(<Input placeholder="请输入节点所属组织的mspId" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="是否已部署">
          {getFieldDecorator('deployed', {
            initialValue: true,
          })(
            <RadioGroup onChange={this.changeDeployed}>
              <Radio value={true}>是</Radio>
              {/* <Radio value={false}>否</Radio> */}
            </RadioGroup>
          )}
        </FormItem>

        <FormItem {...formItemLayout} hasFeedback={true} label="IP">
          {getFieldDecorator('ip', {
            initialValue: addSet ? '' : ordererGet.ip,
            rules: [
              {
                required: true,
                message: '请输入可以访问到节点的IP！',
              },
              {
                pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                message: '输入的IP不正确！',
              },
            ],
          })(<Input placeholder="输入可以访问到节点的IP" />)}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="服务端口">
          {getFieldDecorator('port', {
            initialValue: addSet ? '' : ordererGet.port,
            rules: [
              {
                required: true,
                message: '请输入服务端口！',
              },
              {
                pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                message: '输入的端口不正确！',
              },
            ],
          })(<Input  />)}
        </FormItem>

        

        <FormItem {...formItemLayout} label="是否开启了tls">
          {getFieldDecorator('useTls', {
            initialValue: addSet ? true : ordererGet.useTls,
          })(
            <RadioGroup disabled={!addSet} onChange={this.changeUseTls}>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem {...formItemLayout} hasFeedback={true} label="镜像版本">
          {getFieldDecorator('imageVersion', {
            initialValue: addSet ? '' : ordererGet.imageVersion,
          })(
            <Select
              showSearch
              placeholder="选择一个镜像版本"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {ordererImageVersion &&
                ordererImageVersion.map((item, i) => {
                  return (
                    <Option key={i} value={item}>
                      {item}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} hasFeedback={true} label="容器名称">
          {getFieldDecorator('containerName', {
            initialValue: addSet ? '' : ordererGet.containerName,
          })(<Input />)}
        </FormItem>

        <FormItem {...formItemLayout} label="证书类型">
          {getFieldDecorator('certType', {
            initialValue: addSet ? '' : ordererGet.certType,
            rules: [
              {
                required: true,
                message: '请选择证书类型！',
              },
            ],
          })(
            <RadioGroup disabled={!addSet} onChange={this.changeCertType}>
              <Radio disabled={!this.state.certTypeFlag} value="tls">
                tls
              </Radio>
              <Radio value="all">all</Radio>
              <Radio disabled={this.state.certTypeFlag} value="no">
                no
              </Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          wrapperCol={{ span: 8, offset: 8 }}
          style={{ display: !addSet ? 'block' : 'none' }}
        >
          <Button type="primary" block htmlType="submit">
            确定
          </Button>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={labelArgs}
          style={{ display: !addSet ? 'none' : 'block' }}
        >
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator('certId', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: 'Id不能为空',
                  },
                ],
              })(<Input disabled={true} />)}
            </Col>
            <Col span={12}>
              <Button onClick={this.getCertId} type="primary">
                获取
              </Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="上传tls证书"
          extra="请先获取上传Id"
          style={{ display: !addSet ? 'none' : this.state.certType === 'tls' ? 'block' : 'none' }}
        >
          {getFieldDecorator('certTls', {
            valuePropName: 'certTls',
            getValueFromEvent: this.normFile,
            rules: [{ required: true }],
          })(
            <Upload
              disabled={ordererCertId && uploadSwitch ? false : true}
              name="file"
              fileList={tlsFileList}
              action={`http://${host}/network/orderer/cert/upload/tls/${ordererCertId ? ordererCertId.certId : ''}`}
              beforeUpload={this.beforeUpload}
              onChange={this.changeUploadTls}
            >
              <Button>
                <Icon type="upload" /> 上传tls
              </Button>
            </Upload>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="上传全部证书"
          extra="请先获取上传Id"
          style={{ display: !addSet ? 'none' : this.state.certType === 'all' ? 'block' : 'none' }}
        >
          {getFieldDecorator('cert', {
            valuePropName: 'cert',
            getValueFromEvent: this.normFile,
            rules: [{ required: true }],
          })(
            <Upload
              disabled={ordererCertId && uploadSwitch ? false : true}
              name="file"
              fileList={allFileList}
              action={`http://${host}/network/orderer/cert/upload/all/${
                ordererCertId ? ordererCertId.certId : ''
              }`}
              beforeUpload={this.beforeUpload}
              onChange={this.changeUploadAll}
            >
              <Button>
                <Icon type="upload" /> 上传文件
              </Button>
            </Upload>
          )}
        </FormItem>
      </Form>
    );
  }
}

const OrdererSettingForm = Form.create({})(OrdererSetting);
export default OrdererSettingForm;
