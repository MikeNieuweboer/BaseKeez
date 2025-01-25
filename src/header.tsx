export function HeaderComponent(gameIndex: number) {
    return (
    <div class="header-parent">
        <div class="side-bar"></div>
        <div class="side-line"></div>
        <div class="header">
            <div>
                GAME &nbsp {String(gameIndex)} 
            </div>
            <div>
                <img class="logo" src="/logo_site_enkhuizen.png"></img>
            </div>
            <div>
                KEEZTOURNOOI
            </div>
        </div>
        <div class="side-line"></div>
        <div class="side-bar"></div>
    </div>
    );
}