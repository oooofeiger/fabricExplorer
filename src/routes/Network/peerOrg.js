import React from 'react';
import { connect } from 'dva';
import {
    Row,
    Col,
    Icon,
    Tabs,
    Table,
    Radio,
    Button,
    Form,
    Input,
    Upload,
    Tooltip,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';

import org from '../../assets/组织.png';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const host = '192.168.32.116:8080';
@connect(({ network, loading }) => {
    return {
        network,
        loading: loading.effects['network/getConfigPeerOrg'],
      }
  } )
 class PeerOrgNetwork extends React.Component {
     constructor(props){
         super(props);
         this.state = {
            currentOrg:null,
            listSwitch: true,
            isGen: true,
            fileList: [],
            addSet: true,
         }

         this.changeGenerateCert = this.changeGenerateCert.bind(this);
         this.getCertId = this.getCertId.bind(this);
         this.beforeUpload = this.beforeUpload.bind(this);
         this.changeUpload = this.changeUpload.bind(this);
         this.handleSubmit = this.handleSubmit.bind(this);
         this.download = this.download.bind(this);
         this.delete = this.delete.bind(this);
         this.changeOper = this.changeOper.bind(this);
         
     }

     componentDidMount(){
         const {dispatch} = this.props;
         dispatch({
            type: 'network/getConfigPeerOrg'
        })
        dispatch({
            type: 'network/peerOrgGet'
        })
     }

     componentDidUpdate(prevProps, prevState){
        if(!this.props.sessionId) return;
        const { dispatch, network } = this.props;
        const { token } = this.props.sessionId;

        if(network.peerOrgConfig && this.state.listSwitch){
            this.setState({
                currentOrg: network.peerOrgConfig,
                listSwitch: false
            })
        }


     }

     changeGenerateCert = (e) => {
        const value = e.target.value;
        if(value === false){
            this.setState({
                isGen: false
            })
        }else{
            this.setState({
                isGen: true
            })
        }
     }


     getCertId = () => {
         const { dispatch, form } = this.props;
         form.validateFields(['name','mspId','caHost','generateCert','firstSet'],(err,values)=>{
             if(!err){
                dispatch({
                    type: 'network/getPeerOrgCertId',
                    payload: values
                })
             }
         })
         
     }

     beforeUpload = (file) => {
        console.log('file.type',file.type)
        // if(file.type !== 'application/zip'){
        //   message.error('只能上传zip格式的文件！');
        //   return false;
        // }
    }

    changeUpload = (info) => {
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        this.setState({
          fileList
        })                                                                                              
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { form, dispatch } = this.props;
        form.validateFields(['name','mspId','caHost','generateCert','firstSet'],(err,values)=>{
            if(!err){
                dispatch({
                    type: 'network/getPeerOrgCertId',
                    payload: values
                })
            }
        })
        
    }

    download = (name) => {
        const { dispatch, sessionId } = this.props;
        dispatch({
            type: 'network/peerOrgDownload',
            payload: {
                name,
                token: sessionId.token
            },
            
        })
    }

    delete = (name) => {
        const { dispatch, sessionId } = this.props;
        if(confirm('系统管理的所有peer节点信息、区块数据和交易数据将被一起删除，继续删除吗？')){
            dispatch({
                type: 'network/peerOrgDelete',
                payload: {
                    name,
                    token: sessionId.token
                },
                
            })
        }
        
    }

    changeOper = (e) => {
        const { form, network } = this.props;
        this.setState({
            addSet: e.target.value,
            isGen: true
        },()=>{
            form.resetFields();
        })
    }
    

    render(){
        const { currentOrg, fileList, addSet } = this.state;
        const { network, loading, sessionId } = this.props;
        const { peerOrgConfig, peerOrgCertId, peerOrgDownload, peerOrgDelete, peerOrgGet } = network;
        const { getFieldDecorator } = this.props.form;
        console.log('peerState',this.state,'peerProps',this.props);

        const detailInfo = (<div className={styles.peer}>组织 - {currentOrg?currentOrg.name:''}</div>);

        peerOrgConfig && (peerOrgConfig.key=0);
        const peerOrgConfigCol = [{
            title: '名称',
            dataIndex: 'name'
        },{
            title: '组织的mspId',
            dataIndex: 'mspId',
           
        },{
            title: 'CA节点访问地址',
            dataIndex: 'caHost'
        },{
            title: '下载证书',
            dataIndex: 'download',
            render: (text,record)=>{
                return (<a onClick={()=>this.download(record.name)} href="javascript:;">下载</a>)
            }
        }
        ,{
            title: '删除',
            dataIndex: 'delete',
            render: (text,record)=>{
                return (<a onClick={()=>this.delete(record.name)} href="javascript:;">删除</a>)
            }
        }];

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

          const cardLabel = (
            <span>
                caHost&nbsp;
                <Tooltip title="如果没有使用fabricCaHost可以为空">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
          )

        return (
            <PageHeaderLayout 
                detailInfo={detailInfo}
                logo={org}
            >
                <Tabs defaultActiveKey="1" className={styles.tabs}>
                    <TabPane className={styles.tabChildren} tab={<span><Icon type="file-text" />组织信息</span>} key="1">
                        <Row gutter={24}>
                            <Col md={24}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>组织配置信息</div>
                                    <Table loading={loading} pagination={{pageSize:10}} bordered dataSource={peerOrgConfig?[peerOrgConfig]:null} columns={peerOrgConfigCol} />
                                </div>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane className={styles.tabChildren} tab={<span><Icon type="setting" />配置组织</span>} key="2">
                        <Row gutter={24}>
                            <Col md={24}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>组织配置信息</div>
                                    <Form onSubmit={this.handleSubmit}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="选择操作"
                                        >
                                            {
                                                getFieldDecorator('firstSet',{
                                                    initialValue: addSet
                                                })(
                                                    <RadioGroup onChange={this.changeOper}>
                                                        <Radio value={true}>新增配置</Radio>
                                                        <Radio value={false}>修改配置</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="组织名称"
                                        >
                                            {
                                                getFieldDecorator('name',{
                                                    initialValue: !addSet&&peerOrgGet?peerOrgGet.name:'',
                                                    rules: [{
                                                        required: true, message: '请输入组织名称！'
                                                    }]
                                                })(
                                                    <Input/>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="组织MSP"
                                        >
                                            {
                                                getFieldDecorator('mspId',{
                                                    initialValue: !addSet&&peerOrgGet?peerOrgGet.mspId:'',
                                                    rules: [{
                                                        required: true, message: '请输入组织所属组织的mspId！'
                                                    }]
                                                })(
                                                    <Input placeholder='请输入组织所属组织的mspId' />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label={cardLabel}
                                        >
                                            {
                                                getFieldDecorator('caHost',{
                                                    initialValue: !addSet&&peerOrgGet?peerOrgGet.caHost:'',
                                                    rules: [{
                                                        pattern:/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]):([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/, message:'输入的地址不正确！'
                                                    }]
                                                })(
                                                    <Input placeholder="请输入绑定的fabric节点访问地址！" />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="是否生成新证书"
                                        >
                                            {
                                                getFieldDecorator('generateCert',{
                                                    initialValue: !addSet&&peerOrgGet?peerOrgGet.generateCert:true,
                                                })(
                                                    <RadioGroup disabled={!addSet} onChange={this.changeGenerateCert}>
                                                        <Radio value={true}>是</Radio>
                                                        <Radio value={false}>否</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            wrapperCol={{ span: 8, offset: 8 }}
                                            style={{display:this.state.isGen?'block':'none'}}
                                            >
                                            <Button type="primary"  block htmlType="submit">确定</Button>
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="获取上传Id"
                                            style={{display:this.state.isGen?'none':'block'}}
                                        >
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                {getFieldDecorator('certId',{
                                                    initialValue: peerOrgCertId ? peerOrgCertId.certId : '',
                                                    rules: [{
                                                    required: true, message: 'Id不能为空'
                                                    }]
                                                })(
                                                    <Input disabled={true} />
                                                )}
                                                </Col>
                                                <Col span={12}>
                                                    <Button onClick={this.getCertId} type="primary">获取</Button>
                                                </Col>
                                            </Row>
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="上传证书"
                                            extra="请先获取上传Id"
                                            style={{display:this.state.isGen?'none':'block'}}
                                        >
                                            {getFieldDecorator('cert', {
                                            valuePropName: 'cert',
                                            getValueFromEvent: this.normFile,
                                            rules:[{required: true}]
                                            })(
                                                <Upload  
                                                disabled={peerOrgCertId?false:true} 
                                                name="file" 
                                                fileList={fileList}
                                                action={`http://${host}/network/peerOrg/cert/upload/${peerOrgCertId?peerOrgCertId.certId:''}`}
                                                beforeUpload={this.beforeUpload}
                                                onChange={this.changeUpload}
                                                >
                                                    <Button>
                                                        <Icon type="upload" /> 点击上传
                                                    </Button>
                                                </Upload>
                                            )}
                                        </FormItem>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </PageHeaderLayout>
        )
    }
 }

 const WrapPeerOrgNetwork = Form.create({})(PeerOrgNetwork);
export default WrapPeerOrgNetwork;