import React from 'react';
import {connect} from 'dva';
import {
    Form,
    Radio,
    Button,
    Modal,
    Icon,
    Input,
    Select,
    Card,
    Tooltip,
} from 'antd';

import styles from './index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

let uuid = 1;
let childId = 1;

@connect(({ chart })=>({chart}))
class Policy extends React.Component{
    constructor(props){
        super(props);
        this.state={
          visible:false,
          childKeys: [0],
          policyStatus: {}
        };
    }


    componentWillReceiveProps(nextProps){
      console.log('nextProps',nextProps,'thisProps',this.props)
      if(nextProps.count !== this.props.count){
        this.setState({
          visible: true
        })
      }
      
    }

    handleCancel = () => {
      this.setState({
          visible: false,
      })
    }

    handleOk = () => {
      const { getPolicyData } = this.props;
      const that = this;
      this.props.form.validateFields((err, values) => {
        console.log('11111111111',err)
        if (!err) {
          console.log('Received values of form: ', values);
          let policy = {type:'custom'};  //最终的策略数据集合
          const parentPolicyArr = values.keys;  //策略数量
          if(values['policyNum'] > parentPolicyArr.length){
            that.setState({
              policyStatus: {
                policy:{
                  status: 'error',
                  help: '设置的策略数量应该不少于配置的策略数量！'
                }
              }
            })
            return false;
          }else{
            that.setState({
              policyStatus: {
                policy:{
                  status: 'success',
                }
              }
            })
          }

          policy.policy = []; //策略值
          policy.policyNum = values['policyNum'];
          let flag = true;
          parentPolicyArr.map((item,i)=>{
            let childPolicyData = {};    //子策略数据集合
            const childPolicyArr = values[`policy${item}`];  
            childPolicyData.policyNum = values[`policyNum${item}`];

            if(values[`policyNum${item}`] > childPolicyArr.length){
              that.setState({
                policyStatus: {
                  [`policy${item}`]:{
                    status: 'error',
                    help: '设置的策略数量应该不少于配置的策略数量！'
                  }
                }
              })
              flag = false;
              return false;
            }else{
              that.setState({
                policyStatus: {
                  [`policy${item}`]:{
                    status: 'success',
                  }
                }
              })
            }

            childPolicyData.policy = [];
            childPolicyArr.map((child,k)=>{
              let childPolicy = {};
              childPolicy.orgName = values[`policy${item}-org${child}`];
              childPolicy.signed = values[`policy${item}-signed${child}`];
              childPolicy.policyNum = -1;
              childPolicyData.policy.push(childPolicy)
            })
            if(!flag) return false;
            policy.policy.push(childPolicyData)
          })
          if(!flag) return false;
          getPolicyData(policy) //传给父组件
          that.setState({
            visible:false,
            policyData: policy
          })
        }else{
          return false;
        }      
      });

    }

    remove = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
          return;
        }
    
        // can use data-binding to set
        form.setFieldsValue({
          keys: keys.filter(key => key !== k),
        });
      }
    
      add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(uuid);
        uuid++;
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
          keys: nextKeys,
        });
      }

      addChildPolicy = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue(`policy${k}`);
        const nextKeys = keys.concat(childId);
        const a = `policy${k}`;
        form.setFieldsValue({
          [a]: nextKeys,
        });
        childId++;
        console.log('',form.getFieldValue(`policy${k}`))
      }

      removeChildPolicy = (k,item) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue(`policy${k}`);
        // We need at least one passenger
        if (keys.length === 1) {
          return;
        }
    
        // can use data-binding to set
        form.setFieldsValue({
          [`policy${k}`]: keys.filter(key => key !== item),
        });
      }
    

      checkPolicyNum = (rule,value,callback) => {
        const { form } = this.props;
        const policyArr = form.getFieldValue('keys');
        if(value && value > policyArr.length){
          callback('设置的策略数量应该不少于配置的策略数量！')
        }else{
          callback();
        }
      }

      checkChildPolicyNum = (k,rule,value,callback) => {
        const { form } = this.props;
        const policyArr = form.getFieldValue(`policy${k}`);
        if(value && value > policyArr.length){
          callback('设置的策略数量应该不少于配置的策略数量！')
        }else{
          callback();
        }
      }



    render(){
        console.log('policy.props',this.props);
        console.log('policy.state',this.state);
        const { policyStatus } = this.state;
        const { orgList, chart } = this.props;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        
        // channelOrgList && (function(that,channelOrgList)=>{
        //   let orgList = [];
        //   channelOrgList.map((itme,i)=>{
        //     item.orgsName.map((org,k)=>{
        //       orgList.push(`${org}-${itme.channelName}`)
        //     })
        //   })
        //   that.setState({
        //     orgList: orgList
        //   })
        // })(this,channelOrgList)

        const formItemLayout = {
          labelCol: {
            xs: { span: 4 },
            sm: { span: 4 },
          },
          wrapperCol: {
            xs: { span: 20 },
            sm: { span: 20 },
          },
        };
        const formItemLayoutPolicyNum = {
          labelCol: {
            xs: { span: 4 },
            sm: { span: 4 },
          },
          wrapperCol: {
            xs: { span: 10 },
            sm: { span: 10 },
          },
        };
        const formItemLayoutChildPolicyNum = {
          labelCol: {
            xs: { span: 14 },
            sm: { span: 14 },
          },
          wrapperCol: {
            xs: { span: 10 },
            sm: { span: 10 },
          },
        };
        
        const cardLabel = (
          <span>
              子策略数量&nbsp;
              <Tooltip title="满足条件的最少策略数量">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
        )
        const CardTitle = ({k}) => {
          const list = Number(k);
          return (
          <div className={styles.cardTitle}>
            <span>{`策略${k}`}</span>
            <FormItem 
            label={cardLabel} 
            {...formItemLayoutChildPolicyNum} 
            hasFeedback 
            validateStatus={policyStatus?policyStatus[`policy${list}`]?policyStatus[`policy${list}`]['status']:'':''}
            help={policyStatus?policyStatus[`policy${list}`]?policyStatus[`policy${list}`]['help']:'':''}
            style={{display:'inline-block'}}>
              {getFieldDecorator(`policyNum${k}`,{
                rules:[{
                  require: true,message:"策略数量不能为空！"
                }]
              })(
                <Input />
              )}
            </FormItem>
          </div>
        )}

        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        
        const formItems = keys.map((k, index) => {
          getFieldDecorator(`policy${k}`, { initialValue: [0] });
          const childKeys = getFieldValue(`policy${k}`);
          const titleNum = +index+1;
          return (
            <Card
              key={k}
              title={<CardTitle k={titleNum} />}
              extra={<a onClick={()=>this.remove(k)} href="javascript:;">删除</a>}
              className={styles.card}
            >
              {
                
                childKeys.map((itme, i)=>{
                  return (
                    <div key={i}>
                      <FormItem {...formItemLayout} className={styles.orgList} label="组织">
                        {getFieldDecorator(`policy${k}-org${itme}`, {
                          validateTrigger: [ 'onBlur','onChange'],
                          rules: [{
                            require: true, message: '请选择一个组织！'
                          }],
                        })(
                        <Select placeholder="选择组织">
                          {
                            orgList && orgList.channelOrgList.map((item,i)=>{
                              return item.orgsName.map((org,k)=>{
                                return <Option key={i+k} value={`${org}`}>{`${org}`}</Option>
                              })
                              
                            })
                          }
                        </Select>
                        )}
                      </FormItem>
                      <FormItem
                        label="签名策略"
                        className={styles.signed}
                      >
                      {getFieldDecorator(`policy${k}-signed${itme}`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        initialValue: "admin",
                      })(
                        <RadioGroup>
                          <Radio value="admin">管理员</Radio>
                          <Radio value="member">成员</Radio>
                        </RadioGroup>
                      )}

                      {keys.length > 1 ? (
                          <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            disabled={keys.length === 1}
                            onClick={() => this.removeChildPolicy(k,itme)}
                          />
                        ) : null}
                    </FormItem>
                    </div>
                  )
                })
              }
              
            <FormItem  style={{marginBottom:'0',margin:'0 auto',textAlign:'center'}}>
              <Button type="primary" onClick={this.addChildPolicy.bind(this,k)}>
                  <Icon type="plus" /> 新增子策略
              </Button>
            </FormItem>
          </Card>
          );
        });

        const labelPolicyNum = (
            <span>
              策略数量&nbsp;
              <Tooltip title="满足条件的最少策略数量">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
        )

        return (
            <Modal
            visible={this.state.visible}
            width="50%"
            title="策略配置"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
                <Button key="back" onClick={this.handleCancel}>返回</Button>,
                <Button key="ok" type="primary" onClick={this.handleOk}>
                确定
                </Button>,
            ]}
            className={styles.modal}
            >
                <Form className={styles.form}>
                    {/* <FormItem {...formItemLayout} className={styles.channelName} label="通道">
                      {getFieldDecorator(`channelName`, {
                        validateTrigger: [ 'onBlur','onChange'],                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                        rules: [{
                          require: true, message: '请选择一个通道！'
                        }],
                      })(
                        <Select placeholder="选择通道" onChange={this.selectChannel}>
                          {
                            channelList && channelList.map((item,i)=>{
                              return <Option key={i} value={item.channelName}>{item.channelName}</Option>
                            })
                          }
                        </Select>
                      )}
                    </FormItem> */}
                    <FormItem 
                      label={labelPolicyNum} 
                      className={styles.policyNum} 
                      {...formItemLayoutPolicyNum}
                      hasFeedback 
                      help={policyStatus?policyStatus['policy']?policyStatus['policy']['help']:'':''}
                      validateStatus={policyStatus?policyStatus['policy']?policyStatus['policy']['status']:'':''}
                    >
                      {getFieldDecorator(`policyNum`,{
                        rules: [{
                          require: true, message: '请输入策略数量！'
                        }]
                      })(
                        <Input />
                      )}
                    </FormItem>

                    {formItems}
                    <FormItem  style={{width:'100%',marginTop:'20px'}}>
                    <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
                        <Icon type="plus" /> 新增策略
                    </Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

const WrapModal = Form.create()(Policy);
export default WrapModal;


