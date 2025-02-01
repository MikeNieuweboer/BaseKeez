import { Accessor, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Switch, Match, For, Show } from "solid-js";
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
  shownGame: number,
  totalRounds: number
};

const fileName = "basekeez-scores";
let [gameLoaded, setGameLoaded] = createSignal(false);
let [currentGameData, setCurrentGameData] = createStore<GameData>({
  teams: [],
  currentGame: 0,
  shownGame: 0,
  totalRounds: 1
});

const NewGame = () => {
  setCurrentGameData({
    teams: [],
    currentGame: 0,
    shownGame: 0,
    totalRounds: 1
  });
  setGameLoaded(true);
  UpdateScoreBoard();
}

const NewRound = () => {
  currentGameData.teams.forEach((_, index) => {
    setCurrentGameData("teams", index, "teamScores", currentGameData.totalRounds, {
      winChange: 0,
      minChange: 0
    });
  });
  setCurrentGameData("totalRounds", currentGameData.totalRounds + 1);
}

const UpdateScoreBoard = async () => {
  await SaveScore();
  invoke("update_score", { fileName: fileName });
}

const ChangeCurrentGameIndex = (newIndex: number) => {
  setCurrentGameData("currentGame", newIndex);
}

const ChangeShownGameIndex = (newIndex: number) => {
  setCurrentGameData("shownGame", newIndex);
}

const AddTeam = (teamName: string) => {
  let newTeam: Team = {
    name: teamName,
    teamScores: Array.from({ length: currentGameData.totalRounds }, () => ({ winChange: 0, minChange: 0 }))
  }
  setCurrentGameData("teams", currentGameData.teams.length, newTeam);
}

const RemoveTeam = (teamName: string) => {
  setCurrentGameData("teams", currentGameData.teams.filter((team) => team.name != teamName));
}

const SaveScore = async () => {
  try {
    const jsonData = JSON.stringify(currentGameData);
    await writeTextFile(`${fileName}.json`, jsonData, { baseDir: BaseDirectory.AppLocalData });
  } catch (error) {
    console.error(error);
  }
};

const ReadScore = async () => {
  if (!exists(`${fileName}.json`, { baseDir: BaseDirectory.AppLocalData })) return;
  let data = await readTextFile(`${fileName}.json`, { baseDir: BaseDirectory.AppLocalData });
  setCurrentGameData(JSON.parse(data));
  setGameLoaded(true);
}

const TeamTotalWin = (team: Team) => {
  return team.teamScores.slice(0, currentGameData.currentGame + 1).reduce((total, score) => total + score.winChange, 0);
}

const TeamTotalMin = (team: Team) => {
  return team.teamScores.slice(0, currentGameData.currentGame + 1).reduce((total, score) => total + score.minChange, 0);
}

function LoadScreen() {
  return (
    <div class="foreground-container">
      <div class="load-screen-container">
        <button class="load-screen-button" onclick={ReadScore}> Laad vorig spel </button>
        <button class="load-screen-button" onclick={NewGame}> Start nieuw spel </button>
      </div>
    </div>
  )
}

function TeamStats(teamIndex: Accessor<number>) {
  let team = currentGameData.teams[teamIndex()];
  let [teamScore, setTeamScore] = createSignal(team.teamScores[currentGameData.currentGame])
  let [totalWin, setTotalWin] = createSignal(TeamTotalWin(team))
  let [totalMin, setTotalMin] = createSignal(TeamTotalMin(team))
  let [totalScore, setTotalScore] = createSignal(totalWin() - totalMin())

  const UpdateTeamData = () => {
    team = currentGameData.teams[teamIndex()];
    setTeamScore(team.teamScores[currentGameData.currentGame]);
    setTotalWin(TeamTotalWin(team));
    setTotalMin(TeamTotalMin(team));
    setTotalScore(totalWin() - totalMin());
  }

  createEffect(UpdateTeamData);
  return (
    <tr class="table-entry">
      <td>{team.name}</td>
      <td>
        <div class="table-input">
          Totaal: {totalWin()}, Ronde: <input class="number-input" value={teamScore().winChange} min={0} type="number" onChange={(e) => {
            setCurrentGameData("teams", teamIndex(), "teamScores", currentGameData.currentGame, "winChange", e.currentTarget.valueAsNumber);
            SaveScore();
            UpdateScoreBoard();
          }}></input>
        </div>
      </td>
      <td>
        <div class="table-input">
        Totaal: {totalMin()}, Ronde: <input class="number-input" value={teamScore().minChange} min={0} type="number" onChange={(e) => {
          setCurrentGameData("teams", teamIndex(), "teamScores", currentGameData.currentGame, "minChange", e.currentTarget.valueAsNumber);
          SaveScore();
          UpdateScoreBoard();
        }}></input>
        </div>
      </td>
      <td>{totalScore()}</td>
      <td>
        <i>
          <img class="remove-team image-button" onclick={() => {
              RemoveTeam(team.name); SaveScore(); UpdateScoreBoard();
            }} src="icons8-x-50.png" />
        </i>
      </td>
    </tr>
  )
}

function GameScreen() {
  let [newTeamName, setNewTeamName] = createSignal("");
  let [showPrevRound, setShowPrevRound] = createSignal(true);
  const InvalidTeamName = () => {
    return newTeamName().length <= 0 || currentGameData.teams.find((team) => team.name == newTeamName()) != undefined;
  }
  UpdateScoreBoard();
  const UpdateShownGame = () => {
    let shownIndex = currentGameData.currentGame;
    if (showPrevRound()) {
      shownIndex -= 1;
    }
    ChangeShownGameIndex(shownIndex);
  };

  const NextGame = () => {
    let nextIndex = currentGameData.currentGame + 1;
    if (nextIndex >= currentGameData.totalRounds) {
      NewRound();
    }
    ChangeCurrentGameIndex(nextIndex);
    UpdateShownGame();
    UpdateScoreBoard();
  } 

  createEffect(() => {
    let nothingness = currentGameData.teams.length;
    // Gotta love solid-js
    nothingness = nothingness;
    document.documentElement.style.setProperty("--table-text-size", (6 - 0.4 * currentGameData.teams.length).toString() + "vh");
  })

  return (
    <div class="foreground-container">
      <table class="score-count-table">
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
          <tr>
            <td colspan={2}>
              <input class="team-name-input" type="text" placeholder="Teamnaam" value={newTeamName()} onInput={(e) => setNewTeamName(e.currentTarget.value)}></input>
              <button class="team-name-submit" onClick={() => {AddTeam(newTeamName()); setNewTeamName(""); UpdateScoreBoard();}} 
              disabled={InvalidTeamName()}>Voeg nieuw team toe</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="options">
        <div class="round-choose-options">
          Laat vorige ronde zien
          <input type="checkbox" checked={showPrevRound()} onChange={(e) => {
              setShowPrevRound(e.currentTarget.checked);
              UpdateShownGame();
              UpdateScoreBoard();
            }
          }></input>
        </div>
        <div>
          <img class="image-button" src="icons8-left-50.png" onclick={
            () => {
              let prevIndex = currentGameData.currentGame - 1;
              if (prevIndex >= 0) {
                ChangeCurrentGameIndex(prevIndex);
                UpdateShownGame();
                UpdateScoreBoard();
              } 
            }
          }/>
          <Show when={currentGameData.currentGame < currentGameData.totalRounds - 1} fallback={<img class="image-button" src="icons8-plus-50.png" onclick={NextGame}/>}>
            <img class="image-button" src="icons8-right-50.png" onclick={NextGame}/>
          </Show>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <main class="container">
      {HeaderComponent(currentGameData.currentGame + 1)}
      <BackgroundComponent />
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
