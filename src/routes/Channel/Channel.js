import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Icon,
  Tabs,
  Table,
  List,
  DatePicker,
  Button,
  Menu,
  Dropdown,
} from 'antd';
import {
  Chart,
  Tooltip as TimeTooltip,
  Geom,
  Legend,
  Axis
} from 'bizcharts';
import numeral from 'numeral';
import {
  ChartCard,
} from 'components/Charts';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {heartTickStatus} from '../../common/heartTick';
import WrapOperation from './Operation';
import CreateChannel from './CreateChannel';
import UpdateSign from './UpdateSign';

import styles from './Channel.less';
import node from '../../assets/节点.png';
import block from '../../assets/区块.png';
import chanincode from '../../assets/合约.png';
import tx from '../../assets/交易.png';
import channel from '../../assets/右三角形.png';
const { TabPane } = Tabs;


const scale = {
  time: {
    alias: '时间',
    type: 'time',
    mask: 'hh:mm:ss',
    tickCount: 10,
    nice: false
  },
  txCount: {
    alias: '交易量',
    type: 'log',
    tickCount: 10,
  },
}
let chartTIme;

@connect(({ chart, loading }) => {
  return {
      chart,
      loading: loading.effects['chart/getBlockInfo'],
    }
} )
export default class Channel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      statusSwitch: true,
      blockSwitch: true,
      orgListSwitch: true,
      token:null,
      isCurrent: false,
      getBlockInfo: true,
    };
    this.wsStatus = null;
    this.wsBlock = null;
    this.toggleChannel = this.toggleChannel.bind(this);
    this.showBlockInfo = this.showBlockInfo.bind(this);
    this.getTxInfo = this.getTxInfo.bind(this);
  }

  componentDidMount() {
    const that = this;
    console.log('是否挂载',this.props);
    this.setState({
      isCurrent: true,
    })
  }

  componentDidUpdate(){
    if(!this.props.sessionId) return;
    
    const { dispatch } = this.props;
    const { currentChannel } = this.state;
    const { token } = this.props.sessionId;
    console.log(this.state.blockSwitch===true)

    setTimeout(()=>{
      const { channelBlocks } = this.props;
      if(this.state.getBlockInfo && currentChannel && channelBlocks){
        dispatch({
          type:'chart/getBlockInfo',
          payload: {
            channelName: currentChannel,
            blockNumber: channelBlocks[channelBlocks.length-1].blockNumber,
            token: token
          }
        })
        this.setState({
          getBlockInfo:false
        })
      }
    },1000)

    if(this.props.list && this.state.statusSwitch && token){
      const { channelList , peerList } = this.props.list;
      console.log(this.props.list)
      const channelName = currentChannel ? currentChannel : channelList[0];
      if(typeof(WebSocket) === "undefined") {
        alert("您的浏览器不支持WebSocket");
      }
      peerList && peerList.length && this.socketStatus(token,'channel',channelName,peerList[0].name);
    }
    let initBlock = true;

    if(this.state.orgListSwitch && currentChannel && token){
      dispatch({
        type:'chart/getOrgList',
        payload: {
          channelsName: [currentChannel],
          token: token
        }
      })
      dispatch({
        type:'chart/getChannelPeerList',
        payload: {
          channelName: currentChannel,
          token: token
        }
      })
      dispatch({
        type:'chart/getChaincodeList',
        payload: {
          channelName: currentChannel,
          token: token
        }
      })
      this.setState({
        orgListSwitch: false
      })
    }
  }


  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'chart/clear',
    });
    this.setState({
      isCurrent: false,
    })
  }

  socketStatus = (token,sectionName,channelName,peerName) => {
    const that = this;
    if(this.wsStatus && this.wsStatus.readyState !== 3){
      return;
    } 
    const { getCurrentChannel } = this.props;
    this.wsStatus = new WebSocket(`ws://192.168.32.116:8080/websocket/status/${token}/${sectionName}/${channelName}/${peerName}`);
    this.wsStatus.onopen = function(){
      console.log('socketStatus已经连接');
      heartTickStatus.start(that.wsStatus,token);
    }
    
    this.wsStatus.onmessage = function(msg){
      heartTickStatus.reset(that.wsStatus,token);
      console.log('socketStatus',JSON.parse(msg.data));
      let data = JSON.parse(msg.data);
      if(!data.token){
        getCurrentChannel(channelName);
        that.setState({
          status: data,
          currentChannel: channelName,
          currentPeer: peerName,
          statusSwitch: false,
        })
      }
      
    }
  
    this.wsStatus.onclose = function(msg){
      console.log('关闭了websocket');
      that.reconnetStatus(token,sectionName,channelName,peerName);
    }
    this.wsStatus.onerror = function(){
      console.log('wsStatus发生错误');
      that.reconnetStatus(token,sectionName,channelName,peerName);
    }
  }

  reconnetStatus = (token,sectionName,channelName,peerName) => {
    console.log('准备重连wsStatus')
    this.wsStatus = new WebSocket(`ws://192.168.32.116:8080/websocket/status/${token}/${sectionName}/${channelName}/${peerName}`);
  }



  toggleChannel = ({key}) => {
    this.props.getCurrentChannel(key);
    this.setState({
      currentChannel: key,
      statusSwitch: true,
      orgListSwitch: true,
    })
  }

  showBlockInfo = (num) => {
    const { dispatch } = this.props;
    const channelName = this.state.currentChannel;
    dispatch({
      type: 'chart/getBlockInfo',
      payload: {
        channelName: channelName,
        blockNumber: num,
        token: this.props.sessionId.token
      }
    })
  }

  getTxInfo = (tx) => {
    const { dispatch } = this.props;
    const channelName = this.state.currentChannel;
    dispatch({
      type: 'chart/getTxInfo',
      payload: {
        channelName: channelName,
        txId: tx,
        token: this.props.sessionId.token
      }
    })
  }


  render() {
    const { status, currentChannel } = this.state;
    const { chart, loading, timeLineDataBlock, timeLineData, timeLineDataMin, channelBlocks} = this.props;
    const {
      orgList,
      txInfo,
      peerList,
      chaincodeList,
      blockInfo,
    } = chart;

    console.log(this.state);
    console.log(this.props);
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 6,
      style: { marginBottom: 24 },
    };

    const orgListMap = orgList && orgList.channelOrgList.map((item,i)=>{
      return {
        key: i,
        orgName: item
      }
    });
    console.log(orgListMap)
    const orgColumns = [{
      title: '序号',
      dataIndex: 'key'
    },{
      title: '组织名',
      dataIndex: 'orgName',
      // render: (text)=>{
      //   return (<Button type="primary">{text}</Button>)
      // }
    }]
    const txInfoData = txInfo && (txInfo.key=1) &&  [txInfo];
    const txInfoColumns = [{
      title: '交易ID',
      dataIndex: 'txId',
      width: '10%'
    },{
      title: '创建时间',
      dataIndex: 'createTime',
    },{
      title: '交易类型',
      dataIndex: 'type',
      render: (text) => {
        if(!text){
          return '-'
        }
      }
    },{
      title: '交易返回状态码',
      dataIndex: 'responseStatus',
      render: (status)=>{
        if(status === 200){
          return '交易成功'
        }else{
          return '交易失败'
        }
      }
    },{
      title: '返回信息',
      dataIndex: 'responseMsg',
      render: (text) => {
        if(!text){
          return '-'
        }
      }
    },{
      title: '调用的合约信息',
      children: [{
        title: '名称',
        dataIndex: 'chaincode.chaincodeName'
      },{
        title: '参数',
        dataIndex: 'chaincode.args',
        width:'30%'
      },{
        title: '版本',
        dataIndex: 'chaincode.version'
      },{
        title: '执行读写集',
        dataIndex: 'chaincode.rwSet',
        render: (text) => {
          if(!text){
            return '-'
          }
        }
      }]
    }]

    const ToggleMenu = (
      <Menu onClick={this.toggleChannel}>
        {
          this.props.list && this.props.list.channelList ?  this.props.list.channelList.map((item,i) => {
            return (
              <Menu.Item key={item}>
                <a style={{color:'#008dff',cursor:'pointer'}}>{item}</a>
              </Menu.Item>
            )
          }) : ''
        }
      </Menu>
    )

    const detailInfo = (
      <div className={styles.channel}>通道 - {currentChannel}</div>
    );

    const toggleSwitch = (
      <div className={styles.toggleSwitch}>
        <Dropdown  overlay={ToggleMenu} placement="bottomLeft">
          <Button>切换通道 <Icon type="down" /></Button>
        </Dropdown>
      </div>
    );


    const blockListColumns = [{
      title: '区块编号',
      dataIndex: 'blockNumber',
      render: (num) => (
        <a onClick={this.showBlockInfo.bind(this,num)} href="javascript:;">{num}</a>
      )
    },{
      title: '交易数量',
      dataIndex: 'txCount'
    }];
     
    peerList && peerList.map((item,i)=>{
      return peerList[i].key = i;
    });
    const peerListColumns = [{
      title: '节点名称',
      dataIndex: 'name'
    },{
      title: '节点域名',
      dataIndex: 'host'
    },{
      title: '节点地址',
      dataIndex: 'address'
    }];
    
    chaincodeList && chaincodeList.map((item,i)=>{
      return chaincodeList[i].key = i;
    });
    const chaincodeListColumns = [{
      title: '合约名称',
      dataIndex: 'chaincodeName'
    },{
      title: '合约版本',
      dataIndex: 'version'
    },{
      title: '合约路径',
      dataIndex: 'path'
    },{
      title: '策略',
      dataIndex: 'policy',
      width: '40%'
    }]


    return (
      <PageHeaderLayout 
        detailInfo={detailInfo}
        toggleSwitch={toggleSwitch}
        logo={channel}
      >
          <Fragment>
          <Tabs defaultActiveKey="1" className={styles.tabs}>
            <TabPane className={styles.tabChildren} tab={<span><Icon type="file-text" />详情展示</span>} key="1">
            <Row gutter={24}>
            <Col {...topColResponsiveProps}>
            <ChartCard
                bordered={false}
                loading={loading}
                icon={node}
                title="PEER节点数量"
                count={status ? status.peerCount : 0}
              >
              </ChartCard>
            </Col>
            <Col {...topColResponsiveProps}>
            <ChartCard
                bordered={false}
                loading={loading}
                icon={block}
                title="区块高度"
                count={status ? status.latestBlock : 0}
                backgroundImg="#00c0ef"
              >
              </ChartCard>
            </Col>
            <Col {...topColResponsiveProps}>
            <ChartCard
                bordered={false}
                loading={loading}
                icon={tx}
                title="交易数量"
                count={status ? status.txCount : 0}
                backgroundImg="#f39c12"
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
          </Row>
          <Row gutter={24}>
            <Col md={8} xs={24}>
              <div className={styles.blockListTable}>
                <div className={styles.blockTitle}>区块列表</div>
                <Table className={styles.blockTitleTable} loading={loading} pagination={{pageSize:6}} dataSource={channelBlocks} columns={blockListColumns} />
              </div>
            </Col>
            <Col md={16} xs={24}>
            <div className={styles.blockListTable}>
            {
              blockInfo ? (
                <div>
                  <div className={styles.blockTitle}>区块 {blockInfo.number} 的信息</div>
                  <ul className={styles.blockUl}>
                    <li className={styles.blockLi}><Col span={4}><i></i><span className={styles.infoField}>前一区块哈希：</span></Col><Col span={20}><span className={styles.infoCon}>{blockInfo.previousHash}</span></Col></li>
                    <li className={styles.blockLi}><Col span={4}><i></i><span  className={styles.infoField}>数据哈希：</span></Col><Col span={20}><span className={styles.infoCon}>{blockInfo.dataHash}</span></Col></li>
                    <li className={styles.blockLi} style={{paddingBottom:'15px',position:'relative'}}>
                    <Col span={4}>
                    <i></i><span md={6} className={styles.infoField}>交易编号列表：</span>
                    </Col>
                    {/* {
                      blockInfo.transactions.map((item,i) => {
                        return (
                         <a className={styles.listA} href="javascript:;" key={i}><i className={styles.listI}></i>{item}</a>
                        )
                      })
                      
                    } */}
                    <Col span={20}>
                      <List 
                        
                        itemLayout="horizontal"
                        dataSource={blockInfo.transactions}
                        pagination={{pageSize:3}}
                        renderItem={(item,i)=>(
                          <List.Item>
                            <a onClick={this.getTxInfo.bind(this,item)} className={styles.listA} href="javascript:;" key={i}><span className={styles.listI}>{Number(i)+1}.</span>{item}</a>
                          </List.Item>
                        )}
                      />
                      </Col>
                    </li>
                  </ul>
                </div>               
              ) : (<div className={styles.blockTitle}>区块信息</div>)
            }
                
              </div>
            </Col>
            

            <Col md={24} style={{marginTop:'24px'}}>
              <div className={styles.blockListTable}>
                <div className={styles.blockTitle}>交易信息</div>
                <Table loading={loading} bordered pagination={false} rowKey='txId' className={styles.listTable} dataSource={txInfoData} columns={txInfoColumns} />
              </div>
            </Col>

            <Col md={12} xs={24} style={{marginTop:'24px'}}>
              <div className={styles.blockListTable}>
                <div className={styles.blockTitle}>节点信息</div>
                <Table loading={loading} pagination={{pageSize:5}} bordered dataSource={peerList} columns={peerListColumns} />
              </div>
            </Col>

            <Col md={12} xs={24} style={{marginTop:'24px'}}>
              <div className={styles.blockListTable}>
                <div className={styles.blockTitle}>合约列表</div>
                <Table loading={loading} pagination={{pageSize:5}} bordered dataSource={chaincodeList} columns={chaincodeListColumns} />
              </div>
            </Col>

            
          </Row>
            </TabPane>
            <TabPane className={styles.tabChildren} tab={<span><Icon type="line-chart" />交易实时监控</span>} key="2">
              <Row gutter={24}>
                <Col md={24}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>交易秒级监控</div>
                    {timeLineData && timeLineData.length>0 && 
                    <Chart height={window.innerHeight} padding={{left:40,top:30,right:60,bottom:80}} height={350} data={timeLineData} scale={scale} forceFit onGetG2Instance={(g2Chart)=> {chartTIme=g2Chart;}} >
                        <TimeTooltip />
                        {timeLineData.length !== 0 && <Axis />}
                        <Legend />
                        <Geom type="line" position="time*txCount" color={['type', ['#ff7f0e']]} shape="smooth" size={2} />
                    </Chart>}
                    {
                      !timeLineData && <div style={{color:'#ccc',fontSize:'18px',textAlign:'center',padding:'25px'}}>正在初始化数据...</div>
                    }
                  </div>
                </Col>
                <Col md={12} xs={24} style={{marginTop:'24px'}}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>交易分钟级监控</div>
                    {timeLineDataMin && timeLineDataMin.length>0 && 
                    <Chart height={window.innerHeight} padding={{left:40,top:30,right:60,bottom:80}} height={350} data={timeLineDataMin} scale={scale} forceFit onGetG2Instance={(g2Chart)=> {chartTIme=g2Chart;}} >
                        <TimeTooltip />
                        {timeLineDataMin.length !== 0 && <Axis />}
                        <Legend />
                        <Geom type="line" position="time*txCount" color={['type', ['#00a65a']]} shape="smooth" size={2} />
                    </Chart>}
                    {
                      timeLineDataMin.length===0 && <div style={{color:'#ccc',fontSize:'18px',textAlign:'center',padding:'25px'}}>正在初始化数据请等待一分钟...</div>
                    }
                  </div>
                </Col>
                <Col md={12} xs={24} style={{marginTop:'24px'}}>
                  <div className={styles.blockListTable}>
                    <div className={styles.blockTitle}>区块分钟级监控</div>
                    {timeLineDataBlock && timeLineDataBlock.length>0 && 
                    <Chart height={window.innerHeight} padding={{left:40,top:30,right:60,bottom:80}} height={350} data={timeLineDataBlock} scale={scale} forceFit onGetG2Instance={(g2Chart)=> {chartTIme=g2Chart;}} >
                        <TimeTooltip />
                        {timeLineDataBlock.length !== 0 && <Axis />}
                        <Legend />
                        <Geom type="line" position="time*blockCount" color={['type', ['#337ab7']]} shape="smooth" size={2} />
                    </Chart>}
                    {
                      timeLineDataBlock.length===0 && <div style={{color:'#ccc',fontSize:'18px',textAlign:'center',padding:'25px'}}>正在初始化数据请等待一分钟...</div>
                    }
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane className={styles.tabChildren} tab={<span><Icon type="setting" />操作</span>} key="3">
              <Row gutter={24}>
                  <Col md={24}>
                    <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>配置交易ID</div>
                        <UpdateSign />
                    </div>
                  </Col>
                  <Col md={24} style={{marginTop:'24px'}}>
                    <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>组织操作</div>
                        <WrapOperation />
                    </div>
                  </Col>
                  <Col md={24} style={{marginTop:'24px'}}>
                    <div className={styles.blockListTable}>
                        <div className={styles.blockTitle}>创建通道</div>
                        <CreateChannel />
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
