import React from 'react';
import { Form, Input, Select, Col, Row, Button, Upload, Icon, message } from 'antd';
import { connect } from 'dva';
import { clearSpacing } from '../../utils/utils';

const FormItem = Form.Item;
const Option = Select.Option;

const host = window.hostIp;

function beforeUpload(file) {
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
}

@connect(({ chart, loading }) => {
  return {
    chart,
    loading: loading.effects['chart/peerGetChannelList'],
  };
})
class InstallForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      chaincodeIdSwitch: true,
      uploadSwitch: true,
      setFieldSwitch: true,
    };
    this.normFile = this.normFile.bind(this);
    // this.beforeUpload = this.beforeUpload.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentPeer.name !== this.props.currentPeer.name) {
      this.props.form.setFieldsValue({
        peerName: nextProps.currentPeer.name,
        chaincodeId: '',
      });
    }
  }

  componentDidUpdate(prevProps) {
    const prevChart = prevProps.chart;
    const { chart, form, updateTable } = this.props;
    const prevChaincodeId = prevChart.chaincodeId;
    const { chaincodeId } = chart;
    const { setFieldSwitch, uploadSwitch } = this.state;

    if (!prevChaincodeId && chaincodeId) {
      form.setFieldsValue({
        chaincodeId: chaincodeId,
      });
    } else if (prevChaincodeId && chaincodeId && prevChaincodeId !== chaincodeId) {
      form.setFieldsValue({
        chaincodeId: chaincodeId,
      });
    }
  }

  normFile = e => {
    console.log('Upload event:', e);
    if (e.file.type !== 'application/zip') return false;
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  getInstallId = () => {
    const { dispatch, form } = this.props;
    form.validateFields(
      ['chaincodeName', 'version', 'policy', 'peerName', 'language'],
      { force: true },
      (errors, values) => {
        if (!errors) {
          console.log('form', values);
          dispatch({
            type: 'chart/getInstallId',
            payload: clearSpacing(values),
          });
          this.setState({
            chaincodeIdSwitch: true,
            uploadSwitch: true,
          });
        }
      }
    );
  };

  handleChange = info => {
    const { updateTable, form } = this.props;
    let fileList = info.fileList;
    fileList = fileList.slice(-1);
    this.setState({
      fileList,
    });

    const { file } = info;
    const { response } = file;
    if (response) {
      message.info(response.message);
      if (fileList[0].status === 'done') {
        updateTable();
        form.setFieldsValue({
          chaincodeId: '',
        });
        this.setState({
          uploadSwitch: false,
        });
      }
    }
  };

  render() {
    const { fileList, chaincodeIdState, uploadSwitch } = this.state;
    const { chart, currentPeer } = this.props;
    const { chaincodeId } = chart;
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
    console.log('installFormState', this.state);
    return (
      <Form>
        <FormItem {...formItemLayout} label="合约名称" hasFeedback={true}>
          {getFieldDecorator('chaincodeName', {
            rules: [
              {
                required: true,
                message: '请输入合约名',
              },
              {
                pattern: /^[a-z]([a-z0-9_]{5,24})$/,
                message: '请输入以小写字母开头的6-25位数字、小写字母、下划线组成的字符',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="合约版本" hasFeedback={true}>
          {getFieldDecorator('version', {
            rules: [
              {
                required: true,
                message: '请输入版本号',
              },
              {
                pattern: /^([0-9]+\.?){1,10}$/g,
                message: '版本号只能是不超过10位的数字跟小数点的组合',
              },
            ],
          })(<Input />)}
        </FormItem>
        {/* <FormItem
                    {...formItemLayout}
                    label="实例化策略"
                >
                    {getFieldDecorator('policy',{
                        initialValue: '',
                        // rules: [{
                        //   required: true, message: '请输入策略'
                        // },{
                        //   validator: this.checkChaincodeVersion
                        // }]
                    })(
                        <Input />
                    )}
                </FormItem> */}
        <FormItem {...formItemLayout} label="合约语言">
          {getFieldDecorator('language', {
            initialValue: 'go',
            rules: [
              {
                required: true,
              },
            ],
          })(
            <Select>
              <Option value="go">go</Option>
              <Option value="java">java</Option>
              <Option value="node">node</Option>
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="当前节点名称">
          {getFieldDecorator('peerName', {
            initialValue: currentPeer ? currentPeer.name : '',
            rules: [
              {
                required: true,
                message: '请输入节点名称',
              },
            ],
          })(<Input disabled={true} />)}
        </FormItem>

        <FormItem {...formItemLayout} label="获取绑定Id">
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator('chaincodeId', {
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
              <Button onClick={this.getInstallId} type="primary">
                获取
              </Button>
            </Col>
          </Row>
        </FormItem>

        <FormItem {...formItemLayout} label="上传合约" extra="请先获取绑定Id且只能上传zip格式文件">
          {getFieldDecorator('file', {
            valuePropName: 'file',
            getValueFromEvent: this.normFile,
          })(
            <Upload
              disabled={chaincodeId && uploadSwitch ? false : true}
              name="file"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={this.handleChange}
              action={`http://${host}/chaincode/install/${chaincodeId}`}
            >
              <Button>
                <Icon type="upload" /> 点击上传
              </Button>
            </Upload>
          )}
        </FormItem>
      </Form>
    );
  }
}

const WrapForm = Form.create()(InstallForm);
export default WrapForm;
