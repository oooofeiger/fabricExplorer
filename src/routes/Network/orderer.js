import React from 'react';
import { connect } from 'dva';
import {
    Row,
    Col,
    Icon,
    Tabs,
    Table,
    Radio,
    Select,
    Menu,
    Dropdown,
    Button,
    Form,
    Input,
    Upload,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import WrapGenerateCert from './generateCert';
import styles from './index.less';

import peer from '../../assets/节点.png';

const { TabPane } = Tabs;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const host = '192.168.32.116:8080';
@connect(({ network, loading }) => {
    return {
        network,
        loading: loading.effects['network/getConfigOrderer'],
      }
  } )
 class OrdererNetwork extends React.Component {
     constructor(props){
         super(props);
         this.state = {
            currentOrderer:null,
            listSwitch: true,
            certId:null,
            shouldCheck: true,
            disabled: false,
            certTypeFlag: true,
            tlsFileList:[],
            addSet: true,
            ordererSwitch: true,
         }
         this.changeDeployed = this.changeDeployed.bind(this);
         this.getCertId = this.getCertId.bind(this);
         this.beforeUpload = this.beforeUpload.bind(this);
         this.changeUploadTls = this.changeUploadTls.bind(this);
         this.togglePeer = this.togglePeer.bind(this);
         this.downloadCert = this.downloadCert.bind(this);
         this.deleteOrderer = this.deleteOrderer.bind(this);
         this.changeUseTls = this.changeUseTls.bind(this);
         this.changeCertType = this.changeCertType.bind(this);
         this.checkName = this.checkName.bind(this);
         this.changeOper = this.changeOper.bind(this);
         this.handleSubmit = this.handleSubmit.bind(this);
     }

     componentDidMount(){
        const {dispatch} = this.props;
        dispatch({
            type: 'network/getConfigOrderer'
        })
        dispatch({
            type: 'network/ordererImageVersion'
        })
     }

     componentDidUpdate(prevProps, prevState){
        if(!this.props.sessionId) return;
        const { dispatch, network } = this.props;
        const { token } = this.props.sessionId;
        if(network.ordererConfig && this.state.listSwitch){
            this.setState({
                currentOrderer: network.ordererConfig[0],
                listSwitch: false
            })
        }
        if(this.state.currentOrderer && this.state.ordererSwitch){
            dispatch({
                type: 'network/ordererGet',
                payload:{
                    ordererName: this.state.currentOrderer.ordererName,
                }
            })
            this.setState({
                ordererSwitch:false
            })
        }


     }

     changeDeployed = (e) => {
        console.log('value',value);
        const value = e.target.value;
        if(value === false){
            this.setState({
                shouldCheck: false,
                disabled: true
            },() => {
                const { form } = this.props;
                form.resetFields(['ip','port','hostName']);
                form.setFieldsValue({deployed:false});
                form.validateFields(['ip','port','hostName'],{force: true});
            })
        }else{
            this.setState({
                shouldCheck: true,
                disabled: false
            })
        }
     }


     getCertId = () => {
         const { dispatch, form } = this.props;
         form.validateFields(['name','orgName','deployed','ip','port','hostName','useTls','certType','imageVersion','containerName'],(err,values)=>{
             if(!err){
                dispatch({
                    type: 'network/getOrdererCertId',
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

    changeUploadTls = (info) => {
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        this.setState({
          fileList
        })                                                                                              
    }

    togglePeer = ({key}) => {
        console.log(key)
        const { ordererConfig } = this.props.network;
        ordererConfig.map((item,i)=>{
            if(item.ordererName === key){
                this.setState({
                    currentOrderer: item,
                })
            }
        })
    }

    downloadCert = (name) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'network/ordererDownload',
            payload:{name}
        })
    }

    deleteOrderer = (ordererName) => {
        const { dispatch } = this.props;
        if(confirm('确定删除吗？')){
            dispatch({
                type: 'network/ordererDelete',
                payload:{ordererName}
            })
        }
        
    }

    changeUseTls = (e) => {
        const { form } = this.props;
        const value = e.target.value;
        console.log(value)
        if(value === true){
            this.setState({
                certTypeFlag: true,
                certType: 'all'
            },()=>{
                form.setFieldsValue({certType:'all'})
                form.validateFields(['certType'],{force:true})
            })
        }else if(value === false){
            this.setState({
                certTypeFlag: false,
                certType: 'all'
            },()=>{
                form.setFieldsValue({certType:'all'})
                form.validateFields(['certType'],{force:true})
            })
        }
    }

    changeCertType = (e) => {
        const value = e.target.value;
        if(value === 'tls'){
            this.setState({
                certType: 'tls'
            })
        }else if(value === 'all'){
            this.setState({
                certType: 'all'
            })
        }
        
    }

    checkName = (rule, value, callback) => {
        const  { ordererConfig } = this.props.network;
        ordererConfig && ordererConfig.map((item,i)=>{
            if(value === item.ordererName){
                callback('节点已经存在！')
            }else{
                callback();
            }
        })
    }

    changeOper = (e) => {
        const { form, network } = this.props;
        this.setState({
            addSet: e.target.value,
            certTypeFlag: network.ordererGet.useTls,
            certType: network.ordererGet.certType,
            shouldCheck: network.ordererGet.deployed,
            disabled: !network.ordererGet.deployed
        },()=>{
            form.resetFields();
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { form, dispatch } = this.props;
        form.validateFields(['name','ip','port','hostName','firstSet','useTls','deployed','orgName','certType','imageVersion','containerName'],(err,values)=>{
            if(!err){
                dispatch({
                    type: 'network/getOrdererCertId',
                    payload: values
                })
            }
            
        })
        
    }
    

    render(){
        const { currentOrderer, tlsFileList, addSet } = this.state;
        const { network, loading, sessionId } = this.props;
        const { ordererConfig, ordererCertId, ordererDownload, ordererDelete, ordererGet, ordererImageVersion } = network;
        const { getFieldDecorator } = this.props.form;
        console.log('ordererState',this.state,'ordererProps',this.props);

        

        const detailInfo = (<div className={styles.peer}>节点 - {currentOrderer?currentOrderer.ordererName:''}</div>);

        const ToggleMenu = (
            <Menu onClick={this.togglePeer}>
              {
                ordererConfig && ordererConfig.map((item,i) => {
                  return (
                    <Menu.Item key={item.ordererName}>
                      <a style={{color:'#008dff',cursor:'pointer'}}>{item.ordererName}</a>
                    </Menu.Item>
                  )
                })
              }
            </Menu>
          )
        const toggleSwitch = (
            <div className={styles.toggleSwitch}>
            <Dropdown  overlay={ToggleMenu} placement="bottomLeft">
              <Button>切换节点 <Icon type="down" /></Button>
            </Dropdown>
          </div>);


        ordererConfig && ordererConfig.map((item,i)=>{
            return ordererConfig[i].key = i;
        })
        const ordererConfigCol = [{
            title: '名称',
            dataIndex: 'ordererName'
        },{
            title: '是否已部署',
            dataIndex: 'isDeploy',
            render: (text)=>{   
                if(text === true)return '是'
                else return '否'
            }
        },{
            title: '部署信息',
            children: [{
                title: 'ip',
                dataIndex: 'deployInfo.ip'
            },{
                title: '服务请求端口',
                dataIndex: 'deployInfo.requestPort'
            },{
                title: '镜像版本',
                dataIndex: 'deployInfo.imageVersion'
            },{
                title: '容器名称',
                dataIndex: 'deployInfo.containerName'
            },{
                title: '节点使用权限',
                dataIndex: 'deployInfo.permission'
            },{
                title: '是否使用了tls',
                dataIndex: 'deployInfo.useTls',
                render: (text)=>{
                    if(text === true) return '是'
                    else return '否'
                }
            }]
        },{
            title: '下载证书',
            dataIndex: 'download',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.downloadCert(record.ordererName)}>下载</a>)
            }
        },{
            title: '删除',
            dataIndex: 'delete',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.deleteOrderer(record.ordererName)}>删除</a>)
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

        return (
            <PageHeaderLayout 
                detailInfo={detailInfo}
                toggleSwitch={toggleSwitch}
                logo={peer}
            >
                <Tabs defaultActiveKey="1" className={styles.tabs}>
                    <TabPane className={styles.tabChildren} tab={<span><Icon type="file-text" />节点信息</span>} key="1">
                        <Row gutter={24}>
                            <Col md={24}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>节点配置信息</div>
                                    <Table loading={loading} pagination={{pageSize:10}} bordered dataSource={ordererConfig} columns={ordererConfigCol} />
                                </div>
                            </Col>
                            <Col md={24} style={{marginTop:'24px'}}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>生成证书</div>
                                    <WrapGenerateCert type="orderer" />
                                </div>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane className={styles.tabChildren} tab={<span><Icon type="setting" />配置节点</span>} key="2">
                        <Row gutter={24}>
                            <Col md={24}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>节点配置信息</div>
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
                                            label="orderer节点名称"
                                        >
                                            {
                                                getFieldDecorator('name',{
                                                    initialValue:addSet?'':ordererGet.name,
                                                    rules: [{
                                                        required: true, message: '请输入节点名称！'
                                                    },{
                                                        validator: addSet?this.checkName:'',
                                                    }]
                                                })(
                                                    <Input/>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="是否已部署"
                                        >
                                            {
                                                getFieldDecorator('deployed',{
                                                    initialValue:addSet?true:ordererGet.deployed,
                                                })(
                                                    <RadioGroup onChange={this.changeDeployed}>
                                                        <Radio value={true}>是</Radio>
                                                        <Radio value={false}>否</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                        
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="IP"
                                        >
                                            {
                                                getFieldDecorator('ip',{
                                                    initialValue:addSet?'':ordererGet.ip,
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入可以访问到节点的IP！'
                                                    },{
                                                        pattern:/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message:'输入的IP不正确！'
                                                    }]
                                                })(
                                                    <Input disabled={this.state.disabled} placeholder="输入可以访问到节点的IP" />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="服务端口"
                                        >
                                            {
                                                getFieldDecorator('port',{
                                                    initialValue:addSet?'':ordererGet.port,
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入服务端口！'
                                                    },{
                                                        pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/, message: '输入的端口不正确！'
                                                    }]
                                                })(
                                                    <Input disabled={this.state.disabled} />
                                                )
                                            }
                                        </FormItem>
                                        
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="节点域名"
                                        >
                                            {
                                                getFieldDecorator('hostName',{
                                                    initialValue:addSet?'':ordererGet.hostName,
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入节点域名！'
                                                    },{
                                                        pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/, message: '输入的域名不正确！'
                                                    }]
                                                })(
                                                    <Input disabled={this.state.disabled} />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="组织名称"
                                        >
                                            {
                                                getFieldDecorator('orgName',{
                                                    initialValue:addSet?'':ordererGet.orgName,
                                                    rules: [{
                                                        required: true, message: '请输入节点所属组织的mspId！'
                                                    }]
                                                })(
                                                    <Input placeholder='请输入节点所属组织的mspId' />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="是否开启了tls"
                                        >
                                            {
                                                getFieldDecorator('useTls',{
                                                    initialValue:addSet?'':ordererGet.useTls,
                                                })(
                                                    <RadioGroup onChange={this.changeUseTls}>
                                                        <Radio value={true}>是</Radio>
                                                        <Radio value={false}>否</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="证书类型"
                                        >
                                            {
                                                getFieldDecorator('certType',{
                                                    initialValue:addSet?'':ordererGet.certType,
                                                    rules:[{
                                                        required: true, message: '请选择证书类型！'
                                                    }]
                                                })(
                                                    <RadioGroup onChange={this.changeCertType}>
                                                        <Radio disabled={!this.state.certTypeFlag} value='tls'>tls</Radio>
                                                        <Radio value='all'>all</Radio>
                                                        <Radio disabled={this.state.certTypeFlag} value='no'>no</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="镜像版本"
                                        >
                                            {
                                                getFieldDecorator('imageVersion',{
                                                    initialValue:addSet?'':ordererGet.imageVersion,
                                                })(
                                                    <Select
                                                        showSearch
                                                        placeholder="选择一个镜像版本"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    >
                                                        {
                                                        ordererImageVersion && ordererImageVersion.map((item,i)=>{
                                                            return (<Option key={i} value={item}>{item}</Option>)
                                                        })
                                                        }
                                                    </Select>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="容器名称"
                                        >
                                            {
                                                getFieldDecorator('containerName',{
                                                    initialValue:addSet?'':ordererGet.containerName,
                                                })(
                                                    <Input  />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            wrapperCol={{ span: 8, offset: 8 }}
                                            style={{display:!addSet?'block':'none'}}
                                            >
                                            <Button type="primary"  block htmlType="submit">确定</Button>
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="获取上传Id"
                                            style={{display:!addSet?'none':'block'}}
                                        >
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                {getFieldDecorator('certId',{
                                                    initialValue: ordererCertId ? ordererCertId.certId : '',
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
                                            label="上传tls证书"
                                            extra="请先获取上传Id"
                                            style={{display: !addSet?'none':this.state.certType==="tls"?'block':'none'}}
                                        >
                                            {getFieldDecorator('cert', {
                                            valuePropName: 'cert',
                                            getValueFromEvent: this.normFile,
                                            rules:[{required: true}]
                                            })(
                                                <Upload  
                                                disabled={ordererCertId?false:true} 
                                                name="file" 
                                                fileList={tlsFileList}
                                                action={`http://${host}/network/peer/cert/upload/tls/${ordererCertId?ordererCertId.certId:''}`}
                                                beforeUpload={this.beforeUpload}
                                                onChange={this.changeUploadTls}
                                                >
                                                    <Button>
                                                        <Icon type="upload" /> 上传tls
                                                    </Button>
                                                </Upload>
                                            )}
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="上传全部证书"
                                            extra="请先获取上传Id"
                                            style={{display: !addSet?'none':this.state.certType==="all"?'block':'none'}}
                                        >
                                            {getFieldDecorator('cert', {
                                            valuePropName: 'cert',
                                            getValueFromEvent: this.normFile,
                                            rules:[{required: true}]
                                            })(
                                                <Upload  
                                                disabled={ordererCertId?false:true} 
                                                name="file" 
                                                action={`http://${host}/network/peer/cert/upload/all/${ordererCertId?ordererCertId.certId:''}`}
                                                beforeUpload={this.beforeUpload}
                                                >
                                                    <Button>
                                                        <Icon type="upload" /> 上传文件
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

 const WrapOrdererNetwork = Form.create({})(OrdererNetwork);
export default WrapOrdererNetwork;