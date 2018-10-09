import React from 'react';
import {
    Form,
    Input,
    Select,
    Col,
    Row,
    Button,
    Upload,
    Icon,
    message
} from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;
const Option = Select.Option;

const host = '192.168.32.116:8080';

function beforeUpload(file){
    const fileName = file.name;
    const type = fileName.match(/\.(.+)$/)[1];
    console.log('file.type',file)
    if(type !== 'zip'){
      message.error('只能上传zip格式的文件！');
      return false;
    }
}

@connect(({ chart, loading }) => {
    return {
        chart,
        loading: loading.effects['chart/peerGetChannelList'],
      }
  } )
class InstallForm extends React.Component{
    constructor(props){
        super(props);
        this.state={
            fileList:[]
        };
        this.normFile = this.normFile.bind(this);
        // this.beforeUpload = this.beforeUpload.bind(this);
    }

    normFile = (e) => {
        console.log('Upload event:', e);
        if(e.file.type!=='application/zip') return false;
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList; 
      }
    
      getInstallId = () => {
        const { dispatch, form } = this.props;
        form.validateFields(['chaincodeName','version','policy','peerName'], { force: true },(errors,values)=>{
          if(!errors){
            const formValue = form.getFieldsValue();
            console.log('form',formValue);
            dispatch({
              type: 'chart/getInstallId',
              payload: {
                chaincodeName: formValue.chaincodeName,
                version: formValue.version,
                policy: formValue.policy,
                peerName: formValue.peerName
              }
            })
          }   
        });
      }
    
    


      handleChange = (info) => {
          let fileList = info.fileList;
          fileList = fileList.slice(-1);
          this.setState({
            fileList
          })
      }

    render(){
        const { fileList } = this.state;
        const { chart, currentPeer } = this.props;
        const { chaincodeId } = chart;
        const {getFieldDecorator} = this.props.form;
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
            <Form>
                <FormItem
                    {...formItemLayout}
                    label="合约名称"
                    hasFeedback={true}
                >
                    {getFieldDecorator('chaincodeName',{
                        rules: [{
                        required: true, message: '请输入合约名'
                        },{
                        pattern: /^[a-z]([a-z0-9_]{5,24})$/ , message: '请输入以小写字母开头的6-25位数字、小写字母、下划线组成的字符'
                        }]
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="合约版本"
                    hasFeedback={true}
                >
                    {getFieldDecorator('version',{
                        rules: [{
                        required: true, message: '请输入版本号'
                        },{
                        pattern: /^([0-9]+\.?){1,10}$/g,message: '版本号只能是不超过10位的数字跟小数点的组合'
                        }]
                    })(
                        <Input />
                    )}
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
                <FormItem
                    {...formItemLayout}
                    label="合约语言"
                >
                    {getFieldDecorator('language',{
                        initialValue: 'go',
                        rules: [{
                        required: true
                        }]
                    })(
                        <Select>
                        <Option value="go">go</Option>
                        <Option value="java">java</Option>
                        <Option value="node">node</Option>
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="当前节点名称"
                >
                    {getFieldDecorator('peerName',{
                        initialValue: currentPeer ? currentPeer.name : '',
                        rules: [{
                        required: true, message: '请输入节点名称'
                        }]
                    })(
                        <Input disabled={true} />
                    )}
                </FormItem>
                
                <FormItem
                    {...formItemLayout}
                    label="获取绑定Id"
                >
                    <Row gutter={8}>
                    <Col span={12}>
                    {getFieldDecorator('chaincodeId',{
                        initialValue: chaincodeId ? chaincodeId : '',
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
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="上传合约"
                    extra="请先获取绑定Id且只能上传zip格式文件"
                >
                    {getFieldDecorator('file', {
                    valuePropName: 'file',
                    getValueFromEvent: this.normFile,
                    })(
                        <Upload  
                        disabled={chaincodeId?false:true} 
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
        )
    }
}

const WrapForm = Form.create()(InstallForm);
export default WrapForm;
