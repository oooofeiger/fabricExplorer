import numeral from 'numeral';
import './g2';
import ChartCard from './ChartCard';
import Bar from './Bar';
import Pie from './Pie';
import Radar from './Radar';
import Gauge from './Gauge';
import MiniArea from './MiniArea';
import MiniBar from './MiniBar';
import MiniProgress from './MiniProgress';
import Field from './Field';
import WaterWave from './WaterWave';
import TagCloud from './TagCloud';
import TimelineChart from './TimelineChart';
import NetworkGraph from './netWork';
import RealTime from './RealTime';

const yuan = val => `¥ ${numeral(val).format('0,0')}`;

const Charts = {
  yuan,
  Bar,
  Pie,
  Gauge,
  Radar,
  MiniBar,
  MiniArea,
  MiniProgress,
  ChartCard,
  Field,
  WaterWave,
  TagCloud,
  TimelineChart,
  NetworkGraph,
  RealTime
};

export {
  Charts as default,
  yuan,
  Bar,
  Pie,
  Gauge,
  Radar,
  MiniBar,
  MiniArea,
  MiniProgress,
  ChartCard,
  Field,
  WaterWave,
  TagCloud,
  TimelineChart,
  NetworkGraph,
  RealTime
};
