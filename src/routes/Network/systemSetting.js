import React from 'react';
import { connect } from 'dva';
import {
    Row,
    Col,
    Radio,
    Switch,
    Button,
    Form,
    Input,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';

import setting from '../../assets/设置.png';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ network }) => {
    return {
        network,
      }
} )
class SystemSetting extends React.Component{
    constructor(props){
        super(props);
        this.state={
            edit: false,
        }
        this.changeSwitch = this.changeSwitch.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        const { dispatch } = this.props;
        dispatch({
            type:'network/getSystemConfigure'
        })
    }

    componentWillReceiveProps(nextProps){
        const nextNetwork = nextProps.network;
        const thisNetwork = this.props.network;
        const nextSetSystem = nextNetwork.setSystem;
        const thisSetSystem = thisNetwork.setSystem;
        if(nextSetSystem && nextSetSystem.success){
            if(nextSetSystem.time !== thisSetSystem.time){
                this.setState({
                    edit: false
                })
            }
        }
    }

    changeSwitch = (e) => {
        const { form } = this.props;
        if(e === true){
            this.setState({
                edit: true
            },()=>{
                form.validateFields({force: true})
            })
        }else{
            this.setState({
                edit: false
            },()=>{
                form.validateFields({force: true})
            })
        }
    }

    handleSubmit = () => {
        const { form, dispatch } = this.props;
        form.validateFields((err,values)=>{
            if(!err){
                console.log(values);
                dispatch({
                    type: 'network/setSystem',
                    payload: values
                })
            }
        })
    }

    render(){
        const { edit } = this.state;
        const { network, form } = this.props;
        const { systemConfigure } = network;
        const { getFieldDecorator } = form;
        console.log('systemState',this.state,'systemProps',this.props);

        const detailInfo = (<div className={styles.peer}>系统设置</div>);

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
            <PageHeaderLayout 
                detailInfo={detailInfo}
                logo={setting}
            >
                <Row gutter={24}>
                    <Col md={24}>
                        <div className={styles.blockListTable}>
                            {/* <div className={styles.blockTitle}>系统设置</div> */}
                            <Form onSubmit={this.handleSubmit} style={{marginTop:'25px'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="编辑"
                                >
                                    {getFieldDecorator('switch', {
                                         initialValue: edit,
                                        })(
                                            <Switch checked={edit} onChange={this.changeSwitch} />
                                        )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="proposal请求超时时间"
                                >
                                {
                                    getFieldDecorator('proposalWaitTime',{
                                        initialValue: systemConfigure?systemConfigure.proposalWaitTime:'',
                                        rules:[{
                                            required: edit, message: '不能为空！'
                                        },{
                                            pattern:/^([0]|[1-9][0-9])*$/, message: '请输入正确的整数'
                                        }]
                                    })(
                                        <Input disabled={!edit} />
                                    )
                                }  
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="联盟名称"
                                >
                                {
                                    getFieldDecorator('consortium',{
                                        initialValue: systemConfigure?systemConfigure.consortium:'SampleConsortium',
                                        rules:[{
                                            required: edit, message: '不能为空！'
                                        }]
                                    })(
                                        <Input disabled={!edit} />
                                    )
                                }  
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="系统通道名称"
                                >
                                {
                                    getFieldDecorator('sysChannel',{
                                        initialValue: systemConfigure?systemConfigure.sysChannel:'tschain',
                                        rules:[{
                                            required: edit, message: '不能为空'
                                        }]
                                    })(
                                        <Input disabled={!edit} />
                                    )
                                }  
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="是否使用TLS"
                                >
                                {
                                    getFieldDecorator('tlsEnable',{
                                        initialValue: systemConfigure?systemConfigure.tlsEnable:'',
                                        rules:[{
                                            required: edit, message: '请选择！'
                                        }]
                                    })(
                                        <RadioGroup disabled={!edit} onChange={this.changeGenerateCert}>
                                            <Radio value={true}>是</Radio>
                                            <Radio value={false}>否</Radio>
                                        </RadioGroup>
                                    )
                                }  
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="事件监听连接超时时间"
                                >
                                {
                                    getFieldDecorator('eventWaitTime',{
                                        initialValue: systemConfigure?systemConfigure.eventWaitTIme:'',
                                        rules:[{
                                            required: edit, message: '不能为空！'
                                        },{
                                            pattern:/^([0]|[1-9][0-9])*$/, message: '请输入正确的整数'
                                        }]
                                    })(
                                        <Input disabled={!edit} />
                                    )
                                }  
                                </FormItem>
                                <FormItem
                                    wrapperCol={{ span: 8, offset: 8 }}
                                    style={{display:edit?'block':'none'}}
                                    >
                                    <Button type="primary"  block htmlType="submit">确定</Button>
                                </FormItem>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </PageHeaderLayout>
        )
    }
}
const WrapSystemSetting = Form.create()(SystemSetting);
export default WrapSystemSetting;

