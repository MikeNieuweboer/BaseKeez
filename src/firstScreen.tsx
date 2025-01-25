import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Switch, Match, For } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import { exists, readTextFile, writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { HeaderComponent } from "./header";
import { BackgroundComponent } from "./background";
import "./App.css";

interface RoundScore {
  winChange: number,
  minChange: number
}

interface Team {
  name: string,
  teamScores: RoundScore[]
};

interface GameData {
  teams: Team[],
  currentGame: number,
  totalRounds: number
};

const fileName = "Scores";
let [gameLoaded, setGameLoaded] = createSignal(false);
let [gameIndex, setGameIndex] = createSignal(1);
let [currentGameData, setCurrentGameData] = createStore<GameData>({
  teams: [],
  currentGame: 0,
  totalRounds: 1
});

const NewGame = () => {
  setCurrentGameData({
    teams: [],
    currentGame: 0,
    totalRounds: 1
  });
  setGameLoaded(true);
}

// const NewRound = () => {

// }

const UpdateScoreBoard = async () => {
  invoke("update_score", {});
}

// const ChangeTeamName = (oldName, newName) => {
  
// }

const AddTeam = (teamName: string) => {
  let newTeam: Team = {
    name: teamName,
    teamScores: Array<RoundScore>(currentGameData.totalRounds).fill({
      winChange: 0,
      minChange: 0
    })
  }
  setCurrentGameData("teams", currentGameData.teams.length, newTeam);
}

const ChangeScore = (gameIndex: number, teamName: string, newScore: RoundScore) => {
  let teamIndex = currentGameData.teams?.findIndex((team) => team.name == teamName);
  if (teamIndex == undefined) return;
  currentGameData.teams[teamIndex].teamScores[gameIndex] = newScore
  console.log(currentGameData);
}

const SaveScore = async () => {
  
};

// const ReadScore = () => {

// }

const TeamTotalWin = () => {

}

const TeamTotalMin = () => {

}

function LoadScreen() {
  return (
    <div>
      <button> Laad vorig spel </button>
      <button onclick={NewGame}> Start nieuw spel </button>
    </div>
  )
}

function TeamStats(team: Team) {
  return (
    <tr>
      <td>{team.name}</td>
    </tr>
  )
}

function GameScreen() {
  let [newTeamName, setNewTeamName] = createSignal("");

  const InvalidTeamName = () => {
    return newTeamName().length <= 0 || currentGameData.teams.find((team) => team.name == newTeamName()) != undefined;
  }

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th>Team</th>
            <th>Winpunten</th>
            <th>Minpunten</th>
            <th>Totaal</th>
          </tr>
          <tr>
            <For each={currentGameData.teams}>{(team, _) =>
              TeamStats(team)
            }</For>
          </tr>
          <tr>
            <td>
              <input type="text" value={newTeamName()} onInput={(e) => setNewTeamName(e.currentTarget.value)}></input>
            </td>
            <td colSpan={3}>
              <button onClick={() => {AddTeam(newTeamName()); setNewTeamName("")}} 
              disabled={InvalidTeamName()}>Voeg nieuw team toe</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function App() {
  return (
    <main class="container">
      {HeaderComponent(currentGameData.currentGame + 1)}
      <BackgroundComponent />
      <div class="foreground-container">
        <Switch>
          <Match when={!gameLoaded()}>
            <LoadScreen />
          </Match>
          <Match when={gameLoaded()}>
            <GameScreen />
          </Match>
        </Switch>
      </div>
    </main>
  );
}

export default App;
