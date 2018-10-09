import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import {heartTickBlock, heartTickMessage} from '../common/heartTick';
import logo from '../assets/favicon.ico';

const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};

getMenuData().forEach(getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

var timeLineData=[{
  time: new Date().getTime(),
  txCount: 0,
  type: '交易量'
}];  //交易秒级监控数据
var timeLineDataMin=[{
  time: new Date().getTime(),
  txCount: 0,
  type: '交易量'
}];  //交易分钟级监控数据
var timeLineDataBlock=[{
  time: new Date().getTime(),
  blockCount: 0,
  type: '区块数量'
}];  //区块分钟级监控数据
let timer = null;  //交易秒级监控
let timerMin = null; //交易分钟级监控
let timerBlock = null; //区块分钟级监控
let dataSource = [];   //一个时间节点内接收到的数据
let dataSourceMin = [];
let dataSourceBlock = [];

let isMobile;
enquireScreen(b => {
  isMobile = b;
});
const host = '192.168.32.116:8080';
@connect(({ user, chart, global = {}, loading }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  list: global.list,
  sessionId: global.sessionId,
  chart
}))
export default class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  constructor(props){
    super(props);
    this.state = {
      isMobile,
      messageSwitch: true,
      blockSwitch: true,
    }
    this.message = null;
    this.wsBlock = null;
  }

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  }

  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
    });
    dispatch({
      type: 'global/getChannelAndPeerList',
    });
    dispatch({
      type: 'global/getSessionId',
    });
  }

  componentDidUpdate(){ 
    if(!this.props.sessionId) return;
    const { dispatch } = this.props;
    const { token } = this.props.sessionId;
    const that = this;


    

    if(this.state.messageSwitch && token){
      if(typeof(WebSocket) === "undefined") {
        alert("您的浏览器不支持WebSocket");
      }
      if(this.message && this.message.readyState !== 3){
        return;
      } 
      this.message = new WebSocket(`ws://${host}/websocket/message/${token}`);
      this.message.onopen = function(){
        console.log('websocket已经连接');
        console.log('this.message',that.message)
        heartTickMessage.start(this,token);
      }
      
      this.message.onmessage = function(msg){
        heartTickMessage.reset(this,token);
        console.log('websocket',JSON.parse(msg.data));
        const data = JSON.parse(msg.data);
        if(data.token) return;
        message.info(data.message)
      }
    
      this.message.onclose = function(msg){
        console.log('关闭了websocket');
        that.reconnect(token);
      }

      this.message.onerror = function(){
        console.log('websocket发生错误');
        that.reconnect(token);
      }

      this.setState({
          messageSwitch: false
      })
    }

    let initBlock = true;
    if(this.state.currentChannel && this.state.blockSwitch && token){
      console.log(this.state);    
      
      this.socketBlocks(token,this.state.currentChannel,initBlock, dataSource );
    }
  }

  reconnect = (token) => {
    console.log('重连websocket')
    this.wsStatus = new WebSocket(`ws://${host}/websocket/message/${token}`);
  }

  socketBlocks = (token,channelName) => {
    const { dispatch } = this.props;
    const that = this;
    if(this.wsBlock && this.wsBlock.readyState !== 3){
      // this.wsBlock.close();
      return;
    } 
    this.wsBlock = new WebSocket(`ws://192.168.32.116:8080/websocket/block/${token}/${channelName}`);
    this.wsBlock.onopen = function(){
      console.log('this.wsBlock',this)
      console.log('socketBlock已经连接');
      heartTickBlock.start(this,token);
    } 
    
    this.wsBlock.onmessage = function(msg){
      console.log('socketblock正在接受消息')
      heartTickBlock.reset(this,token);
      let data = JSON.parse(msg.data);
      console.log(data)
      if(!data.token){
          dataSource.push(data);
          dataSourceMin.push(data);
          dataSourceBlock.push(data);
          localStorage.setItem('cacheBlock',JSON.stringify(dataSource))
          that.setState({
            channelBlocks: dataSource,
            blockSwitch: false,
            txData: data,
          })
        
      }

      
      
      !(timer) && (timer = setInterval(()=>{
        
        var now = new Date();
        var time = now.getTime();
        console.log(now.toLocaleTimeString())
        if (timeLineData.length >= 10) {
          timeLineData.shift();
        }
        if(dataSource.length===0){
          timeLineData.push({
            time: time,
            txCount: 0,
            type: '交易量'
          })
        }else{
          let count=0;
          dataSource.map((item,i)=>{
            count+= (+item.txCount)
          })
          timeLineData.push({
            time: time,
            txCount: count,
            type: '交易量'
          })
        }
        console.log('timeLineData',timeLineData[timeLineData.length-1])
        that.setState({
          timeLineData:timeLineData,
          timeTick:timeLineData[timeLineData.length-1]
        })
        dataSource = [];
      },5000))


      !timerMin && (timerMin = setInterval(()=>{
        
        var now = new Date();
        var time = now.getTime();
        console.log(now.toLocaleTimeString())
        if (timeLineDataMin.length >= 10) {
          timeLineDataMin.shift();
        }
        if(dataSourceMin.length===0){
          timeLineDataMin.push({
            time: time,
            txCount: 0,
            type: '交易量'
          })
        }else{
          let count=0;
          dataSourceMin.map((item,i)=>{
            count+= (+item.txCount)
          })
          timeLineDataMin.push({
            time: time,
            txCount: count,
            type: '交易量'
          })
        }
        console.log('timeLineDataMin',timeLineDataMin)
        dataSourceMin = [];
      },60000))

      !timerBlock && (timerBlock = setInterval(()=>{
        
        var now = new Date();
        var time = now.getTime();
        console.log(now.toLocaleTimeString())
        if (timeLineDataBlock.length >= 10) {
          timeLineDataBlock.shift();
        }
        if(dataSourceBlock.length===0){
          timeLineDataBlock.push({
            time: time,
            blockCount: 0,
            type: '区块数量'
          })
        }else{
          timeLineDataBlock.push({
            time: time,
            blockCount: dataSourceBlock.length,
            type: '区块数量'
          })
        }
        console.log('timeLineDataBlock',timeLineDataBlock)
        dataSourceBlock = [];
      },60000))


    }

    this.wsBlock.onclose = function(msg){
      console.log('关闭了socketBlock');
      that.reconnetBlock(token,channelName);
    }

    this.wsBlock.onerror = function(){
      console.log('wsBlock发生错误');
      that.reconnetBlock(token,channelName);
    }
  }
  reconnetBlock = (token,channelName) => {
    console.log('准备重连wsBlock');
    this.wsBlock = new WebSocket(`ws://192.168.32.116:8080/websocket/block/${token}/${channelName}`);
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  getCurrentChannel = (value) => {
    this.setState({
      currentChannel: value,
      blockSwitch: true
    })
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    console.log('title',this.props)
    let title = 'HYPERLEDGER EXPLORER';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `${currRouterData.name} - HYPERLEDGER EXPLORER`;
    }
    return title;
  }

  getBaseRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData } = this.props;
      // get the first authorized route path in routerData
      const authorizedPath = Object.keys(routerData).find(
        item => check(routerData[item].authority, item) && item !== '/'
      );
      return authorizedPath;
    }
    return redirect;
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  handleNoticeClear = type => {
    message.success(`清空了${type}`);
    const { dispatch } = this.props;
    dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'triggerError') {
      dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  handleNoticeVisibleChange = visible => {
    const { dispatch } = this.props;
    if (visible) {
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  render() {
    const {
      currentUser,
      collapsed,
      fetchingNotices,
      notices,
      routerData,
      match,
      location,
      list,
      sessionId,
      chart
    } = this.props;
    const { channelBlocks } = this.state;
    console.log('basicProps',this.props)
    const { isMobile: mb } = this.state;
    const baseRedirect = this.getBaseRedirect();
    const layout = (
      <Layout>
        <SiderMenu
          logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          // If you do not have the Authorized parameter
          // you will be forced to jump to the 403 interface without permission
          Authorized={Authorized}
          menuData={getMenuData()}
          collapsed={collapsed}
          location={location}
          isMobile={mb}
          onCollapse={this.handleMenuCollapse}
        />
        <Layout>
          <Header style={{ padding: 0,zIndex:'2' }}>
            <GlobalHeader
              logo={logo}
              currentUser={currentUser}
              fetchingNotices={fetchingNotices}
              notices={notices}
              collapsed={collapsed}
              isMobile={mb}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
            />
          </Header>
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <Switch>
              {redirectData.map(item => (
                <Redirect key={item.from} exact from={item.from} to={item.to} />
              ))}
              {getRoutes(match.path, routerData).map(item => (
                <AuthorizedRoute
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                  authority={item.authority}
                  redirectPath="/exception/403"
                  list={list}
                  sessionId={sessionId}
                  getCurrentChannel={this.getCurrentChannel}
                  timeLineData={timeLineData}
                  timeLineDataMin={timeLineDataMin}
                  timeLineDataBlock={timeLineDataBlock}
                  channelBlocks={channelBlocks}
                  
                />
              ))}
              <Redirect exact from="/" to={baseRedirect} />
              <Route render={NotFound} />
            </Switch>
          </Content>
          <Footer style={{ padding: 0 }}>
            <GlobalFooter
              copyright={
                <Fragment>
                  Copyright <Icon type="copyright" /> 2018 试金石信用
                </Fragment>
              }
            />
          </Footer>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}
