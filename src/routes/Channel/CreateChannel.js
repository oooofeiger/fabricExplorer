import React from 'react';
import { connect } from 'dva';
import {
  Button,
  Input,
  Form,
} from 'antd';

const FormItem = Form.Item;

@connect(({ network }) => {
    return {
        network
        }
} )
class CreateChannel extends React.Component{

    handleSubmit = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err,values)=>{
            if(!err){
                console.log(values);
                dispatch({
                    type:'network/createChannel',
                    payload: values
                })
            }
        })
    }
    render(){
        const { form } = this.props;
        const {getFieldDecorator} = form;

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
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="通道名称"
                    >
                        {
                            getFieldDecorator('channelName',{
                                rules:[{
                                    required: true, message:'通道名称不能为空！'
                                }]
                            })(
                                <Input />
                            )
                        }
                    </FormItem>
                    <FormItem
                        wrapperCol={{ span: 8, offset: 8 }}
                        >
                        <Button type="primary"  block htmlType="submit">确定</Button>
                    </FormItem>
                </Form>
            </div>
            
        )
    }
}
const WrapCreateChannel = Form.create()(CreateChannel);
export default WrapCreateChannel;