import {parse} from 'url';
import {MetricAgentConfig} from './lib/MetricAgentConfig';

/**
 * Metrics Agent configuration
 *
 * @export
 * @interface MetricAgentConfig
 */
export const config: MetricAgentConfig = {
    main: {
        env: process.env.MSYNC_ENV || 'dev',
        log: {
            level: process.env.AGENT_LOG_LEVEL || 'debug',
            host: process.env.LOG_GATEWAY_HOST || '127.0.0.1',
            port: Number(process.env.LOG_GATEWAY_PORT) || 5556
        },
        subSystem: process.env.subsystem || 'local',
        envName: process.env.envName || 'local',
        secret: process.env.MC_SECRET || 'secret',
    },
    connect: {
        url: parse(process.env.MQ_URL || 'stomp://admin:admin@localhost:61613'),
        queue: 'metrics.ApplicationMetrics'
    },
    metrics: {
      elastic: {
        host: process.env.ELASTIC_HOST || 'http://localhost:9200',
        username: process.env.ELASTIC_USER || '',
        password: process.env.ELASTIC_PASSWORD || '',
        index: process.env.ELASTIC_INDEX || 'metrics'
      },
      servicenow: {
        host: process.env.SERVICENOW_HOST || '',
        username: process.env.SERVICENOW_USER || '',
        password: process.env.SERVICENOW_PASSWORD || '',
        endpoint: process.env.SERVICENOW_ENDPOINT || ''
      }
    }
};
