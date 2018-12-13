import { getChannelList, getPeerList, getSessionId } from '../services/api';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
  },

  effects: {
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
    *getChannelAndPeerList({ payload }, { call, put }) {
      const channelList = yield call(getChannelList, payload);
      const peerList = yield call(getPeerList, payload);
      yield put({
        type: 'saveChannelAndPeerList',
        payload: {
          channelList: channelList,
          peerList: peerList,
        },
      });
    },
    *getSessionId(_, { call, put }) {
      const response = yield call(getSessionId);
      console.log('11111111111', response);
      yield put({
        type: 'saveSessionId',
        payload: response,
      });
    },
  },

  reducers: {
    saveSessionId(state, { payload }) {
      return {
        ...state,
        sessionId: payload,
      };
    },
    saveChannelAndPeerList(state, { payload }) {
      return {
        ...state,
        list: payload,
      };
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
