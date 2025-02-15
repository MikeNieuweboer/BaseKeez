import { Accessor, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { For, Show } from "solid-js";
import { listen } from "@tauri-apps/api/event";
import { exists, readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { getCurrentWindow, availableMonitors, currentMonitor } from "@tauri-apps/api/window"
import { HeaderComponent } from "./header";
import { BackgroundComponent } from "./background";
import "./App.css";

let [fullscreen, setFullscreen] = createSignal(false);

const AutoSwitch = async () => {
  let monitors = await availableMonitors();
  let window = await getCurrentWindow();
  let mainMonitor = await currentMonitor();
  if (mainMonitor == null) return;
  monitors.forEach((monitor) => {
    if (monitor.name != mainMonitor.name) {
      window.setPosition(monitor.position);
      ChangeFullscreen();
      return;
    }
  })
}

const ChangeFullscreen = async () => {
  let window = await getCurrentWindow();
  setFullscreen(!fullscreen());
  window.setFullscreen(fullscreen());
}

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
let [currentGameData, setCurrentGameData] = createStore<GameData>({
  teams: [],
  currentGame: 0,
  shownGame: 0,
  totalRounds: 1
});

const ReadScore = async () => {
  if (!exists(`${fileName}.json`, { baseDir: BaseDirectory.AppLocalData })) return;
  let data = await readTextFile(`${fileName}.json`, { baseDir: BaseDirectory.AppLocalData });
  let gameData: GameData = JSON.parse(data);
  setCurrentGameData("shownGame", gameData.shownGame);
  gameData.teams = gameData.teams.sort((a, b) => TeamTotalWin(b) - TeamTotalMin(b) - TeamTotalWin(a) + TeamTotalMin(a))
  setCurrentGameData(gameData);
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
    <tr class="table-entry">
      <td>{team.name}</td>
      <td>{totalWin()}</td>
      <td>{totalMin()}</td>
      <td>{totalScore()}</td>
    </tr>
  )
}

function GameScreen() {

  createEffect(() => {
    let nothingness = currentGameData.teams.length;
    // Gotta love solid-js
    nothingness = nothingness;
    document.documentElement.style.setProperty("--table-text-size", (8 - 0.4 * currentGameData.teams.length).toString() + "vh");
  })

  return (
    <div class="score-board-container">
      <table class="score-board-table">
        <tbody>
          <tr>
            <th>Team</th>
            <th>Winpunten</th>
            <th>Minpunten</th>
            <th>Totaal</th>
          </tr>
          <For each={currentGameData.teams}>{(_, i) =>
            TeamStats(i)
          }</For>
        </tbody>
      </table>
      <div class="rules">
        Aas, nieuwe pion opzetten of 1 stap vooruit <br /> <br />
        Heer, nieuwe pion opzetten <br /> <br />
        Vrouw, 12 stappen vooruit <br /> <br />
        Boer, wisselen met pion andere speler <br /> <br />
        7, stappen vooruit of splitsen over twee pionnen <br /> <br />
        4, stappen achteruit
      </div>
    </div>
  );
}

function FullScreenButton() {
  return (
    <Show when={fullscreen()} fallback={<img class="fullscreen-button" src="icons8-fit-to-width-50.png" onclick={ChangeFullscreen}></img>}>
      <img class="fullscreen-button" src="icons8-fullscreen-50.png" onclick={ChangeFullscreen}></img>
    </Show>
  );
}

function ScoreBoard() {
  listen<string>("scoreChanged", () => {
    ReadScore();
  })

  onMount(AutoSwitch);

  return (
    <main class="container">
      {HeaderComponent(currentGameData.shownGame + 1)}
      <FullScreenButton />
      <BackgroundComponent />
      <GameScreen />
    </main>
  );
}

export default ScoreBoard;
