/**
 * Metrics Agent entry point
 */
import {MetricAgent} from './lib/MetricAgent';
import {config} from './config'

const agent = new MetricAgent(config);
agent.connect();
