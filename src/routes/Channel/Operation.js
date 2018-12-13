import React from 'react';
import ReactDOM from 'react-dom';
import fetch from 'dva/fetch';
import { connect } from 'dva';
import { Row, Col, Button, Input, Form, Upload, Icon, message, Select } from 'antd';
import { clearSpacing } from '../../utils/utils';

import styles from './operation.less';

function beforeUpload(file) {
  const fileName = file.name;
  const matchArr = fileName.split('.');
  if(!matchArr){
    message.error('只能上传json格式的文件！');
    return false;
  }else{
    const type = matchArr[matchArr.length-1];
    if (type !== 'json') {
        message.error('只能上传json格式的文件！');
        return false;
      }
  }
}
function beforeUploadPd(file) {
  const fileName = file.name;
  const matchArr = fileName.split('.');
  if(!matchArr){
    message.error('只能上传pb格式的文件！');
    return false;
  }else{
    const type = matchArr[matchArr.length-1];
    if (type !== 'pb') {
        message.error('只能上传pb格式的文件！');
        return false;
      }
  }
}
// function beforeUploadZip(file) {
//   const fileName = file.name;
//   const type = fileName.split('.')[1];
//   console.log('file.type', file);
//   if (type !== 'pb') {
//     message.error('只能上传pb格式的文件！');
//     return false;
//   }
// }
const FormItem = Form.Item;
const Option = Select.Option;
const host = window.hostIp;
@connect(({ network }) => {
  return {
    network,
  };
})
class Operation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addOrg: '',
      deleteOrg: '',
      fileList: [],
      submitOperFileList: [],
      submitSignFileList: [],
    };
    this.downloadFile = React.createRef();
    this.addBlur = this.addBlur.bind(this);
    this.deleteBlur = this.deleteBlur.bind(this);
    this.deleteOrg = this.deleteOrg.bind(this);
    this.focusChannelName = this.focusChannelName.bind(this);
    this.customRequest = this.customRequest.bind(this);
    // this.actionFunc = this.actionFunc.bind(this);
  }

  componentDidMount() {}
  addBlur = e => {
    console.log(e);
    this.setState({
      addOrg: e.target.value,
    });
  };

  deleteBlur = e => {
    console.log(e);
    this.setState({
      deleteOrg: e.target.value,
    });
  };

  deleteOrg = () => {
    const { dispatch, form } = this.props;
    form.validateFields(['oper_orgNameDel', 'oper_channelNameDel'], (errors, values) => {
      if (!errors) {
        values.channelName = values.oper_channelNameDel;
        values.orgName = values.oper_orgNameDel;
        const params = JSON.stringify(clearSpacing(values));
        const option = {
          method: 'POST',
          body: params,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=UTF-8',
          },
          responseType: 'blob',
        };
        const fileName = `delete_${values.orgName}_${values.channelName}.pb`;
        fetch(`http://${host}/channel/org/delete`, option)
          .then(res => {
            if (res.status !== 200) {
              message.error(res.message);
              return;
            }
            return res.blob();
          })
          .then(res => {
            const downloadFile = this.downloadFile.current;
            const href = window.URL.createObjectURL(res);
            ReactDOM.render(<a href={href} download={fileName} />, downloadFile);
            downloadFile.querySelector('a').click();
          });
      }
    });
  };

  getInstallId = (dispatch, oper_orgName, oper_channelName) => {
    dispatch({
      type: 'network/addOrg',
      payload: {
        orgName: oper_orgName,
        channelName: oper_channelName,
      },
    });
  };
  changeOrgName = e => {
    const { dispatch, form } = this.props;
    const oper_orgName = e.target.value;
    const values = form.getFieldsValue(['oper_channelName']);
    values.oper_channelName && this.getInstallId(dispatch, oper_orgName, values.oper_channelName);
  };
  changeChannelName = key => {
    const { dispatch, form } = this.props;
    const oper_channelName = key;
    const values = form.getFieldsValue(['oper_orgName']);
    values.oper_orgName && this.getInstallId(dispatch, values.oper_orgName, oper_channelName);
  };

  focusChannelName = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getChannelList',
    });
  };

  customRequest = file => {
    const { network, form } = this.props;
    const { fileId } = network;
    const formData = new FormData();
    const fileUrl = `http://${host}/channel/org/add/${fileId}`;
    const orgName = form.getFieldValue('oper_orgName');
    formData.append('file', file.file);

    const fileName = `add_${orgName}.pb`;
    const option = {
      method: 'POST',
      body: formData,
      processData: false,
      responseType: 'blob',
    };

    fetch(fileUrl, option)
      .then(res => {
        console.log(res.headers.get('Content-Disposition'));
        if (res.status !== 200) {
          message.error(res.message);
          return;
        }
        return res.blob({ type: 'application/octet-stream' });
      })
      .then(res => {
        const downloadFile = this.downloadFile.current;
        const href = window.URL.createObjectURL(res);
        ReactDOM.render(<a href={href} download={fileName} />, downloadFile);
        downloadFile.querySelector('a').click();
        const { fileList } = this.state;
        fileList[0].status = 'done';
        this.setState({
          fileList,
        });
      });

    return {
      abort() {
        console.log('upload progress is aborted.');
      },
    };
  };

  handleChange = info => {
    let { fileList, file } = info;
    fileList = fileList.slice(-1);
    console.log('上传下载', info);
    this.setState({
      fileList,
    });

    // if(file.response){
    //     const data = new Blob([file.response],{type: 'application/octet-binary'});
    //     const downloadFile = this.downloadFile.current;
    //     const href = window.URL.createObjectURL(data);
    //     ReactDOM.render(<a href={href} download='add.pb'></a>,downloadFile);
    //     downloadFile.querySelector('a').click();
    // }
  };

  handleChangeSubmitOper = info => {
    let fileList = info.fileList;
    fileList = fileList.slice(-1);
    this.setState({
      submitOperFileList: fileList,
    });
  };

  handleChangeSubmitSign = info => {
    let fileList = info.fileList;
    this.setState({
      submitSignFileList: fileList,
    });
  };

  changeChannelNameSubmit = key => {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getChannelOperSubmitId',
      payload: {
        channelName: key,
      },
    });
    
  };

  allOk = () => {
    const { dispatch, network, form } = this.props;
    dispatch({
      type: 'network/submitOk',
      payload: {
        submitId: network.submitId.fileId,
      },
    });
    this.setState({
        submitOperFileList: [],
        submitSignFileList: []
    })
    form.setFieldsValue({
        oper_channelNameSubmit:''
    })
  };

  render() {
    const { fileList, submitOperFileList, submitSignFileList } = this.state;
    const { form, network } = this.props;
    const { fileId, channelList, submitId } = network;
    const { getFieldDecorator } = form;
    console.log('operation', this.props);
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
    const formBtnLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { offset: 8, span: 8 },
      },
    };
    return (
      <div>
        <Row className={styles.row}>
          <Col className={styles.title} offset={6} span={18}>
            添加组织：
          </Col>
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout} label="组织名">
              {getFieldDecorator('oper_orgName', {
                rules: [
                  {
                    required: true,
                    message: '不能为空！',
                  },
                ],
              })(<Input onChange={this.changeOrgName.bind(this)} placeholder="请输入orgName" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="通道名">
              {getFieldDecorator('oper_channelName', {
                rules: [
                  {
                    required: true,
                    message: '不能为空！',
                  },
                ],
              })(
                <Select
                  onFocus={this.focusChannelName}
                  onChange={this.changeChannelName}
                  placeholder="选择通道"
                >
                  {channelList &&
                    channelList.map((item, i) => {
                      return (
                        <Option key={i} value={item}>
                          {item}
                        </Option>
                      );
                    })}
                </Select>
              )}
            </FormItem>
            {/* <FormItem
                            {...formItemLayout}
                            label="获取绑定Id"
                        >
                            <Row gutter={8}>
                            <Col span={12}>
                            {getFieldDecorator('fileId',{
                                initialValue: fileId?fileId : '',
                                rules: [{
                                    required: true, message: 'Id不能为空'
                                }]
                            })(
                                <Input disabled={true} />
                            )}
                            </Col>
                            <Col span={12}>
                                <Button onClick={this.getInstallId} type="primary">获取</Button>
                            </Col>
                            </Row>
                        </FormItem> */}
            <FormItem
              {...formItemLayout}
              label="上传配置文件并添加"
              extra="请先获取绑定Id且只能上传json格式文件"
            >
              {getFieldDecorator('file', {
                valuePropName: 'file',
              })(
                <Upload
                  disabled={fileId ? false : true}
                  name="file"
                  // multiple={true}
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onChange={this.handleChange}
                  customRequest={this.customRequest}
                  // action={`http://${host}/channel/org/add/${fileId}`}
                >
                  <Button>
                    <Icon type="upload" /> 上传配置文件并下载pb文件
                  </Button>
                </Upload>
              )}
            </FormItem>
            <Col className={styles.title} offset={6} span={18}>
              删除组织：
            </Col>
            <FormItem {...formItemLayout} label="组织名">
              {getFieldDecorator('oper_orgNameDel', {
                rules: [
                  {
                    required: true,
                    message: '不能为空！',
                  },
                ],
              })(<Input placeholder="请输入orgName" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="通道名">
              {getFieldDecorator('oper_channelNameDel', {
                rules: [
                  {
                    required: true,
                    message: '不能为空！',
                  },
                ],
              })(
                <Select onFocus={this.focusChannelName} placeholder="选择通道">
                  {channelList &&
                    channelList.map((item, i) => {
                      return (
                        <Option key={i} value={item}>
                          {item}
                        </Option>
                      );
                    })}
                </Select>
              )}
            </FormItem>
            <FormItem {...formBtnLayout}>
              <Button block onClick={this.deleteOrg} type="primary">
                下载pb文件
              </Button>
            </FormItem>
            <Col className={styles.title} offset={6} span={18}>
              提交：
            </Col>
            <FormItem {...formItemLayout} label="通道名">
              {getFieldDecorator('oper_channelNameSubmit', {
                rules: [
                  {
                    required: true,
                    message: '不能为空！',
                  },
                ],
              })(
                <Select
                  onFocus={this.focusChannelName}
                  placeholder="选择通道"
                  onChange={this.changeChannelNameSubmit}
                >
                  {channelList &&
                    channelList.map((item, i) => {
                      return (
                        <Option key={i} value={item}>
                          {item}
                        </Option>
                      );
                    })}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="上传操作文件" extra="增加或删除操作时获取的pb文件">
              {getFieldDecorator('fileOper', {
                valuePropName: 'file',
              })(
                <Upload
                  name="file"
                  disabled={submitId?false:true}
                  fileList={submitOperFileList}
                  beforeUpload={beforeUploadPd}
                  onChange={this.handleChangeSubmitOper}
                  action={`http://${host}/channel/update/submit/tx/${
                    submitId ? submitId.fileId : ''
                  }`}
                >
                  <Button>
                    <Icon type="upload" /> 上传操作文件
                  </Button>
                </Upload>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="上传签名文件" extra="签名者签发的文件">
              {getFieldDecorator('fileSign', {
                valuePropName: 'file',
              })(
                <Upload
                  name="file"
                  multiple={true}
                  disabled={submitId?false:true}
                  fileList={submitSignFileList}
                  beforeUpload={beforeUploadPd}
                  onChange={this.handleChangeSubmitSign}
                  action={`http://${host}/channel/update/submit/sign/${
                    submitId ? submitId.fileId : ''
                  }`}
                >
                  <Button>
                    <Icon type="upload" /> 上传签名文件
                  </Button>
                </Upload>
              )}
            </FormItem>
            <FormItem {...formBtnLayout}>
              <Button
                block
                disabled={!(submitOperFileList.length && submitSignFileList.length)}
                onClick={this.allOk}
                type="primary"
              >
                确认
              </Button>
            </FormItem>
          </Form>
        </Row>

        <div ref={this.downloadFile} />
      </div>
    );
  }
}
const WrapOperation = Form.create()(Operation);
export default WrapOperation;
