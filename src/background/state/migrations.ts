import { ThemeModes, IExtensionState } from '@definitions';
import { STATE_VERSION } from '@config/general';

export async function applyMigration(stateVersion: number, initialState: IExtensionState) {
  if (!stateVersion) {
    const previousState = await browser.storage.local.get();

    // No need to migrate if there is no previous state
    if (Object.keys(previousState).length == 0) {
      // Save the initial state if no state is present
      await browser.storage.local.set(initialState);
    } else {
      // Migrating from <= 2.0.4
      const migratedState: unknown = {};

      console.info(`[state] State is outdated, starting migration to state version: ${STATE_VERSION}`);

      if (previousState.hasOwnProperty('options')) {
        const {
          userChrome,
          userContent,
          fontSize,
          duckduckgo,
          autoTimeStart,
          autoTimeEnd,
        } = previousState.options;

        migratedState['options'] = {
          userChrome: userChrome || initialState.options.userChrome,
          userContent: userContent || initialState.options.userContent,
          fontSize: fontSize || initialState.options.fontSize,
          duckduckgo: duckduckgo || initialState.options.duckduckgo,
          intervalStart: autoTimeStart || initialState.options.intervalStart,
          intervalEnd: autoTimeEnd || initialState.options.intervalEnd,
        };
      }

      if (previousState.hasOwnProperty('theme')) {
        const { isApplied, mode } = previousState.theme;

        migratedState['isApplied'] = isApplied || initialState.isApplied;
        migratedState['mode'] = mode || initialState.mode;

        if (previousState.theme.hasOwnProperty('templates')) {
          const { dark, light } = previousState.theme.templates;

          migratedState['globalTemplates'] = {
            [ThemeModes.Dark]: dark || initialState.globalTemplates.dark,
            [ThemeModes.Light]: light || initialState.globalTemplates.light,
          };

          // The duckduckgo template structure has been changed in version >= 2.0.5
          // It might already have the correct template type if 'dark' or 'light' is
          // undefined, but it is easier to do it like this.
          migratedState['globalTemplates'][ThemeModes.Dark].duckduckgo =
            initialState.globalTemplates.dark.duckduckgo;

          migratedState['globalTemplates'][ThemeModes.Light].duckduckgo =
            initialState.globalTemplates.light.duckduckgo;
        }
      }

      console.info('[state] Applying migrated state', migratedState);

      await browser.storage.local.clear();
      await browser.storage.local.set(migratedState);
    }
  } else if (stateVersion !== STATE_VERSION) {
    console.info(`[state] No available migration for current state version: ${stateVersion}`);
  }
}
