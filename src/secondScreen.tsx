import { createSignal, createResource, onMount } from "solid-js";
import { getCurrentWindow, availableMonitors, currentMonitor, LogicalPosition } from "@tauri-apps/api/window"
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

let [fullscreen, setFullscreen] = createSignal(false);

const AutoSwitch = async () => {
  let monitors = await availableMonitors();
  let window = await getCurrentWindow();
  let mainMonitor = await currentMonitor();
  console.log(mainMonitor);
  console.log(await window.innerPosition());
  if (mainMonitor == null) return;
  monitors.forEach((monitor) => {
    if (monitor.name != mainMonitor.name) {
      window.setPosition(new LogicalPosition(100, 100));
      return;
    }
  })
}

const ChangeFullscreen = async () => {
  let window = await getCurrentWindow();
  setFullscreen(!fullscreen());
  window.setFullscreen(fullscreen());
}

function App() {
  onMount(AutoSwitch);

  return (
    <main class="container">
      <h1>Welcome to Tauri + Solid</h1>

      <div class="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <button onClick={AutoSwitch}>{fullscreen() ? "True" : "False"}</button>
      <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

    </main>
  );
}

export default App;
