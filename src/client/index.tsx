import { PluginSlot, type TPluginComponentsMapBySlotId } from "@sharkord/plugin-sdk";
import { SnippetLibrary } from "./components/snippet-library/index";

const components: TPluginComponentsMapBySlotId = {
  [PluginSlot.FULL_SCREEN]: [SnippetLibrary],
};

export { components };
