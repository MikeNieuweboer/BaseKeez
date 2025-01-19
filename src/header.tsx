export function HeaderComponent(gameIndex: number) {
    return (
    <div class="header"> 
        <div>
            GAME {String(gameIndex)} 
        </div>
        <div>
            <img src="/logo_site_enkhuizen.png"></img>
        </div>
    </div>
    );
}