import { stringify } from 'qs';
import queryString from 'query-string';
import request from '../utils/request';

const host = window.hostIp;
export async function getChannelList(params) {
  return request('http://' + host + '/channel/list', {
    method: 'POST',
    body: params,
  });
}

export async function getPeerList(params) {
  return request('http://' + host + '/peer/list', {
    method: 'POST',
    body: params,
  });
}

export async function getBlockInfo(params) {
  console.log('formdata', params);
  return request('http://' + host + '/block/getInfo', {
    method: 'POST',
    body: params,
  });
}

export async function getSessionId() {
  return request('http://' + host + '/token', {
    method: 'POST',
  });
}

export async function getOrgList(params) {
  return request('http://' + host + '/channel/orgList', {
    method: 'POST',
    body: params,
  });
}

export async function getTxInfo(params) {
  return request('http://' + host + '/tx/getInfo', {
    method: 'POST',
    body: params,
  });
}

export async function getChannelPeerList(params) {
  return request('http://' + host + '/channel/peerList', {
    method: 'POST',
    body: params,
  });
}

export async function getChaincodeList(params) {
  return request('http://' + host + '/channel/chaincodeList', {
    method: 'POST',
    body: params,
  });
}

export async function getNetWorkData(params) {
  return request('http://' + host + '/network/topology', {
    method: 'POST',
    body: params,
  });
}

export async function peerGetChannelList(params) {
  return request('http://' + host + '/peer/channelList', {
    method: 'POST',
    body: params,
  });
}

export async function peerGetChaincodeList(params) {
  return request('http://' + host + '/peer/chaincodeList', {
    method: 'POST',
    body: params,
  });
}

export async function join2Channel(params) {
  return request('http://' + host + '/network/peer/joinChannel', {
    method: 'POST',
    body: params,
  });
}

export async function getInstallId(params) {
  return request('http://' + host + '/chaincode/install', {
    method: 'POST',
    body: params,
  });
}

export async function chaincodeInstantiate(params) {
  return request('http://' + host + '/chaincode/instantiate', {
    method: 'POST',
    body: params,
  });
}

export async function chaincodeUpgrade(params) {
  return request('http://' + host + '/chaincode/upgrade', {
    method: 'POST',
    body: params,
  });
}

export async function getConfigPeer() {
  return request('http://' + host + '/network/getConfig/peer', {
    method: 'POST',
  });
}

export async function getConfigPeerOrg() {
  return request('http://' + host + '/network/getConfig/peerOrg', {
    method: 'POST',
  });
}

export async function getConfigOrderer() {
  return request('http://' + host + '/network/getConfig/orderer', {
    method: 'POST',
  });
}

export async function getConfigOrdererOrg() {
  return request('http://' + host + '/network/getConfig/ordererOrg', {
    method: 'POST',
  });
}

export async function getConfigCouchdb() {
  return request('http://' + host + '/network/getConfig/couchdb', {
    method: 'POST',
  });
}

export async function getPeerCertId(params) {
  return request('http://' + host + '/network/peer/set', {
    method: 'POST',
    body: params,
  });
}

export async function getOrdererCertId(params) {
  return request('http://' + host + '/network/orderer/set', {
    method: 'POST',
    body: params,
  });
}

export async function getPeerOrgCertId(params) {
  return request('http://' + host + '/network/peerOrg/set', {
    method: 'POST',
    body: params,
  });
}

export async function peerOrgDownload(params) {
  return request('http://' + host + '/network/peerOrg/cert/download', {
    method: 'POST',
    body: params,
  });
}

export async function peerOrgDelete(params) {
  return request('http://' + host + '/network/peerOrg/delete', {
    method: 'POST',
    body: params,
  });
}

export async function getOrdererOrgCertId(params) {
  return request('http://' + host + '/network/ordererOrg/set', {
    method: 'POST',
    body: params,
  });
}

export async function ordererOrgDownload(params) {
  return request('http://' + host + '/network/ordererOrg/cert/download', {
    method: 'POST',
    body: params,
  });
}

export async function ordererOrgDelete(params) {
  return request('http://' + host + '/network/ordererOrg/delete', {
    method: 'POST',
    body: params,
  });
}

export async function setCouchdb(params) {
  return request('http://' + host + '/network/couchdb/set', {
    method: 'POST',
    body: params,
  });
}

export async function couchdbDelete(params) {
  return request('http://' + host + '/network/couchdb/delete', {
    method: 'POST',
    body: params,
  });
}

export async function managePeer(params) {
  return request('http://' + host + '/network/peer/manage', {
    method: 'POST',
    body: params,
  });
}

export async function ordererDownload(params) {
  return request('http://' + host + '/network/orderer/cert/download', {
    method: 'POST',
    body: params,
  });
}

export async function ordererDelete(params) {
  return request('http://' + host + '/network/orderer/delete', {
    method: 'POST',
    body: params,
  });
}

export async function generateOrdererCert(params) {
  return request('http://' + host + '/network/orderer/cert/generate', {
    method: 'POST',
    body: params,
  });
}

export async function manageCouchdb(params) {
  return request('http://' + host + '/network/couchdb/manage', {
    method: 'POST',
    body: params,
  });
}

export async function couchdbDeploy(params) {
  return request('http://' + host + '/network/couchdb/deploy', {
    method: 'POST',
    body: params,
  });
}

export async function peerDownload(params) {
  return request('http://' + host + '/network/peer/cert/download', {
    method: 'POST',
    body: params,
  });
}

export async function peerDelete(params) {
  return request('http://' + host + '/network/peer/delete', {
    method: 'POST',
    body: params,
  });
}

export async function peerDeploy(params) {
  return request('http://' + host + '/network/peer/deploy', {
    method: 'POST',
    body: params,
  });
}

export async function generatePeerCert(params) {
  return request('http://' + host + '/network/peer/cert/generate', {
    method: 'POST',
    body: params,
  });
}

export async function peerImageVersion() {
  return request('http://' + host + '/network/imageVersion/peer', {
    method: 'POST',
  });
}

export async function ordererImageVersion() {
  return request('http://' + host + '/network/imageVersion/orderer');
}

export async function couchdbImageVersion() {
  return request('http://' + host + '/network/imageVersion/couchdb');
}

export async function setSystem(params) {
  return request('http://' + host + '/system/configure/set', {
    method: 'POST',
    body: params,
  });
}

export async function createChannel(params) {
  return request('http://' + host + '/createChannel', {
    method: 'POST',
    body: params,
  });
}

export async function addOrg(params) {
  return request('http://' + host + '/channel/org/add', {
    method: 'POST',
    body: params,
  });
}

export async function deleteOrg(params) {
  return request('http://' + host + '/channel/org/delete', {
    method: 'POST',
    body: params,
  });
}

export async function getSystemConfigure() {
  return request('http://' + host + '/system/configure/get', {
    method: 'POST',
  });
}

export async function peerOrgGet() {
  return request('http://' + host + '/network/peerOrg/get', {
    method: 'POST',
  });
}

export async function peerGet(params) {
  return request('http://' + host + '/network/peer/get', {
    method: 'POST',
    body: params,
  });
}

export async function ordererOrgGet(params) {
  return request('http://' + host + '/network/ordererOrg/get', {
    method: 'POST',
    body: params,
  });
}

export async function ordererGet(params) {
  return request('http://' + host + '/network/orderer/get', {
    method: 'POST',
    body: params,
  });
}

export async function couchdbGet(params) {
  return request('http://' + host + '/network/couchdb/get', {
    method: 'POST',
    body: params,
  });
}

export async function updateSign(params) {
  return request('http://' + host + '/channel/update/sign', {
    method: 'POST',
    body: params,
  });
}

export async function updateSubmit(params) {
  return request('http://' + host + '/channel/update/submit', {
    method: 'POST',
    body: params,
  });
}

export async function getOperConfig() {
  return request('http://' + host + '/channel/org/config/get');
}

export async function getChannelOperSubmitId(params) {
  return request('http://' + host + '/channel/update/submit/info', {
    method: 'POST',
    body: params,
  });
}

export async function submitOk(params) {
  return request('http://' + host + `/channel/update/submit/${params.submitId}`);
}

export async function installedChaincodeList(params) {
  return request('http://' + host + '/peer/chaincodeList/installed', {
    method: 'POST',
    body: params,
  });
}

export async function changePeer(params) {
  return request('http://' + host + '/changePeer', {
    method: 'POST',
    body: params,
  });
}

export async function getDeployPeer() {
  return request('http://' + host + '/network/getConfig/peer/deployed', {
    method: 'POST',
  });
}

export async function getPeerNotDeploy() {
  return request('http://' + host + '/network/peer/notDeploy', {
    method: 'POST',
  });
}
