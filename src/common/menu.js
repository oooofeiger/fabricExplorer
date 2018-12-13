import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: '组织',
    icon: 'appstore',
    path: 'organization',
  },
  {
    name: '通道',
    icon: 'inbox',
    path: 'channel',
  },
  {
    name: 'Peer节点',
    icon: 'share-alt',
    path: 'peer',
  },
  {
    name: '网络管理',
    icon: 'global',
    path: 'network',
    children: [
      {
        name: 'peer组织',
        path: 'peerOrg',
      },
      {
        name: 'peer节点',
        path: 'peer',
      },
      {
        name: 'orderer组织',
        path: 'ordererOrg',
      },
      {
        name: 'orderer节点',
        path: 'orderer',
      },
      {
        name: 'couchdb节点',
        path: 'couchdb',
      },
      {
        name: '系统设置',
        path: 'systemSetting',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
