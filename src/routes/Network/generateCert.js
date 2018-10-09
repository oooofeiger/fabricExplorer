import React from 'react';
import { connect } from 'dva';
import {
    Radio,
    Button,
    Form,
    Input,
} from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ network }) => {
    return {
        network,
      }
  } )
  class GenerateCert extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { dispatch, form, type} = this.props;
        form.validateFields((err,values)=>{
            if(!err){
                values.name = values.name_;
                if(type === 'orderer'){
                    dispatch({
                        type: 'network/generateOrdererCert',
                        payload: values
                    })
                }else{
                    dispatch({
                        type: 'network/generatePeerCert',
                        payload: values
                    })
                }
                
            }
        })
    }

    checkName = (rule, value, callback) => {
        const { data } = this.props;
        data.map((item,i)=>{
            if(item.peerName === value){
                callback('节点已经存在！')
            }else{
                callback()
            }
        })
    }

    render(){
        const { network, form, type } = this.props;
        const { generateOrdererCert } = network;
        const { getFieldDecorator } = form;

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
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    hasFeedback={true}
                    label={type && type==='peer'?"peer节点名称":"orderer节点名称"}
                >
                    {
                        getFieldDecorator('name_',{
                            rules: [{
                                required: true, message: '请输入节点名称！'
                            },{
                                validator: this.checkName
                            }]
                        })(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="是否下载证书"
                >
                    {
                        getFieldDecorator('download',{
                            initialValue: true
                        })(
                            <RadioGroup>
                                <Radio value={true}>是</Radio>
                                <Radio value={false}>否</Radio>
                            </RadioGroup>
                        )
                    }
                </FormItem>
                <FormItem
                    wrapperCol={{ span: 8, offset: 8 }}
                >
                    <Button type="primary"  block htmlType="submit">确定</Button>
                </FormItem>
            </Form>
        )
    }
  }

  const WrapGenerateCert = Form.create()(GenerateCert);
  export default WrapGenerateCert;