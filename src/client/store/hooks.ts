import { createCallAction } from "@sharkord/plugin-sdk";
import type { Actions } from "../../contracts/actions";
import { store } from "./index";

function useCallAction() {
  return createCallAction<Actions>(store.actions);
}

export { useCallAction };
