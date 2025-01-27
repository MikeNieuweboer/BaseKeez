import { Accessor, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { For } from "solid-js";
import logo from "./assets/logo.svg";
import { listen } from "@tauri-apps/api/event";
import { exists, readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
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
  shownGame: number,
  totalRounds: number
};

const fileName = "basekeez-scores";
let [gameLoaded, setGameLoaded] = createSignal(false);
let [gameIndex, setGameIndex] = createSignal(1);
let [currentGameData, setCurrentGameData] = createStore<GameData>({
  teams: [],
  currentGame: 0,
  shownGame: 0,
  totalRounds: 1
});

const ReadScore = async () => {
  if (!exists(`${fileName}.json`, { baseDir: BaseDirectory.AppLocalData })) return;
  let data = await readTextFile(`${fileName}.json`, { baseDir: BaseDirectory.AppLocalData });
  console.log(data)
  setCurrentGameData(JSON.parse(data));
  setGameLoaded(true);
}

const TeamTotalWin = (team: Team) => {
  return team.teamScores.slice(0, currentGameData.shownGame + 1).reduce((total, score) => total + score.winChange, 0);
}

const TeamTotalMin = (team: Team) => {
  return team.teamScores.slice(0, currentGameData.shownGame + 1).reduce((total, score) => total + score.minChange, 0);
}

function TeamStats(teamIndex: Accessor<number>) {
  let team = currentGameData.teams[teamIndex()];
  let [totalWin, setTotalWin] = createSignal(TeamTotalWin(team))
  let [totalMin, setTotalMin] = createSignal(TeamTotalMin(team))
  let [totalScore, setTotalScore] = createSignal(totalWin() - totalMin())

  const UpdateTeamData = () => {
    team = currentGameData.teams[teamIndex()];
    setTotalWin(TeamTotalWin(team));
    setTotalMin(TeamTotalMin(team));
    setTotalScore(totalWin() - totalMin());
  }

  createEffect(UpdateTeamData)
  return (
    <tr>
      <td>{team.name}</td>
      <td>{totalWin()}</td>
      <td>{totalMin()}</td>
      <td>{totalScore()}</td>
    </tr>
  )
}

function GameScreen() {
  return (
    <div>
      <table class="score-table">
        <tbody>
          <tr>
            <th>Team</th>
            <th>Winpunten</th>
            <th>Minpunten</th>
            <th>Totaal</th>
            <th></th>
          </tr>
          <For each={currentGameData.teams}>{(_, i) =>
            TeamStats(i)
          }</For>
        </tbody>
      </table>
    </div>
  );
}

function App() {
  listen<string>("scoreChanged", () => {
    ReadScore();
  })
  return (
    <main class="container">
      {HeaderComponent(currentGameData.shownGame + 1)}
      <BackgroundComponent />
      <div class="foreground-container">
        <GameScreen />
      </div>
    </main>
  );
}

export default App;
