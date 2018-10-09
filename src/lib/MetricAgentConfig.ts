import { Url } from 'url';

/**
 * Metrics configuration
 *
 * @export
 * @interface MetricAgentConfig
 */
export interface MetricAgentConfig {
    main: EnvironmentOptions,
    connect: ConnectOptions,
    metrics: MetricsOptions
}

export interface EnvironmentOptions {
  env: string,
  log: LoggingOptions,
  secret: string,
  subSystem: string,
  envName: string
}

export interface ConnectOptions {
  url: Url,
  queue: string
}

export interface LoggingOptions {
  level: string,
  host: string,
  port: number
}

export interface MetricsOptions {
  elastic: ElasticSearchOptions,
  servicenow: ServiceNowOptions
}

export interface ElasticSearchOptions {
  host: string,
  username?: string,
  password?: string,
  index: string
}

export interface ServiceNowOptions {
  host: string,
  username: string,
  password: string,
  endpoint: string
}
