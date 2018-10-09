import React from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Button,
  Input,
  Form,
} from 'antd';

import styles from './operation.less';


@connect(({ network }) => {
    return {
        network
        }
} )
class Operation extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            addOrg:'',
            deleteOrg: ''
        }
        this.addBlur = this.addBlur.bind(this);
        this.deleteBlur = this.deleteBlur.bind(this);
        this.addOrg = this.addOrg.bind(this);
        this.deleteOrg = this.deleteOrg.bind(this);
    }

    addBlur = (e) => {
        console.log(e)
        this.setState({
            addOrg:e.target.value
        })
    }

    deleteBlur = (e) => {
        console.log(e)
        this.setState({
            deleteOrg:e.target.value
        })
    }

    addOrg = () => {
        const { dispatch } = this.props;
        const orgName = this.state.addOrg;
        dispatch({
            type: 'network/addOrg',
            payload: {
                orgName
            }
        })
    }

    deleteOrg = () => {
        const { dispatch } = this.props;
        const orgName = this.state.deleteOrg;
        if(confirm('确定删除吗？')){
            dispatch({
                type: 'network/deleteOrg',
                payload: {
                    orgName
                }
            })
        }
        
    }

    render(){
        return (
            <div>
                <Row className={styles.row}>
                    <Col className={styles.label} offset={6} span={2}>添加组织：</Col>
                    <Col span={6}><Input onBlur={this.addBlur} /></Col>
                    <Col style={{marginLeft:'15px'}} span={2}><Button block onClick={this.addOrg} type="primary">添加</Button></Col>
                </Row>
                <Row className={styles.row}>
                    <Col className={styles.label} offset={6} span={2}>删除组织：</Col>
                    <Col span={6}><Input onBlur={this.deleteBlur} /></Col>
                    <Col style={{marginLeft:'15px'}} span={2}><Button block onClick={this.deleteOrg} type="danger">删除</Button></Col>
                </Row>

            </div>
            
        )
    }
}
const WrapOperation = Form.create()(Operation);
export default WrapOperation;