import {
  ThemeModes,
  ISyncExtensionState
} from '@definitions';

import { STATE_VERSION } from '@config/general';

async function applyMigration(
  stateVersion: number,
  initialSyncState: ISyncExtensionState,
  syncStore: browser.storage.StorageArea,
) {
  if (!stateVersion) {
    const previousSyncState = await syncStore.get();

    // No need to migrate if there is no previous state
    if (Object.keys(previousSyncState).length == 0) {
      // Save the initial state if no state is present
      await syncStore.set(initialSyncState);
    } else {
      // Migrating from <= 2.0.4
      const migratedState: unknown = {};

      console.info(`[state] State is outdated, starting migration to state version: ${STATE_VERSION}`);

      if (previousSyncState.hasOwnProperty('options')) {
        const { duckduckgo, autoTimeStart, autoTimeEnd } = previousSyncState.options;

        migratedState['options'] = {
          duckduckgo: duckduckgo || initialSyncState.syncOptions.duckduckgo,
          intervalStart: autoTimeStart || initialSyncState.syncOptions.intervalStart,
          intervalEnd: autoTimeEnd || initialSyncState.syncOptions.intervalEnd,
        };
      }

      if (previousSyncState.hasOwnProperty('theme')) {
        if (previousSyncState.theme.hasOwnProperty('templates')) {
          const { dark, light } = previousSyncState.theme.templates;

          migratedState['globalTemplates'] = {
            [ThemeModes.Dark]: dark || initialSyncState.globalTemplates.dark,
            [ThemeModes.Light]: light || initialSyncState.globalTemplates.light,
          };

          // The duckduckgo template structure has been changed in version >= 2.0.5
          // It might already have the correct template type if 'dark' or 'light' is
          // undefined, but it is easier to do it like this.
          migratedState['globalTemplates'][ThemeModes.Dark].duckduckgo =
            initialSyncState.globalTemplates.dark.duckduckgo;

          migratedState['globalTemplates'][ThemeModes.Light].duckduckgo =
            initialSyncState.globalTemplates.light.duckduckgo;
        }
      }

      console.info('[state] Applying migrated state', migratedState);

      await syncStore.clear();
      await syncStore.set(migratedState);
    }
  } else if (stateVersion !== STATE_VERSION) {
    console.info(`[state] No available migration for current state version: ${stateVersion}`);
  }
}

async function transferSyncState(
  previousStore: browser.storage.StorageArea,
  newStore: browser.storage.StorageArea,
  syncState: ISyncExtensionState,
) {
  const keys = Object.keys(syncState);
  previousStore.remove(keys);

  newStore.set(syncState);
}

export default {
  applyMigration,
  transferSyncState,
}
