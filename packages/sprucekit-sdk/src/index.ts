export * from './sprucekit';
export * from './modules';
export * from '@spruceid/sprucekit-core/client';
export * from '@spruceid/sprucekit-core';
export {
  /** @deprecated use SpruceKitClientConfig field instead */
  SpruceKitClientConfig as SpruceKitConfig,
  /** @deprecated use SpruceKitClientProviders field instead */
  SpruceKitClientProviders as SpruceKitProviders,
  /** @deprecated use SpruceKitClientSession field instead */
  SpruceKitClientSession as SpruceKitSession,
} from '@spruceid/sprucekit-core/client';
export { SiweMessage } from 'siwe';
