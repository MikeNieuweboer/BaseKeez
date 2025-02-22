import { Show } from "solid-js";

export function HeaderComponent(gameIndex: number, showGameData: boolean) {
    return (
    <div class="header-parent">
        <div class="side-bar"></div>
        <div class="side-line"></div>
        <div class="header">
            <Show when={showGameData}>
                <div>
                    GAME &nbsp {String(gameIndex)} 
                </div>
            </Show>
            <div>
                <img class="logo" src="/logo_site_enkhuizen.png"></img>
            </div>
            <Show when={showGameData}>
                <div>
                    KEEZTOURNOOI
                </div>
            </Show>
        </div>
        <div class="side-line"></div>
        <div class="side-bar"></div>
    </div>
    );
}