import debug from 'debug';
import {connect, Client, ConnectFailover} from 'stompit';
import {MetricAgentConfig } from './MetricAgentConfig';
import { MessageListener } from './MessageListener';

/**
 * Agent to collect and publish metrics using registered providers
 *
 * @export
 * @class MetricAgent
 */
export class MetricAgent {
  private debug: debug.IDebugger;

  private server: ConnectFailover;
  private client: Client | null;
  private connectOptions: connect.NetTcpConnectOptions;
  private reconnectOptions: ConnectFailover.ConnectFailoverOptions;
  private config: MetricAgentConfig;

  public constructor(config: MetricAgentConfig) {
    this.debug = debug('MetricAgent');

    this.config = config;
    this.client = null;

    this.connectOptions = {
      'host': config.connect.url.hostname,
      'port': Number(config.connect.url.port),
      'connectHeaders': {
        'host': '/',
        'heart-beat': '5000,5000'
      }
    };

    const auth: string[] = (config.connect.url.auth) ? config.connect.url.auth.split(':') : [];
    if (this.connectOptions.connectHeaders && auth.length === 2) {
      this.connectOptions.connectHeaders.login = auth[0];
      this.connectOptions.connectHeaders.passcode = auth[1];
    }

    this.reconnectOptions = {
      useExponentialBackOff: false,
      initialReconnectDelay: 5000,
      maxReconnectDelay: 5000,
      maxReconnects: 100
    };

    this.server = new ConnectFailover([this.connectOptions], this.reconnectOptions);

    // Event handlers
    this.server.on('error', (error: Error) => {
      this.debug(`Error: Connection error ${error.message}`);
    });
    this.server.on('connect', (connection: ConnectFailover.ConnectState) => {
      this.debug(`Connected to ${connection.serverProperties.remoteAddress.transportPath}`);
    });
    this.server.on('connecting', (connection: ConnectFailover.ConnectState) => {
      this.debug(`Connecting to ${connection.serverProperties.remoteAddress.transportPath}...`);
    });
  }

  public connect() {
    this.server.connect((error: Error | null,
        client: Client, reconnect: () => void) => {
          this.connectHandler(error, client, reconnect);
        });
  }

  private connectHandler(error: Error | null, client: Client, reconnect:() => void) {
    if (error) {
      this.debug(`Error: Unable to connect to ${this.connectOptions.host}:${this.connectOptions.port}.
        Error details: ${error.message}`);

      return;
    }

    this.client = client;

    this.client.on('error', (connectionError: Error | null) => {
      this.debug(connectionError);
      this.debug('Trying to reconnect...');
      reconnect();
    });

    // add listener
    const listener = new MessageListener(this.client, this.config);
    listener.subscribe();
  }
}
