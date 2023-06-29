import { isSpruceKitServerMiddlewareConfig, SpruceKitServerRouteEndpointType } from "@spruceid/sprucekit-core";

/**
 * This receives a routeConfig param and returns the path string.
 * @param routeConfig - Route config property
 * @param defaultPath - Default path string
 * @returns a path string
 */
export const getRoutePath = (routeConfig: SpruceKitServerRouteEndpointType, defaultPath: string) => {
  if (isSpruceKitServerMiddlewareConfig(routeConfig)) {
    return routeConfig.path;
  } else if (typeof routeConfig === 'string') {
    return routeConfig;
  } else {
    return defaultPath;
  }
};
