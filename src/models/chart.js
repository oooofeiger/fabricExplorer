import {
  fakeChartData,
  getTxInfo,
  getNetWorkData,
  getBlockInfo,
  getOrgList,
  getChaincodeList,
  getChannelPeerList,
  peerGetChaincodeList,
  peerGetChannelList,
  join2Channel,
  getInstallId,
  chaincodeInstantiate,
  chaincodeUpgrade,
  getOperConfig,
  installedChaincodeList,
  changePeer,
} from '../services/api';
// import { netWorkData } from 'mock/api';

export default {
  namespace: 'chart',

  state: {
    loading: false,
  },

  effects: {
    *chaincodeUpgrade({ payload }, { call, put }) {
      const response = yield call(chaincodeUpgrade, payload);
      yield put({
        type: 'save',
        payload: {
          upgrade: response,
        },
      });
    },
    *chaincodeInstantiate({ payload }, { call, put }) {
      const response = yield call(chaincodeInstantiate, payload);
      yield put({
        type: 'save',
        payload: {
          instantiate: response,
        },
      });
    },
    *getInstallId({ payload }, { call, put }) {
      const response = yield call(getInstallId, payload);
      yield put({
        type: 'save',
        payload: {
          chaincodeId: response.chaincodeId,
        },
      });
    },
    *join2Channel({ payload }, { call, put }) {
      const response = yield call(join2Channel, payload);
      yield put({
        type: 'save',
        payload: {
          join2Channel: response,
        },
      });
    },
    *peerGetChaincodeList({ payload }, { call, put }) {
      const response = yield call(peerGetChaincodeList, payload);
      yield put({
        type: 'save',
        payload: {
          peerChaincodeList: response,
        },
      });
    },
    *peerGetChannelList({ payload }, { call, put }) {
      const response = yield call(peerGetChannelList, payload);
      yield put({
        type: 'save',
        payload: {
          peerChannelList: response,
        },
      });
    },
    *getChannelPeerList({ payload }, { call, put }) {
      const response = yield call(getChannelPeerList, payload);
      yield put({
        type: 'save',
        payload: {
          peerList: response,
        },
      });
    },
    *getChaincodeList({ payload }, { call, put }) {
      const response = yield call(getChaincodeList, payload);
      yield put({
        type: 'save',
        payload: {
          chaincodeList: response,
        },
      });
    },
    *getOrgList({ payload }, { call, put }) {
      const response = yield call(getOrgList, payload);
      yield put({
        type: 'save',
        payload: {
          orgList: response,
        },
      });
    },
    *getTxInfo({ payload }, { call, put }) {
      const response = yield call(getTxInfo, payload);
      yield put({
        type: 'save',
        payload: {
          txInfo: response,
        },
      });
    },
    *getBlockInfo({ payload }, { call, put }) {
      const response = yield call(getBlockInfo, payload);
      console.log('getBlockInfo', response);
      yield put({
        type: 'save',
        payload: {
          blockInfo: response,
        },
      });
    },
    *getNetWorkData({ payload }, { call, put }) {
      const response = yield call(getNetWorkData, payload);
      console.log('netWork', response);
      let nodearr = [
        {
          id: 0,
          label: 'orderer',
          font: { size: 20, color: 'white' },
          shape: 'ellipse',
          color: 'DarkViolet',
        },
      ];
      let edgesarr = [];
      response.organizations &&
        response.organizations.map((item, i) => {
          var node = {
            id: Number(i) + 1,
            label: item.orgName,
            font: { size: 20 },
            shape: 'box',
            to: 0,
          };
          nodearr.push(node);
          if (item.peersName) {
            item.peersName.map((peer, l) => {
              node = {
                id: Number(nodearr.length) + Number(response.organizations.length),
                label: peer,
                font: { size: 20 },
                color: 'lightgreen',
                shape: 'circle',
                to: Number(i) + 1,
              };
              nodearr.push(node);
            });
          }
        });
      nodearr.map((item, i) => {
        if (item.id !== 0) {
          var edge = {
            from: item.id,
            to: item.to,
            arrows: 'to',
          };
          edgesarr.push(edge);
        }
      });
      const data = { nodearr: nodearr, edgesarr: edgesarr };
      console.log(data);
      yield put({
        type: 'save',
        payload: {
          netWorkData: data,
        },
      });
    },
    *getOperConfig({ payload }, { call, put }) {
      const response = yield call(getOperConfig, payload);
      yield put({
        type: 'save',
        payload: {
          downloadOperSetingFile: response,
        },
      });
    },
    *installedChaincodeList({ payload }, { call, put }) {
      const response = yield call(installedChaincodeList, payload);
      yield put({
        type: 'save',
        payload: {
          installedChaincodeList: response,
        },
      });
    },
    *changePeer({ payload }, { call, put }) {
      const response = yield call(changePeer, payload);
      yield put({
        type: 'save',
        payload: {
          changePeer: 'changePeer',
        },
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        netWorkData: {},
      };
    },
  },
};
