import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Button, Input, Form, Row, message, Upload, Icon } from 'antd';
import { clearSpacing } from '../../utils/utils';

const FormItem = Form.Item;

function beforeUpload(file) {
    const fileName = file.name;
    const matchArr = fileName.split('.');
    if(!matchArr){
      message.error('只能上传pb格式的文件！');
      return false;
    }else{
      const type = matchArr[matchArr.length-1];
      if (type !== 'pb') {
          message.error('只能上传pb格式的文件！');
          return false;
        }
    }
}

const host = window.hostIp;
@connect(({ network }) => {
  return {
    network,
  };
})
class UpdateSign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };
    this.downloadFile = React.createRef();
    this.customRequest = this.customRequest.bind(this);
    // this.sign = this.sign.bind(this);
    // this.handleSubmit = this.sign.bind(this);
  }

  customRequest = file => {
    const { network, form } = this.props;
    const formData = new FormData();
    const fileUrl = `http://${host}/channel/update/sign`;
    formData.append('file', file.file);

    const fileName = `sign_${file.file.name}`;
    const option = {
      method: 'POST',
      body: formData,
      processData: false,
      responseType: 'blob',
    };

    fetch(fileUrl, option)
      .then(res => {
        if (res.status !== 200) {
          message.error(res.message);
          return;
        }
        return res.blob({ type: 'application/octet-stream' });
      })
      .then(res => {
        const downloadFile = this.downloadFile.current;
        const href = window.URL.createObjectURL(res);
        ReactDOM.render(<a href={href} download={fileName} />, downloadFile);
        downloadFile.querySelector('a').click();
        const { fileList } = this.state;
        fileList[0].status = 'done';
        this.setState({
          fileList,
        });
      });

    return {
      abort() {
        console.log('upload progress is aborted.');
      },
    };
  };

  handleChange = info => {
    let { fileList, file } = info;
    fileList = fileList.slice(-1);
    this.setState({
      fileList,
    });

    // if (file.response) {
    //   const data = new Blob([file.response]);
    //   const downloadFile = this.downloadFile.current;
    //   const href = window.URL.createObjectURL(data);
    //   ReactDOM.render(<a href={href} download="sign.pb" />, downloadFile);
    //   downloadFile.querySelector('a').click();
    // }
  };
  render() {
    const { fileList } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;

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
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="上传操作的pb文件">
            {getFieldDecorator('file', {
              valuePropName: 'file',
            })(
              <Upload
                name="file"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={this.handleChange}
                customRequest={this.customRequest}
                // action={`http://${host}/channel/update/sign`}
              >
                <Button>
                  <Icon type="upload" /> 上传pb文件并下载签名文件
                </Button>
              </Upload>
            )}
          </FormItem>
          {/* <FormItem
                        wrapperCol={{ span: 8, offset: 8 }}
                        >
                        <Row gutter={50}>
                            <Col span={12}>
                                <Button type="primary" block onClick={this.sign}>签名</Button>
                            </Col>
                            <Col span={12}>
                                <Button type="primary" block htmlType="submit">提交</Button>
                            </Col>
                        </Row>
                    </FormItem> */}
        </Form>
        <div ref={this.downloadFile} />
      </div>
    );
  }
}
const WrapUpdateSign = Form.create()(UpdateSign);
export default WrapUpdateSign;
