class CheckboxService {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new CheckboxService();
        }
        return this.#instance;
    }
    ShowCheckbox() {
        const checkBox = document.querySelector(".check-box");

        const pathSegments = window.location.pathname.split('/');
        const summonerNameFromURL = pathSegments[2];

        checkBox.innerHTML = `
            <ul class="btn-check">
                <li class="select-btn">
                    <a href="/record/${summonerNameFromURL}">
                        <button class="button-menu button-menu--ujarak button-menu--border-thin button-menu--text-thick">종합</button>
                    </a>
                    <button class="button-menu button-menu--ujarak button-menu--border-thin button-menu--text-thick">챔피언</button>
                    <a href="/record/${summonerNameFromURL}/mastery">
                        <button class="button-menu button-menu--ujarak button-menu--border-thin button-menu--text-thick">숙련도</button>
                    </a>
                </li>
            </ul>
        `;
    }
}