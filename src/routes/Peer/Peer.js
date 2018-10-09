import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Icon,
  Card,
  Tabs,
  Table,
  Radio,
  DatePicker,
  Select,
  Menu,
  Dropdown,
  Button,
  Form,
  Input,
  Upload,
  Tooltip,
  message
} from 'antd';
import numeral from 'numeral';
import {
  ChartCard,
  yuan,
  MiniArea,
  MiniBar,
  MiniProgress,
  Field,
  Bar,
  Pie,
  TimelineChart,
} from 'components/Charts';
import PolicyModal from 'components/Policy';
import Trend from 'components/Trend';
import NumberInfo from 'components/NumberInfo';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import InstallForm from './installForm';
import { getTimeDistance } from '../../utils/utils';
import chanincode from '../../assets/合约.png';
import triangle from '../../assets/右三角形.png';
import peer from '../../assets/节点.png';

import styles from './Peer.less';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;



@connect(({ chart, loading }) => {
  return {
      chart,
      loading: loading.effects['chart/peerGetChannelList'],
    }
} )
class Peer extends Component {
  constructor(props){
    super(props);
    this.state={
      currentPeer: null,
      listSwitch: true,
      channelSwitch: true,
      canUpload: false,
      visibleModal: false,
      button: '实例化',
      isCurrent: false,
    }
    
    this.togglePeer = this.togglePeer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addChannel = this.addChannel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.selectChaincode = this.selectChaincode.bind(this);
    this.showPolicyModal = this.showPolicyModal.bind(this);
    this.getPolicyData = this.getPolicyData.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.setState({
      isCurrent: true,
    })
  }
  
  componentDidUpdate(prevProps,prevState){
    if(!this.props.sessionId) return;
    const { dispatch } = this.props;
    const { token } = this.props.sessionId;
    this.props.list && this.state.listSwitch && this.setState({
      currentPeer: this.props.list.peerList[0],
      listSwitch: false,
    })
    if(this.state.currentPeer && this.state.channelSwitch){
      dispatch({
        type: 'chart/peerGetChannelList',
        payload: {
          peerName: this.state.currentPeer.name,
          token: token
        }
      })

      dispatch({
        type: 'chart/peerGetChaincodeList',
        payload: {
          peerName: this.state.currentPeer.name,
          token: token
        }
      })

      this.setState({
        channelSwitch: false
      })
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'chart/clear',
    });
    this.setState({
      isCurrent: false
    })
  }

  togglePeer = ({key}) => {
    let peer = null;
    this.props.list.peerList.map((item,i)=>{
      if(item.name === key){
        peer = item
      }
    })
    this.setState({
      currentPeer: peer,
      channelSwitch: true,
    })
  }

  handleChange = (value) => {
    this.setState({
      willAddChannel: value
    })
  }

  addChannel = () => {
    if(!this.state.willAddChannel) return;
    const { dispatch } = this.props;
    const { token } = this.props.sessionId;
    dispatch({
      type: 'chart/join2Channel',
      payload: {
        channelName: this.state.willAddChannel,
        peerName: this.state.currentPeer.name,
        token: token
      }
    })
  }



  //实例化合约
  handleSubmit = (e) => {
    e.preventDefault();
    const { dispatch } = this.props;
    const that = this;
    this.props.form.validateFields((err, values)=>{
      if(!err){
        if(values.policy === 4){
          values.policy = that.state.policy
        }else{
          values.policy = {type: values.policy}
        }
        console.log('安装',values);
        if(values.option === 'instantiate'){
          dispatch({
            type: 'chart/chaincodeInstantiate',
            payload: values
          })
        }else{
          dispatch({
            type: 'chart/chaincodeUpgrade',
            payload: values
          })
        }
        
      }
    })
  }

  //获取已选择的合约版本号
  selectChaincode = (key) => {
    console.log('form.getFieldsValue',this.props.form.getFieldsValue());
    const chaincodeList = this.props.chart.peerChaincodeList;
    let versionList = [];
    chaincodeList.map((item,i)=>{
      if(item.chaincodeName === key){
        versionList.push(item.version);
      }
    })
    this.setState({
      versionList: versionList
    })
  }

  showPolicyModal = (function(param){
    let count = 1;
    const that = param;
    return ()=>{
      that.setState({
        visibleModal: true,
        count: count++
      })
    }
  })(this)


  getPolicyData(data){
    this.setState({
      policy: data
    })
  }

  changeOption = (e) => {
    const value = e.target.value;
    if(value === 'instantiate'){
      this.setState({
        button: '实例化'
      })
    }else{
      this.setState({
        button: '升级'
      })
    }
  }

  changeChannel = (key) => {
    const { dispatch } = this.props;
    const { token } = this.props.sessionId;
    console.log(key)
    dispatch({
      type: 'chart/getOrgList',
      payload: {
        channelsName: [key],
        token: token
      }
  })
  }
 
  render() {
    const { status, currentPeer, versionList } = this.state;
    const { chart, loading, list, sessionId } = this.props;
    const {peerChannelList, peerChaincodeList, orgList } = chart;
    const { getFieldDecorator } = this.props.form;
    
    const token = sessionId?sessionId.token:'';
    
    console.log('this.props',this.props);
    console.log('this.state',this.state);

    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      style: { marginBottom: 24 },
    };

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

    const detailInfo = (
      <div className={styles.peer}>节点 - {currentPeer?currentPeer.name:''}</div>
    )

    const toggleSwitch = (
      <div className={styles.toggleSwitch}>
        <Dropdown  overlay={ToggleMenu} placement="bottomLeft">
          <Button>切换节点 <Icon type="down" /></Button>
        </Dropdown>
      </div>
    )

    const leftContent = (
      <div className={styles.leftContent}>
        {
          currentPeer? 
          <ul>
            <li><span>地址</span>{currentPeer.request}</li>
            <li><span>域名</span>{currentPeer.host}</li>
          </ul>
          :''
        }
      </div>
    )

    peerChannelList && peerChannelList.map((item,i)=>{
      return peerChannelList[i].key = i;
    })
    const peerChannelListColumns = [{
      title: '通道名称',
      dataIndex: 'channelName'
    },{
      title: '区块数量',
      dataIndex: 'blockCount'
    },{
      title: '交易数量',
      dataIndex: 'txCount'
    },{
      title: '合约数量',
      dataIndex: 'chaincodeCount'
    },{
      title: 'key数量',
      dataIndex: 'keyCount'
    }];

    peerChaincodeList && peerChaincodeList.map((item,i)=>{
      return peerChaincodeList[i].key = i;
    })
    const peerChaincodeListColumns = [{
      title: '合约名称',
      dataIndex: 'chaincodeName'
    },{
      title: '合约版本',
      dataIndex: 'version'
    },{
      title: '合约路径',
      dataIndex: 'path'
    },{
      title: '合约状态',
      dataIndex: 'status',
      render: (text)=>{
        if(text === 'instantiated') return ('已实例化')
        else if(text === 'installed') return ('已安装')
      }
    },{
      title: '所在通道(已实例化)',
      dataIndex: 'channelName'
    }];

    //当前peer节点安装的所有合约（去重）
    const purePeerChaincodeList = (function(peerChaincodeList){
      if(!peerChaincodeList) return;
      let arr = [];
      peerChaincodeList.map((item,i)=>{
        if(arr.indexOf(item.chaincodeName) < 0){
          arr.push(item.chaincodeName)
        }
      })
      console.log('purePeerChaincodeList',arr)
      return arr;
    })(peerChaincodeList);



    
    let canJoinChannel = null;   //存放未加入的通道名
    if(this.props.list && this.props.list.channelList && peerChannelList){
      const channelName = peerChannelList.map((item,i)=>{
        return item.channelName;
      })

      canJoinChannel = this.props.list.channelList.filter((item)=>{
        return channelName.indexOf(item) < 0;
      })
    }

    const rightContent = (
      <div className={styles.rightContent}>
          <span>加入通道：</span>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select a channel"
            optionFilterProp="children"
            onChange={this.handleChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {
              canJoinChannel && canJoinChannel.map((item,i)=>{
                return (<Option key={i} value={item}>{item}</Option>)
              })
            }
          </Select>
          <Button onClick={this.addChannel} style={{marginLeft:'10px'}} type="primary">确认</Button>
      </div>
    );

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
        leftContent={leftContent}
        rightContent={rightContent}
      >
      <Fragment>
        <Tabs defaultActiveKey="1" className={styles.tabs}>
              <TabPane className={styles.tabChildren} tab={<span><Icon type="file-text" />详情展示</span>} key="1">
                <Row gutter={24}>
                  <Col {...topColResponsiveProps}>
                      <ChartCard
                        bordered={false}
                        loading={loading}
                        icon={triangle}
                        title={"通道数量"}
                        count={status ? status.channelCount : 0}
                        size={{width:50,height:50}}
                      >
                      </ChartCard>
                  </Col>
                  <Col {...topColResponsiveProps}>
                    <ChartCard
                      bordered={false}
                      loading={loading}
                      icon={chanincode}
                      title="合约数量"
                      count={status ? status.chaincodeCount : 0}
                      backgroundImg="#dd4b39"
                    >
                    </ChartCard>
                  </Col>

                  <Col md={24}>
                      <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>通道列表</div>
                        <Table loading={loading} pagination={{pageSize:10}} bordered dataSource={peerChannelList} columns={peerChannelListColumns} />
                      </div>
                  </Col>

                  <Col md={24} style={{marginTop: '24px'}}>
                      <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>合约列表</div>
                        <Table loading={loading} pagination={{pageSize:10}} bordered dataSource={peerChaincodeList} columns={peerChaincodeListColumns} />
                      </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane className={styles.tabChildren} tab={<span><Icon type="profile" />安装合约</span>} key="2">
                <Row guter={24}>
                  <Col md={24}>
                      <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>安装合约</div>
                        <div style={{marginTop: '20px'}}>
                          <InstallForm currentPeer={currentPeer} />
                        </div>
                      </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane className={styles.tabChildren} tab={<span><Icon type="team" />实例化合约</span>} key="3">
              <Row guter={24}>
                  <Col md={24}>
                      <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>实例化合约</div>
                        <div style={{marginTop: '20px'}}>
                          <Form onSubmit={this.handleSubmit}>
                          <FormItem
                              {...formItemLayout}
                              label="选择操作"
                            >
                                {
                                  getFieldDecorator('option',{
                                    initialValue: 'instantiate'
                                  })(
                                    <RadioGroup onChange={this.changeOption}>
                                      <Radio value='instantiate'>实例化合约</Radio>
                                      <Radio value='update'>升级合约</Radio>
                                    </RadioGroup>
                                  )
                                }
                            </FormItem>
                          <FormItem
                              {...formItemLayout}
                              label="通道"
                              hasFeedback={true}
                              
                            >
                                {getFieldDecorator('channelName',{
                                  rules: [{
                                    required: true, message: '请选择一个通道'
                                  },]
                                })(
                                  <Select onChange={this.changeChannel} placeholder="选择通道">
                                    {
                                      peerChannelList && peerChannelList.map((item,i)=>{
                                        return <Option key={i} value={item.channelName}>{item.channelName}</Option>
                                      })
                                    }
                                  </Select>
                                )}
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="合约名称"
                              hasFeedback={true}
                            >
                                {getFieldDecorator('chaincodeName',{
                                  rules: [{
                                    required: true, message: '请选择一个合约'
                                  },]
                                })(
                                  <Select onChange={this.selectChaincode} placeholder="选择合约">
                                  {
                                    purePeerChaincodeList && purePeerChaincodeList.map((item,i)=>{
                                      return <Option key={i} value={item}>{item}</Option>
                                    })
                                  }
                                  </Select>
                                )}
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="合约版本"
                              hasFeedback={true}
                            >
                                {getFieldDecorator('version',{
                                  rules: [{
                                    required: true, message: '请选择版本号'
                                  }]
                                })(
                                  <Select placeholder="选择版本号">
                                  {
                                    versionList && versionList.map((item,i)=>{
                                      return <Option key={i} value={i}>{item}</Option>
                                    })
                                  }
                                  </Select>
                                )}
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="背书策略"
                            >
                                {getFieldDecorator('policy',{
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
                                    <Radio value={4} onClick={this.showPolicyModal}><span style={{color:'#1890ff',cursor:'pointer'}}>自定义</span></Radio>
                                  </RadioGroup>
                                )}
                                <PolicyModal getPolicyData={this.getPolicyData} token={token?token:''} orgList={orgList}  count={this.state.count}  visible={this.state.visibleModal} />
                            </FormItem>
                            <FormItem
                              {...formItemLayout}
                              label="当前节点名称"
                            >
                                {getFieldDecorator('peerName',{
                                  initialValue: currentPeer ? currentPeer.name : '',
                                  rules: [{
                                    required: true, message: '请输入节点名称'
                                  },{
                                    validator: this.checkChaincodeVersion
                                  }]
                                })(
                                  <Input disabled={true} />
                                )}
                            </FormItem>
                            <FormItem
                              wrapperCol={{ span: 8, offset: 8 }}
                            >
                              <Button type="primary" block htmlType="submit">{this.state.button}</Button>
                            </FormItem>
                          </Form>
                        </div>
                      </div>
                  </Col>
                </Row>
              </TabPane>
        </Tabs>
        
      </Fragment>
      </PageHeaderLayout>
    );
  }
}
const WrapFormPeer = Form.create({})(Peer);
export default WrapFormPeer;
