import React from 'react';
import { Chart, Tooltip, Geom, Legend, Axis } from 'bizcharts';
// import DataSet from '@antv/data-set';

var data = [];
let chart;
const scale = {
  time: {
    alias: '时间',
    type: 'time',
    mask: 'MM:ss',
    tickCount: 10,
    nice: false,
  },
  txCount: {
    alias: '交易量',
    min: 0,
    max: 100,
  },
  type: {
    type: 'cat',
  },
};
export default class RealTime extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { txData } = this.props;
    console.log('txData', txData);
    var now = new Date();
    var time = now.getTime();
    if (data.length >= 200) {
      data.shift();
      data.shift();
    }
    txData &&
      data.push({
        time: time,
        txCount: txData.txCount,
        type: '交易量',
      });
    this.setState({
      data,
    });
    console.log('ddd', data);
  }

  componentDidUpdate() {}

  render() {
    console.log('realTime', data);
    return (
      <div>
        {data.length > 0 ? (
          <Chart height={window.innerHeight} data={data} scale={scale} forceFit>
            <Tooltip />
            {data.length !== 0 && <Axis />}
            <Legend />
            <Geom
              type="line"
              position="time*txCount"
              color={['type', ['#ff7f0e']]}
              shape="smooth"
              size={2}
            />
          </Chart>
        ) : (
          ''
        )}
      </div>
    );
  }
}
