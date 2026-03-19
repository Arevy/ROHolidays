// Background refresh is optional and NOT wired by default.
// react-native-background-fetch can be added later; for now we expose a stub so the rest
// of the codebase can depend on the API without forcing native setup.

export type BackgroundSetupResult = { supported: boolean; reason?: string };

export async function configureBackgroundRefresh(): Promise<BackgroundSetupResult> {
  return {
    supported: false,
    reason:
      'Background refresh is optional and requires installing @transistorsoft/react-native-background-fetch plus platform setup. Not enabled in this template to keep native stack lean.',
  };
}
