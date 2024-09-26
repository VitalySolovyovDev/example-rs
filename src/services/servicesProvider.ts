import { createContext, useContext } from 'react';

export class Services {
  readonly errors = {}; // Errors Handling
  readonly persistent = {}; // Persistent Service
  readonly socket = {}; // Web Socket Service
  readonly settings = {}; // App settings
  readonly notifications = {}; // Notification service
  readonly datetime = {}; // DateTime Handling
  readonly i18n = {}; // Translation service
  readonly metrics = {}; // Metrics Store
}

export const services = new Services();

const servicesContext = createContext<Services>(services);
const ServicesProvider = servicesContext.Provider;

/* eslint-disable react-hooks/rules-of-hooks */
function useService<T extends keyof Services>(serviceName: T): Services[T] {
  const context = useContext(servicesContext);
  if (context) {
    return context[serviceName];
  }
  throw Error('Service Provider or services in Service Provider are not provided!');
}
/* eslint-enable */

export { useService, ServicesProvider };
