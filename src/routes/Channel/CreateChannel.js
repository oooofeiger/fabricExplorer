import React from 'react';
import { connect } from 'dva';
import { Button, Input, Form, Select } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ network }) => {
  return {
    network,
  };
})
class CreateChannel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      creating: false,
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'network/getDeployPeer',
    });
  }

  componentDidUpdate(prevProps) {
    const prevCreateChannel = prevProps.network.createChannel;
    const { network } = this.props;
    const { createChannel } = network;
    if (!prevCreateChannel && createChannel) {
      this.props.updateList();
      this.setState({
        creating: false,
      });
    } else if (
      prevCreateChannel &&
      createChannel &&
      createChannel.time !== prevCreateChannel.time
    ) {
      this.props.updateList();
      this.setState({
        creating: false,
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        dispatch({
          type: 'network/createChannel',
          payload: values,
        });
        this.setState({
          creating: true,
        });
      }
    });
  };
  render() {
    const { creating } = this.state;
    const { form, network } = this.props;
    const { deployPeer } = network;
    const { getFieldDecorator } = form;
    console.log('createChannel', this.props);
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
          <FormItem {...formItemLayout} label="通道名称">
            {getFieldDecorator('channelName', {
              rules: [
                {
                  required: true,
                  message: '通道名称不能为空！',
                },{
                    pattern: /^[^_]+$/g,message:'通道名中不能存在"_"字符'
                }
              ],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="选择默认peer">
            {getFieldDecorator('peerName', {})(
              <Select mode="multiple" placeholder="选择默认加入通道的peer">
                {deployPeer &&
                  deployPeer.map((item, i) => {
                    return (
                      <Option key={i} value={item.peerName}>
                        {item.peerName}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem wrapperCol={{ span: 8, offset: 8 }}>
            <Button type="primary" disabled={creating} block htmlType="submit">
              确定
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
const WrapCreateChannel = Form.create()(CreateChannel);
export default WrapCreateChannel;
