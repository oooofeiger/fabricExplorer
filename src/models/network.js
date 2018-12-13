import {
  peerGetChannelList,
  getConfigPeer,
  getConfigPeerOrg,
  getConfigOrderer,
  getConfigOrdererOrg,
  getConfigCouchdb,
  getPeerCertId,
  getOrdererCertId,
  getPeerOrgCertId,
  peerOrgDelete,
  peerOrgDownload,
  getOrdererOrgCertId,
  ordererOrgDelete,
  ordererOrgDownload,
  setCouchdb,
  couchdbDelete,
  managePeer,
  ordererDownload,
  ordererDelete,
  generateOrdererCert,
  manageCouchdb,
  peerDownload,
  peerDelete,
  generatePeerCert,
  peerDeploy,
  couchdbDeploy,
  peerImageVersion,
  ordererImageVersion,
  couchdbImageVersion,
  setSystem,
  addOrg,
  deleteOrg,
  createChannel,
  getSystemConfigure,
  peerOrgGet, //获取配置信息
  peerGet,
  ordererOrgGet,
  ordererGet,
  couchdbGet,
  updateSign,
  updateSubmit,
  getOperConfig,
  getChannelList,
  getChannelOperSubmitId,
  submitOk,
  getDeployPeer,
  getPeerNotDeploy,
} from '../services/api';

export default {
  namespace: 'network',
  state: {
    loading: false,
  },
  effects: {
    *peerGetChannelList({ payload }, { call, put }) {
      const response = yield call(peerGetChannelList, payload);
      yield put({
        type: 'save',
        payload: {
          peerChannelList: response,
        },
      });
    },
    *getConfigPeer(_, { call, put }) {
      const response = yield call(getConfigPeer);
      yield put({
        type: 'save',
        payload: {
          peerConfig: response,
        },
      });
    },
    *getConfigPeerOrg(_, { call, put }) {
      const response = yield call(getConfigPeerOrg);
      yield put({
        type: 'save',
        payload: {
          peerOrgConfig: response,
        },
      });
    },
    *getConfigOrderer(_, { call, put }) {
      const response = yield call(getConfigOrderer);
      yield put({
        type: 'save',
        payload: {
          ordererConfig: response,
        },
      });
    },
    *getConfigOrdererOrg(_, { call, put }) {
      const response = yield call(getConfigOrdererOrg);
      yield put({
        type: 'save',
        payload: {
          ordererOrgConfig: response,
        },
      });
    },
    *getConfigCouchdb(_, { call, put }) {
      const response = yield call(getConfigCouchdb);
      yield put({
        type: 'save',
        payload: {
          couchdbConfig: response,
        },
      });
    },
    *getPeerCertId({ payload }, { call, put }) {
      const response = yield call(getPeerCertId, payload);
      yield put({
        type: 'save',
        payload: {
          peerCertId: response,
        },
      });
    },
    *getOrdererCertId({ payload }, { call, put }) {
      const response = yield call(getOrdererCertId, payload);
      yield put({
        type: 'save',
        payload: {
          ordererCertId: response,
        },
      });
    },
    *getPeerOrgCertId({ payload }, { call, put }) {
      const response = yield call(getPeerOrgCertId, payload);
      yield put({
        type: 'save',
        payload: {
          peerOrgCertId: response,
        },
      });
    },
    *peerOrgDownload({ payload }, { call, put }) {
      const response = yield call(peerOrgDownload, payload);
      yield put({
        type: 'save',
        payload: {
          peerOrgDownload: response,
        },
      });
    },
    *peerOrgDelete({ payload }, { call, put }) {
      const response = yield call(peerOrgDelete, payload);
      yield put({
        type: 'save',
        payload: {
          peerOrgDelete: response,
        },
      });
    },
    *getOrdererOrgCertId({ payload }, { call, put }) {
      const response = yield call(getOrdererOrgCertId, payload);
      yield put({
        type: 'save',
        payload: {
          ordererOrgCertId: response,
        },
      });
    },
    *ordererOrgDownload({ payload }, { call, put }) {
      const response = yield call(ordererOrgDownload, payload);
      yield put({
        type: 'save',
        payload: {
          peerOrgDownload: response,
        },
      });
    },
    *ordererOrgDelete({ payload }, { call, put }) {
      const response = yield call(ordererOrgDelete, payload);
      yield put({
        type: 'save',
        payload: {
          peerOrgDelete: response,
        },
      });
    },
    *setCouchdb({ payload }, { call, put }) {
      const response = yield call(setCouchdb, payload);
      yield put({
        type: 'save',
        payload: {
          setCouchdb: response,
        },
      });
    },
    *couchdbDelete({ payload }, { call, put }) {
      const response = yield call(couchdbDelete, payload);
      yield put({
        type: 'save',
        payload: {
          couchdbDelete: response,
        },
      });
    },
    *couchdbDeploy({ payload }, { call, put }) {
      const response = yield call(couchdbDeploy, payload);
      yield put({
        type: 'save',
        payload: {
          couchdbDeploy: response,
        },
      });
    },
    *managePeer({ payload }, { call, put }) {
      const response = yield call(managePeer, payload);
      yield put({
        type: 'save',
        payload: {
          managePeer: response,
        },
      });
    },
    *ordererDownload({ payload }, { call, put }) {
      const response = yield call(ordererDownload, payload);
      yield put({
        type: 'save',
        payload: {
          ordererDownload: response,
        },
      });
    },
    *ordererDelete({ payload }, { call, put }) {
      const response = yield call(ordererDelete, payload);
      yield put({
        type: 'save',
        payload: {
          ordererDelete: response,
        },
      });
    },
    *generateOrdererCert({ payload }, { call, put }) {
      const response = yield call(generateOrdererCert, payload);
      yield put({
        type: 'save',
        payload: {
          generateOrdererCert: response,
        },
      });
    },
    *manageCouchdb({ payload }, { call, put }) {
      const response = yield call(manageCouchdb, payload);
      yield put({
        type: 'save',
        payload: {
          manageCouchdb: response,
        },
      });
    },
    *peerDownload({ payload }, { call, put }) {
      const response = yield call(peerDownload, payload);
      yield put({
        type: 'save',
        payload: {
          peerDownload: response,
        },
      });
    },
    *peerDelete({ payload }, { call, put }) {
      const response = yield call(peerDelete, payload);
      yield put({
        type: 'save',
        payload: {
          peerDelete: response,
        },
      });
    },
    *peerDeploy({ payload }, { call, put }) {
      const response = yield call(peerDeploy, payload);
      yield put({
        type: 'save',
        payload: {
          peerDeploy: response,
        },
      });
    },
    *generatePeerCert({ payload }, { call, put }) {
      const response = yield call(generatePeerCert, payload);
      console.log('blob', response);
      if (typeof response === 'object') {
        yield put({
          type: 'save',
          payload: {
            generatePeerCert: response,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            generatePeerCertBlob: response,
            generatePeerCertTime: new Date().getTime(),
          },
        });
      }
    },
    *peerImageVersion(_, { call, put }) {
      const response = yield call(peerImageVersion);
      const { results } = response;
      const data = results.map((item, i) => {
        return item.name;
      });
      yield put({
        type: 'save',
        payload: {
          peerImageVersion: data,
        },
      });
    },
    *ordererImageVersion(_, { call, put }) {
      const response = yield call(ordererImageVersion);
      const { results } = response;
      const data = results.map((item, i) => {
        return item.name;
      });
      yield put({
        type: 'save',
        payload: {
          ordererImageVersion: data,
        },
      });
    },
    *couchdbImageVersion(_, { call, put }) {
      const response = yield call(couchdbImageVersion);
      const { results } = response;
      const data = results.map((item, i) => {
        return item.name;
      });
      yield put({
        type: 'save',
        payload: {
          couchdbImageVersion: data,
        },
      });
    },
    *setSystem({ payload }, { call, put }) {
      const response = yield call(setSystem, payload);
      yield put({
        type: 'save',
        payload: {
          setSystem: response,
        },
      });
    },
    *createChannel({ payload }, { call, put }) {
      const response = yield call(createChannel, payload);
      yield put({
        type: 'save',
        payload: {
          createChannel: response,
        },
      });
    },
    *addOrg({ payload }, { call, put }) {
      const response = yield call(addOrg, payload);
      yield put({
        type: 'save',
        payload: {
          fileId: response.fileId,
        },
      });
    },
    *deleteOrg({ payload }, { call, put }) {
      const response = yield call(deleteOrg, payload);
      yield put({
        type: 'save',
        payload: {
          deleteOrg: response,
        },
      });
    },
    *getSystemConfigure({ payload }, { call, put }) {
      const response = yield call(getSystemConfigure, payload);
      yield put({
        type: 'save',
        payload: {
          systemConfigure: response,
        },
      });
    },
    *peerOrgGet(_, { call, put }) {
      const response = yield call(peerOrgGet);
      yield put({
        type: 'save',
        payload: {
          peerOrgGet: response,
        },
      });
    },
    *peerGet({ payload }, { call, put }) {
      const response = yield call(peerGet, payload);
      yield put({
        type: 'save',
        payload: {
          peerGet: response,
        },
      });
    },
    *ordererOrgGet({ payload }, { call, put }) {
      const response = yield call(ordererOrgGet, payload);
      yield put({
        type: 'save',
        payload: {
          ordererOrgGet: response,
        },
      });
    },
    *ordererGet({ payload }, { call, put }) {
      const response = yield call(ordererGet, payload);
      yield put({
        type: 'save',
        payload: {
          ordererGet: response,
        },
      });
    },
    *couchdbGet({ payload }, { call, put }) {
      const response = yield call(couchdbGet, payload);
      yield put({
        type: 'save',
        payload: {
          couchdbGet: response,
        },
      });
    },
    *updateSign({ payload }, { call, put }) {
      const response = yield call(updateSign, payload);
      yield put({
        type: 'save',
        payload: {
          updateSign: response,
        },
      });
    },
    *updateSubmit({ payload }, { call, put }) {
      const response = yield call(updateSubmit, payload);
      yield put({
        type: 'save',
        payload: {
          updateSubmit: response,
        },
      });
    },
    *getOperConfig(_, { call, put }) {
      const response = yield call(getOperConfig);
      yield put({
        type: 'save',
        payload: {
          downloadOperSetingFile: response,
        },
      });
    },
    *getChannelList(_, { call, put }) {
      const response = yield call(getChannelList);
      yield put({
        type: 'save',
        payload: {
          channelList: response,
        },
      });
    },
    *getChannelOperSubmitId({ payload }, { call, put }) {
      const response = yield call(getChannelOperSubmitId, payload);
      yield put({
        type: 'save',
        payload: {
          submitId: response,
        },
      });
    },
    *submitOk({ payload }, { call, put }) {
      const response = yield call(submitOk, payload);
      yield put({
        type: 'save',
        payload: {
          submitOk: response,
        },
      });
    },
    *getDeployPeer(_, { call, put }) {
      const response = yield call(getDeployPeer);
      console.log('response', response);
      yield put({
        type: 'save',
        payload: {
          deployPeer: response,
        },
      });
    },
    *getPeerNotDeploy(_, { call, put }) {
      const response = yield call(getPeerNotDeploy);
      yield put({
        type: 'save',
        payload: {
          peerNotDeploy: response.peersName,
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
  },
};
