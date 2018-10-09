import {Client} from 'stompit';
import debug from 'debug';

import {MetricRegistry, IMetric, Metric, ElasticProvider, ElasticConfig} from 'bimetric';
import {MetricAgentConfig, MetricsOptions } from './MetricAgentConfig';

/**
 * Message listener for the STOMP client
 *
 * @export
 * @class MessageListener
 */
export class MessageListener {
  private debug: debug.IDebugger;
  private client: Client;
  private queueName: string;

  private metricRegistry: MetricRegistry;

  constructor(client: Client, config: MetricAgentConfig) {
    this.debug = debug('MetricListener');

    this.client = client;
    this.queueName = `${config.main.envName}-${config.main.subSystem}-${config.connect.queue}`;

    const metricCfg = config.metrics;
    this.metricRegistry = this.initMetrics(metricCfg);
  }

  public subscribe() {
    const subscribeHeaders = {
      destination: `/queue/${this.queueName}`,
      ack: 'client-individual'
    };

    this.debug(`Subscribe to: ${subscribeHeaders.destination}`);

    this.client.subscribe(subscribeHeaders,
      (subscriptionError: Error | null, message: Client.Message) =>{
        this.messageHandler(subscriptionError, message)
      });
  }

  private messageHandler(error: Error | null, message?: Client.Message) {
    if (error) {
      this.debug(`Error: Unable to process message for queue: ${this.queueName}.
        Error details: ${error.message}`);

      return;
    }

    if (!message) {
      this.debug(`Error: Unexpected empty message. Skip.`);

      return;
    }

    message.readString('utf-8',
      (messageError: Error | null, body?: string) => {
        this.processMessage(messageError, message, body);
      });
  }

  private processMessage(error: Error | null, message: Client.Message, body?: string) {
    if (error) {
      this.debug(`Error: Unable to read message.
        Error details: ${error.message}`);

      return;
    }

    this.debug(`Message recieved: \n${body}`);

    if (!body) {
      this.debug(`Error: Unexpected empty message. Skip.`);

      return;
    }

    this.processMetric(body);

    if (this.client) {
        this.client.ack(message);
    }
  }

  private initMetrics(config: MetricsOptions): MetricRegistry {
    const elasticCfg = new ElasticConfig(
      config.elastic.host,
      config.elastic.index,
      config.elastic.username,
      config.elastic.password
    );
    const elastic = new ElasticProvider(elasticCfg);

    const registry = new MetricRegistry();
    registry.register(elastic);

    return registry;
  }

  private processMetric(data: string) {
    // deserialize metric
    try {
      // tslint:disable-next-line: no-unsafe-any
      const metricData: IMetric = JSON.parse(data);

      const metric: Metric = Metric.fromData(metricData);
      this.metricRegistry.emit(metric);
    }
    catch(e) {
      this.debug(`Unable to parse data. Error: \n ${e}`);
    }
  }
}
