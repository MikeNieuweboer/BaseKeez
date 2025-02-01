/* @refresh reload */
import { render } from "solid-js/web";
import ScoreCounter from "./firstScreen";
import ScoreBoard from "./secondScreen";
import { getCurrentWindow } from '@tauri-apps/api/window'

render(() => {
    if (getCurrentWindow().label == "main") {
        return <ScoreCounter />
    } else {
        return <ScoreBoard />
    }
}, document.getElementById("root") as HTMLElement);
