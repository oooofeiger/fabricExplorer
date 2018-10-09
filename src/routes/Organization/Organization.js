import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
} from 'antd';
import {
  ChartCard,
  NetworkGraph
} from 'components/Charts';
import {heartTickStatus as heartTick} from '../../common/heartTick';

import styles from './Organization.less';
import triangle from '../../assets/右三角形.png';
import node from '../../assets/节点.png';



@connect(({ chart, loading }) => {
  console.log(loading)
  return {
      chart,
      loading: loading.effects['chart/getNetWorkData'],
    }
} )
export default class Organization extends Component {
  constructor(props){
    super(props);
    this.state = {
      statusSwitch: true,
      netWorkSwitch: true,
      isCurrent: false,
    };
    this.wsStatus = null;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.setState({
      isCurrent: true,
    })
  }

  componentDidUpdate(){
    const that = this;
    if(!this.props.sessionId) return;
    const { dispatch } = this.props;
    const { token } = this.props.sessionId;
    if(this.props.list && this.state.statusSwitch && token){
      const { channelList , peerList } = this.props.list;
      if(typeof(WebSocket) === "undefined") {
        alert("您的浏览器不支持WebSocket");
      }
      if(this.wsStatus && this.wsStatus.readyState !== 3){
        return;
      } 
      this.wsStatus = new WebSocket(`ws://192.168.32.116:8080/websocket/status/${token}/organization/${channelList[0]}/${peerList[0].name}`);
      this.wsStatus.onopen = function(){
        console.log('websocket已经连接');
        console.log('this.wsStatus',that.wsStatus)
        heartTick.start(this,token);
        // that.wsStatus.send(`organization,${channelList[0]},${peerList[0].name},${sessionId.sessionId}`);
      }
      
      this.wsStatus.onmessage = function(msg){
        heartTick.reset(this,token);
        console.log('websocket',JSON.parse(msg.data));
        const data = JSON.parse(msg.data);
        if(data.token) return;
        that.setState({
          status: data,
          statusSwitch: false,
          token: token
        })
      }
    
      this.wsStatus.onclose = function(msg){
        console.log('关闭了websocket');
        that.reconnect(token,'organization',channelList[0],peerList[0].name);
      }

      this.wsStatus.onerror = function(){
        console.log('websocket发生错误');
        that.reconnect(token,'organization',channelList[0],peerList[0].name);
      }
    }

    if(token && this.state.netWorkSwitch){
      console.log('netWorkSwitchnetWorkSwitchnetWorkSwitch')
      dispatch({
        type: 'chart/getNetWorkData',
        token: token
      });
      this.setState({
        netWorkSwitch: false
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

  reconnect = (token,sectionName,channelName,peerName) => {
    console.log('重连websocket')
    this.wsStatus = new WebSocket(`ws://192.168.32.116:8080/websocket/status/${token}/${sectionName}/${channelName}/${peerName}`);
  }
  

  render() {
    console.log('this.props',this.props)
    console.log('this.state',this.state)
    const { status } = this.state;
    const { chart, loading } = this.props;
    const {
      netWorkData,
      channelList,
      peerList
    } = chart;

    const topColResponsiveProps = {
      xs: 24,
      sm: 24,
      md: 12,
      lg: 12,
      xl: 12,
      style: { marginBottom: 24 },
    };

    return (
      <Fragment>
        <Row gutter={24}>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              icon={node}
              title={"PEER节点数量"}
              count={status ? status.peerCount : 0}
            >
            </ChartCard>
          </Col>
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
        </Row>

        <Row>
          <Col md={24}>
          <div className={styles.netWorkTitle}>组织结构图</div>
          <div ref={this.netWorkWrap}>
          {
            netWorkData && JSON.stringify(netWorkData)!=='{}' ? <NetworkGraph  data={netWorkData}  /> : ''
          }
            
          </div>
          
          </Col>
        </Row>
      </Fragment>
    );
  }
}
