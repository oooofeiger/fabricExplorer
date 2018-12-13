import React from 'react';
import vis from 'vis';
import styles from './index.less';

export default class NetworkGraph extends React.Component {
  constructor(props) {
    super(props);
    this.container = React.createRef();
  }
  componentDidMount() {
    console.log('newWork', this.props);
    let { nodearr, edgesarr } = this.props.data;
    nodearr = new vis.DataSet(nodearr);
    edgesarr = new vis.DataSet(edgesarr);

    const data = {
      nodes: nodearr,
      edges: edgesarr,
    };

    const options = {
      height: '100%',
      width: '100%',
      interaction: {
        zoomView: false, //控制是否被移动
      },
      edges: {
        width: 1,
        arrows: {
          to: {
            scaleFactor: 1,
          },
        },
      },
    };
    this.setState({
      data: data,
      options: options,
      isCurrent: true,
    });
    console.log(this.props);
    var network = new vis.Network(this.container.current, data, options);
  }

  componentDidUnMount() {
    this.setState({
      data: null,
    });
  }

  render() {
    return <div ref={this.container} className={styles.netWorkWrap} />;
  }
}
