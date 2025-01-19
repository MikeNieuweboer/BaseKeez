import { createSignal, Match } from "solid-js";
import { Switch } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import { exists, readTextFile, writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { HeaderComponent } from "./header";
import "./App.css";

let [fileName, setFileName] = createSignal("");
let [gameLoaded, setGameLoaded] = createSignal(false);
let [gameIndex, setGameIndex] = createSignal(1);


const NewGame = () => {
  console.log(Date.toString());
}

// const NewRound = () => {

// }

// const ChangeScore = (gameIndex, teamName) => {
  
//   invoke("update_score", {});
// }

// const ChangeTeamName = (oldName, newName) => {

// }

// const AddTeam = () => {

// }

// const SaveScore = async (dataUrl) => {
  
// };

// const ReadScore = () => {

// }

function LoadScreen() {
  return <button> hewwo!</button>
}

function GameScreen() {
  return <div>hello!</div>
}

function App() {
  NewGame();
  return (
    <main class="container">
      {HeaderComponent(gameIndex())}
      <Switch>
        <Match when={!gameLoaded()}>
          <LoadScreen />
        </Match>
        <Match when={gameLoaded()}>
          <GameScreen />
        </Match>
      </Switch>
    </main>
  );
}

export default App;
