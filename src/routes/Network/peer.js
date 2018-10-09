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
import WrapDeployPeer from './deployPeer';
import WrapGenerateCert from './generateCert';
import styles from './index.less';

import peer from '../../assets/节点.png';
import rule from '../../models/rule';

const { TabPane } = Tabs;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const host = '192.168.32.116:8080';
@connect(({ network, loading }) => {
    return {
        network,
        loading: loading.effects['network/peerGetChannelList'],
      }
  } )
 class PeerNetwork extends React.Component {
     constructor(props){
         super(props);
         this.state = {
            currentPeer:null,
            listSwitch: true,
            shouldCheck: true,
            disabled: false,
            fileList:[],
            addSet: true,
            peerGetSwitch: true,
         }
         this.managePeer = this.managePeer.bind(this);
         this.changeDeployed = this.changeDeployed.bind(this);
         this.getCertId = this.getCertId.bind(this);
         this.beforeUpload = this.beforeUpload.bind(this);
         this.changeUpload = this.changeUpload.bind(this);
         this.togglePeer = this.togglePeer.bind(this);
         this.handleSubmit = this.handleSubmit.bind(this);
         this.peerDownload = this.peerDownload.bind(this);
         this.peerDelete = this.peerDelete.bind(this);
         this.checkName = this.checkName.bind(this);
         this.changeOper = this.changeOper.bind(this);
     }

     componentDidMount(){
        const {dispatch} = this.props;
        dispatch({
             type: 'network/getConfigPeer'
        })
        dispatch({
            type: 'network/getConfigOrderer'
        })
        dispatch({
            type: 'network/peerImageVersion'
        })
        
     }

     componentDidUpdate(prevProps, prevState){
        if(!this.props.sessionId) return;
        const { dispatch, network } = this.props;
        const { token } = this.props.sessionId;
        network.peerConfig && this.state.listSwitch && this.setState({
          currentPeer: network.peerConfig[0],
          listSwitch: false,
        })

        if(this.state.currentPeer && this.state.peerGetSwitch){
            // dispatch({
            //     type: 'network/peerGetChannelList',
            //     payload: {
            //       peerName: this.state.currentPeer.peerName,
            //       token: token
            //     }
            // })
            dispatch({
                type: 'network/peerGet',
                payload: {
                    peerName: this.state.currentPeer.peerName,
                    token: token
                }
                
            })
            this.setState({
                peerGetSwitch: false
            })
        }


     }

     changeDeployed = (e) => {
        const value = e.target.value;
        if(value === false){
            this.setState({
                shouldCheck: false,
                disabled: true
            },() => {
                const { form } = this.props;
                form.resetFields(['ip','requestPort','chaincodePort','blockPort','hostName','ordererName']);
                form.setFieldsValue({deployed:false});
                form.validateFields(['ip','requestPort','chaincodePort','blockPort','hostName','ordererName'],{force: true});
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
         form.validateFields(['firstSet','name','orgName','deployed','ip','requestPort','chaincodePort','blockPort','hostName','useTls','ordererName','imageVersion','containerName','couchdbIp','couchdbPort'],(err,values)=>{
             if(!err){
                console.log('Received values of form: ', values);
                dispatch({
                    type: 'network/getPeerCertId',
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

    togglePeer = ({key}) => {
        console.log(key)
        const { peerConfig } = this.props.network;
        peerConfig.map((item,i)=>{
            if(item.peerName === key){
                this.setState({
                    currentPeer: item,
                })
            }
        })
    }

    handleSubmit = () => {
        const {dispatch, form} = this.props;
        form.validateFields(['name','orgName','deployed','ip','requestPort','chaincodePort','blockPort','hostName','useTls','ordererName','firstSet'],(err,values)=>{
            if(!err){
                dispatch({
                    type:'network/getPeerCertId',
                    payload: values
                })
            }
        })
    }

    managePeer = (name,oper) => {
        const { dispatch } = this.props;
        if(oper === 'stop'){
            if(confirm('确定停止服务吗？')){
                dispatch({
                    type: 'network/managePeer',
                    payload: {
                        peerName: name,
                        oper
                    }
                })
            }
        }else
        if(oper === 'remove'){
            if(confirm('确定移除节点吗？')){
                dispatch({
                    type: 'network/managePeer',
                    payload: {
                        peerName: name,
                        oper
                    }
                })
            }
        }else
        if(oper === 'destroy'){
            if(confirm('确定销毁节点吗？')){
                dispatch({
                    type: 'network/managePeer',
                    payload: {
                        peerName: name,
                        oper
                    }
                })
            }
        }else
        if(oper === 'restart'){
            if(confirm('确定重启服务吗？')){
                dispatch({
                    type: 'network/managePeer',
                    payload: {
                        peerName: name,
                        oper
                    }
                })
            }
        }else{
            dispatch({
                type: 'network/managePeer',
                payload: {
                    peerName: name,
                    oper
                }
            })
        }
        
    }

    peerDownload = (name) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'network/peerDownload',
            payload: {name}
        })
    }

    peerDelete = (peerName) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'network/peerDelete',
            payload: {
                peerName
            }
        })
    }

    checkName = (rule, value, callback) => {
        const  { peerConfig } = this.props.network;
        peerConfig && peerConfig.map((item,i)=>{
            if(value === item.peerName){
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
            shouldCheck: network.peerGet.deployed,
            disabled: !network.peerGet.deployed,
        },()=>{
            form.resetFields();
        })
    }

    render(){
        const { currentPeer, fileList, addSet } = this.state;
        const { network, loading, list, sessionId } = this.props;
        const { peerChannelList, peerConfig, ordererConfig, peerCertId, peerImageVersion, peerGet  } = network;
        const { getFieldDecorator } = this.props.form;
        console.log('peerState',this.state,'peerProps',this.props);

        let canJoinChannel = null;   //存放未加入的通道名
        if(this.props.list && this.props.list.channelList && peerChannelList){
        const channelName = peerChannelList.map((item,i)=>{
            return item.channelName;
        })

        canJoinChannel = this.props.list.channelList.filter((item)=>{
            return channelName.indexOf(item) < 0;
        })
        }

        const detailInfo = (<div className={styles.peer}>节点 - {currentPeer?currentPeer.peerName:''}</div>);

        const ToggleMenu = (
            <Menu onClick={this.togglePeer}>
              {
                list && list.peerList ? list.peerList.map((item,i) => {
                  return (
                    <Menu.Item key={item.name}>
                      <a style={{color:'#008dff',cursor:'pointer'}}>{item.name}</a>
                    </Menu.Item>
                  )
                }) : ''
              }
            </Menu>
          )
        const toggleSwitch = (
            <div className={styles.toggleSwitch}>
            <Dropdown  overlay={ToggleMenu} placement="bottomLeft">
              <Button>切换节点 <Icon type="down" /></Button>
            </Dropdown>
          </div>);

        // const leftContent = (
        //     <div className={styles.leftContent}>
        //     <span>加入通道：</span>
        //     <Select
        //       showSearch
        //       style={{ width: 200 }}
        //       placeholder="Select a channel"
        //       optionFilterProp="children"
        //       onChange={this.handleChange}
        //       filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        //     >
        //       {
        //         canJoinChannel && canJoinChannel.map((item,i)=>{
        //           return (<Option key={i} value={item}>{item}</Option>)
        //         })
        //       }
        //     </Select>
        //     <Button onClick={this.addChannel} style={{marginLeft:'10px'}} type="primary">确认</Button>
        // </div>);

        peerConfig && peerConfig.map((item,i)=>{
            return peerConfig[i].key = i;
        })
        const peerConfigCol = [{
            title: '名称',
            dataIndex: 'peerName'
        },{
            title: '是否部署',
            dataIndex: 'deploy',
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
                title: '链码监听端口',
                dataIndex: 'deployInfo.chaincodePort'
            },{
                title: '区块监听端口',
                dataIndex: 'deployInfo.blockPort'
            },{
                title: '镜像版本',
                dataIndex: 'deployInfo.imageVersion'
            },{
                title: '容器名称',
                dataIndex: 'deployInfo.containerName'
            },{
                title: 'orderer访问地址',
                dataIndex: 'deployInfo.ordererHost'
            },{
                title: '组织的mspId',
                dataIndex: 'deployInfo.orgName'
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
                return (<a href="javascript:;" onClick={()=>this.peerDownload(record.peerName)}>下载</a>)
            }
        },{
            title: '删除',
            dataIndex: 'delete',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.peerDelete(record.peerName)}>删除</a>)
            }
        }];

        const managePeerCol = [{
            title: '名称',
            dataIndex: 'peerName'
        },{
            title: '启动服务',
            dataIndex: 'start',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.managePeer(record.peerName,'start')}>启动</a>)
            }
        },{
            title: '停止服务',
            dataIndex: 'stop',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.managePeer(record.peerName,'stop')}>停止</a>)
            }
        },{
            title: '重启服务',
            dataIndex: 'restart',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.managePeer(record.peerName,'restart')}>重启</a>)
            }
        },{
            title: '移除节点',
            dataIndex: 'remove',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.managePeer(record.peerName,'remove')}>移除</a>)
            }
        },{
            title: '销毁节点',
            dataIndex: 'destroy',
            render: (text,record)=>{
                return (<a href="javascript:;" onClick={()=>this.managePeer(record.peerName,'destroy')}>销毁</a>)
            }
        }]

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

          ordererConfig && ordererConfig.map((item,i)=>{
              return ordererConfig[i].key = i;
          })
        return (
            <PageHeaderLayout 
                detailInfo={detailInfo}
                toggleSwitch={toggleSwitch}
                logo={peer}
                // leftContent={leftContent}
            >
                <Tabs defaultActiveKey="1" className={styles.tabs}>
                    <TabPane className={styles.tabChildren} tab={<span><Icon type="file-text" />节点信息</span>} key="1">
                        <Row gutter={24}>
                            <Col md={24}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>节点配置信息</div>
                                    <Table loading={loading} pagination={{pageSize:10}} bordered dataSource={peerConfig} columns={peerConfigCol} />
                                </div>
                            </Col>
                            <Col md={24} style={{marginTop:'24px'}}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>管理节点</div>
                                    <Table loading={loading} pagination={{pageSize:10}} bordered dataSource={peerConfig} columns={managePeerCol} />
                                </div>
                            </Col>
                            <Col md={24} style={{marginTop:'24px'}}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>生成证书</div>
                                    <WrapGenerateCert type="peer" data={peerConfig} />
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
                                            label="节点名称"
                                        >
                                            {
                                                getFieldDecorator('name',{
                                                    initialValue: !addSet&&peerGet?peerGet.name:'',
                                                    rules: [{
                                                        required: true, message: '请输入节点名称！'
                                                    },{
                                                        validator: addSet?this.checkName: ''
                                                    }]
                                                })(
                                                    <Input/>
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
                                                    initialValue: !addSet&&peerGet?peerGet.orgName:'',
                                                    rules: [{
                                                        required: true, message: '请输入节点所属组织的mspId！'
                                                    }]
                                                })(
                                                    <Input  />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="是否已部署"
                                        >
                                            {
                                                getFieldDecorator('deployed',{
                                                    initialValue: !addSet&&peerGet?peerGet.deployed:true,
                                                    rules: [{
                                                        required: true, message: '请选择是否已部署！'
                                                    }]
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
                                                    initialValue: !addSet&&peerGet?peerGet.ip:'',
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
                                            label="节点请求端口"
                                        >
                                            {
                                                getFieldDecorator('requestPort',{
                                                    initialValue: !addSet&&peerGet?peerGet.requestPort:'',
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入节点请求端口！'
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
                                            label="链码事件监听端口"
                                        >
                                            {
                                                getFieldDecorator('chaincodePort',{
                                                    initialValue: !addSet&&peerGet?peerGet.chaincodePort:'',
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入链码事件监听端口！'
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
                                            label="区块事件监听端口"
                                        >
                                            {
                                                getFieldDecorator('blockPort',{
                                                    initialValue: !addSet&&peerGet?peerGet.blockPort:'',
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入区块事件监听端口！'
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
                                                    initialValue: !addSet&&peerGet?peerGet.hostName:'',
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
                                            label="是否开启了tls"
                                        >
                                            {
                                                getFieldDecorator('useTls',{
                                                    initialValue: !addSet&&peerGet?peerGet.useTls:true,
                                                })(
                                                    <RadioGroup>
                                                        <Radio value={true}>是</Radio>
                                                        <Radio value={false}>否</Radio>
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
                                                getFieldDecorator('ordererName',{
                                                    initialValue: !addSet&&peerGet?peerGet.ordererName:'',
                                                    rules: [{
                                                        required: this.state.shouldCheck,message: '请输入orderer节点名称！'
                                                    }]
                                                })(
                                                    <Select disabled={this.state.disabled} placeholder="选择通道">
                                                        {
                                                        ordererConfig && ordererConfig.map((item,i)=>{
                                                            return <Option key={i} value={item.ordererName}>{item.ordererName}</Option>
                                                        })
                                                        }
                                                    </Select>
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
                                                    initialValue: !addSet&&peerGet?peerGet.imageVersion:'',
                                                })(
                                                    <Select
                                                    showSearch
                                                    placeholder="选择一个镜像版本"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    >
                                                        {
                                                        peerImageVersion && peerImageVersion.map((item,i)=>{
                                                            return <Option key={i} value={item}>{item}</Option>
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
                                                    initialValue: !addSet&&peerGet?peerGet.containerName:'',
                                                })(
                                                    <Input  />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="couchdb访问IP"
                                        >
                                            {
                                                getFieldDecorator('couchdbIp',{
                                                    initialValue: !addSet&&peerGet?peerGet.couchdbIp:'',
                                                    rules: [{
                                                        pattern:/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message:'输入的IP不正确！'
                                                    }]
                                                })(
                                                    <Input  />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            hasFeedback={true}
                                            label="couchdb访问端口"
                                        >
                                            {
                                                getFieldDecorator('couchdbPort',{
                                                    initialValue: !addSet&&peerGet?peerGet.couchdbPort:'',
                                                    rules: [{
                                                        pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/, message: '输入的端口不正确！'
                                                    }]
                                                })(
                                                    <Input  />
                                                )
                                            }
                                        </FormItem>
                                        <FormItem
                                            {...formItemLayout}
                                            label="获取上传Id"
                                            style={{display:addSet?'blick':'none'}}
                                        >
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                {getFieldDecorator('certId',{
                                                    initialValue: peerCertId ? peerCertId.certId : '',
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
                                            label="上传合约"
                                            extra="请先获取上传Id"
                                            style={{display:addSet?'blick':'none'}}
                                        >
                                            {getFieldDecorator('cert', {
                                            valuePropName: 'cert',
                                            getValueFromEvent: this.normFile,
                                            rules:[{required: true}]
                                            })(
                                                <Upload  
                                                disabled={peerCertId?false:true} 
                                                name="file" 
                                                fileList={fileList}
                                                action={`http://${host}/network/peer/cert/upload/${peerCertId?peerCertId.certId:''}`}
                                                beforeUpload={this.beforeUpload}
                                                onChange={this.changeUpload}
                                                >
                                                    <Button>
                                                        <Icon type="upload" /> 点击上传
                                                    </Button>
                                                </Upload>
                                            )}
                                        </FormItem>
                                        <FormItem
                                            wrapperCol={{ span: 8, offset: 8 }}
                                            style={{display:!addSet?'block':'none'}}
                                            >
                                            <Button type="primary"  block htmlType="submit">确定</Button>
                                        </FormItem>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane className={styles.tabChildren} tab={<span><Icon type="cloud-upload" />部署节点</span>} key="3">
                    <Row gutter={24}>
                            <Col md={24}>
                                <div className={styles.blockListTable}>
                                    <div className={styles.blockTitle}>节点配置信息</div>
                                    {peerImageVersion ? <WrapDeployPeer peerImageVersion={peerImageVersion} /> : ''}
                                </div>
                            </Col>
                    </Row>
                    </TabPane>
                </Tabs>
            </PageHeaderLayout>
        )
    }
 }

 const WrapPeerNetwork = Form.create({})(PeerNetwork);
export default WrapPeerNetwork;