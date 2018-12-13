import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, Radio, Select, Button, Form, Input, Tooltip } from 'antd';
import { ChartCard } from 'components/Charts';
import PolicyModal from 'components/Policy';
import { clearSpacing } from '../../utils/utils';

const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ chart }) => {
  return {
    chart,
  };
})
class Instantiate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      channelSwitch: true,
      visibleModal: false,
      button: '实例化',
      working: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.selectChaincode = this.selectChaincode.bind(this);
    this.showPolicyModal = this.showPolicyModal.bind(this);
    this.getPolicyData = this.getPolicyData.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.sessionId) return;
    const prevChart = prevProps.chart;
    const prevInstantiate = prevChart.instantiate;
    const prevCurrentPeer = prevProps.currentPeer;
    const prevUpgrade = prevChart.upgrade;
    const { chart, updateTable, disableButon, currentPeer, form } = this.props;
    const { instantiate, upgrade } = chart;

    if (!prevCurrentPeer && currentPeer) {
      form.setFieldsValue({
        channelName: '',
        chaincodeName: '',
        version: '',
        peerName: currentPeer.name,
      });
      this.setState({
        working: false,
      });
    } else if (prevCurrentPeer && currentPeer && prevCurrentPeer.name !== currentPeer.name) {
      form.setFieldsValue({
        channelName: '',
        chaincodeName: '',
        version: '',
        peerName: currentPeer.name,
      });
      this.setState({
        working: false,
      });
    }

    if (!prevInstantiate && instantiate) {
      updateTable();
      disableButon(false);
      this.setState({
        working: false,
      });
    } else if (instantiate && prevInstantiate && instantiate.time !== prevInstantiate.time) {
      //实例化合约时更新表格
      updateTable();
      this.setState({
        working: false,
      });
    }

    if (!prevUpgrade && upgrade) {
      updateTable();
      this.setState({
        working: false,
      });
    } else if (upgrade && prevUpgrade && upgrade.time !== prevUpgrade.time) {
      //升级合约时更新表格
      updateTable();
      this.setState({
        working: false,
      });
    }
  }

  //获取已选择的合约版本号
  selectChaincode = key => {
    const { noPurepeerChaincodeList } = this.state;
    // const chaincodeList = this.props.chart.installedChaincodeList;
    let versionList = [];
    noPurepeerChaincodeList &&
      noPurepeerChaincodeList.map((item, i) => {
        if (item.chaincodeName === key) {
          versionList.push(item.version);
        }
      });

    this.setState({
      versionList: versionList,
    });
  };

  showPolicyModal = (function(param) {
    let count = 1;
    const that = param;
    return () => {
      that.setState({
        visibleModal: true,
        count: count++,
      });
    };
  })(this);

  getPolicyData(data) {
    this.setState({
      policy: data,
    });
  }

  changeOption = e => {
    const value = e.target.value;
    if (value === 'instantiate') {
      this.setState({
        button: '实例化',
      });
    } else {
      this.setState({
        button: '升级',
      });
    }
  };

  changeChannel = key => {
    const { dispatch, chart, sessionId } = this.props;
    const { peerChaincodeList } = chart;
    const { token } = sessionId;
    console.log(key);
    dispatch({
      type: 'chart/getOrgList',
      payload: {
        channelsName: [key],
        token: token,
      },
    });
    let purePeerChaincodeList = [];
    let noPurepeerChaincodeList = [];
    peerChaincodeList &&
      peerChaincodeList.map(item => {
        if (item.channelName !== key) {
          noPurepeerChaincodeList.push(item);
          let flag = false;
          purePeerChaincodeList.forEach(ele => {
            if (ele.chaincodeName === item.chaincodeName) {
              flag = true;
            }
          });
          if (!flag) {
            purePeerChaincodeList.push(item);
          }
        }
      });
    this.setState({
      purePeerChaincodeList,
      noPurepeerChaincodeList,
    });
  };

  validateArgs = (rule, value, callback) => {
    if (value.indexOf('，') > -1) {
      callback('请使用英文半角逗号！');
    } else {
      callback();
    }
  };

  //实例化合约
  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, disableButon } = this.props;
    const that = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.policy === 4) {
          values.policy = that.state.policy;
        } else {
          values.policy = { type: values.policy };
        }
        if (values.args.indexOf(',') > -1) {
          values.args = values.args.split(',');
        } else if (/^\s*$/.test(values.args)) {
          values.args = [];
        } else {
          values.args = [values.args];
        }

        console.log('安装', values);
        if (values.option === 'instantiate') {
          dispatch({
            type: 'chart/chaincodeInstantiate',
            payload: clearSpacing(values),
          });
        } else {
          dispatch({
            type: 'chart/chaincodeUpgrade',
            payload: clearSpacing(values),
          });
        }
        disableButon(true);
        this.setState({
          working: true,
        });
      }
    });
  };

  render() {
    const { versionList, working, purePeerChaincodeList } = this.state;
    const { chart, currentPeer, sessionId } = this.props;
    const { peerChannelList, orgList, installedChaincodeList } = chart;
    const { getFieldDecorator } = this.props.form;

    const token = sessionId ? sessionId.token : '';

    //当前peer节点安装的所有合约（去重）
    // const purePeerChaincodeList = (function(peerChaincodeList){
    //     if(!peerChaincodeList) return;
    //     let arr = [];
    //     peerChaincodeList.map((item,i)=>{
    //     if(arr.indexOf(item.chaincodeName) < 0){
    //         arr.push(item.chaincodeName)
    //     }
    //     })
    //     console.log('purePeerChaincodeList',arr)
    //     return arr;
    // })(installedChaincodeList);

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

    //参数提示
    const labelArgs = (
      <span>
        初始化参数&nbsp;
        <Tooltip title="形如a,b,c形式的参数">
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>
    );
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="选择操作">
          {getFieldDecorator('option', {
            initialValue: 'instantiate',
          })(
            <RadioGroup onChange={this.changeOption}>
              <Radio value="instantiate">实例化合约</Radio>
              <Radio value="update">升级合约</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="通道" hasFeedback={true}>
          {getFieldDecorator('channelName', {
            rules: [
              {
                required: true,
                message: '请选择一个通道',
              },
            ],
          })(
            <Select onChange={this.changeChannel} placeholder="选择通道">
              {peerChannelList &&
                peerChannelList.map((item, i) => {
                  return (
                    <Option key={i} value={item.channelName}>
                      {item.channelName}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="合约名称" hasFeedback={true}>
          {getFieldDecorator('chaincodeName', {
            rules: [
              {
                required: true,
                message: '请选择一个合约',
              },
            ],
          })(
            <Select onChange={this.selectChaincode} placeholder="选择合约">
              {purePeerChaincodeList &&
                purePeerChaincodeList.map((item, i) => {
                  return (
                    <Option key={i} value={item.chaincodeName}>
                      {item.chaincodeName}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>

        <FormItem {...formItemLayout} label="合约版本" hasFeedback={true}>
          {getFieldDecorator('version', {
            rules: [
              {
                required: true,
                message: '请选择版本号',
              },
            ],
          })(
            <Select placeholder="选择版本号">
              {versionList &&
                versionList.map((item, i) => {
                  return (
                    <Option key={i} value={item}>
                      {item}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="初始化方法" hasFeedback={true}>
          {getFieldDecorator('function', {
            initialValue: 'Init',
            rules: [
              {
                required: true,
                message: '函数名不能为空！',
              },
            ],
          })(<Input placeholder="请输入函数名" />)}
        </FormItem>
        <FormItem {...formItemLayout} label={labelArgs} hasFeedback={true}>
          {getFieldDecorator('args', {
            initialValue: '',
            rules: [
              {
                validator: this.validateArgs,
              },
            ],
          })(<Input placeholder="a,b,c" />)}
        </FormItem>

        <FormItem {...formItemLayout} label="背书策略">
          {getFieldDecorator('policy', {
            initialValue: 'onlyOneself',
            // rules: [{
            //   required: true, message: '请输入策略'
            // },{
            //   validator: this.checkChaincodeVersion
            // }]
          })(
            <RadioGroup onChange={this.changeRadio}>
              <Radio value={'onlyOneself'}>本组织签名</Radio>
              <Radio value={'mostOfChannel'}>通道内大多数组织成员签名</Radio>
              <Radio value={'allOfChannel'}>通道内全部组织签名</Radio>
              <Radio value={4} onClick={this.showPolicyModal}>
                <span style={{ color: '#1890ff', cursor: 'pointer' }}>自定义</span>
              </Radio>
            </RadioGroup>
          )}
          <PolicyModal
            getPolicyData={this.getPolicyData}
            token={token ? token : ''}
            orgList={orgList}
            count={this.state.count}
            visible={this.state.visibleModal}
          />
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
        <FormItem wrapperCol={{ span: 8, offset: 8 }}>
          <Button type="primary" disabled={working} block htmlType="submit">
            {this.state.button}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const InstantiateForm = Form.create()(Instantiate);
export default InstantiateForm;
