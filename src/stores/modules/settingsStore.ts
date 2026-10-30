import { defineStore } from 'pinia';
import rootAxios from '@/configs/rootAxiosBody';
import type { BaseEntityConfigInterface } from '@/types';

export const useSettingsStore = defineStore('settings', () => {
  const baseUrl = '/api/settings/crud';
  const cacheKey = 'configCache';
  /**
   * Mise en place d'un cache pour les configurations.
   * ( disponible pendant la session ).
   */
  const configCache: Record<string, BaseEntityConfigInterface> = {};
  const getKey = (configKey: string) => `${configKey}`;

  /**
   *
   * @param configKey
   * @returns
   */
  const getConfig = async (configKey: string): Promise<BaseEntityConfigInterface | null> => {
    if (configCache[getKey(configKey)] === null) return null;
    if (configCache[getKey(configKey)] !== undefined) {
      return configCache[getKey(configKey)] as BaseEntityConfigInterface;
    }
    const response = await rootAxios.get(baseUrl + '/load-config/' + configKey);
    configCache[getKey(configKey)] = response.data as BaseEntityConfigInterface;
    saveConfigsInsession();
    return response.data as BaseEntityConfigInterface;
  };

  /**
   *
   * @param config
   */
  const saveConfig = async (config: BaseEntityConfigInterface): Promise<BaseEntityConfigInterface> => {
    const configOld = configCache[getKey(config.configKey)];
    if (configOld && configOld.id) {
      config.id = configOld.id;
    }
    const response = await rootAxios.post(baseUrl + '/save-config/', config);
    configCache[getKey(config.configKey)] = response.data as BaseEntityConfigInterface;
    saveConfigsInsession();
    return response.data as BaseEntityConfigInterface;
  };

  /**
   *
   */
  const saveConfigsInsession = () => {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(configCache));
  };

  /**
   *
   */
  const loadConfigsFromSession = () => {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) {
      Object.assign(configCache, JSON.parse(cached));
    }
  };

  return {
    loadConfigsFromSession,
    getConfig,
    saveConfig,
  };
});
