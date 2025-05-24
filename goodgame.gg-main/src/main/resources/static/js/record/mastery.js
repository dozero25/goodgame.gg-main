window.onload = () => {
    HeaderService.getInstance().loadHeader();
    SummonerService.getInstance().summonerShowInfo();
    CheckboxService.getInstance().ShowCheckbox();

    MasteryService.getInstance().MasteryShowInfoOfChmapion();
    MasteryService.getInstance().selectSortByLevelAndPoints();

    ComponentEvent.getInstance().initSearchButton();
}

let currentIndex = 0;
const itemsPerPage = 10;
let championMasteryData = [];
const championContainer = document.getElementById('champion-container');
const loadMoreBtn = document.getElementById('load-more-btn');

let sortBy = '';
let order = '';

class MasteryApi {
    static #instance = null;

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new MasteryApi();
        }
        return this.#instance;
    }

    searchSummonerInfoByGameNameAndTagLine() {
        let returnData = null;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/record/search/summoner/${gameNameAndTagLine}`,
            contentType: "application/json",
            data: JSON.stringify(gameNameAndTagLine),
            dataType: "json",
            success: responese => {
                returnData = responese.data;
            },
            error: error => {

            }
        });

        return returnData;
    }

    searchChampionMasteryByPuuid(search = null) {
        let returnData = null;

        let url = `http://localhost:8000/api/record/get/championMastery?sortBy=${sortBy}&order=${order}`;

        if (search) {
            url += `&search=${search}`;
        }

        $.ajax({
            async: false,
            type: "get",
            url: url,
            dataType: "json",
            success: responese => {
                returnData = responese.data;
            },
            error: error => {
                console.log(error);
            }
        });

        return returnData;
    }
}

class MasteryService {
    static #instance = null

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new MasteryService;
        }
        return this.#instance;
    }

    async MasteryShowInfoOfChmapion() {
        const container = document.querySelector(".champion-container");
        const loadMoreBtn = document.getElementById("load-more-btn");

        container.innerHTML = '';

        const searchInput = document.querySelector(".search-input").value.trim();
        let search = null;

        if (searchInput !== "") {
            search = await this.getChampionIdByName(searchInput);
        }

        championMasteryData = MasteryApi.getInstance().searchChampionMasteryByPuuid(search);
        currentIndex = 0;

        this.renderNextChampions();

        loadMoreBtn.onclick = () => {
            this.renderNextChampions();
        };

    }

    async renderNextChampions() {
        const container = document.querySelector(".champion-container");
        const loadMoreBtn = document.getElementById("load-more-btn");

        const nextData = championMasteryData.slice(currentIndex, currentIndex + itemsPerPage);

        const championInfos = await Promise.all(
            nextData.map(async (data) => {
                const champ = await this.getChampionNameById(data.championId);
                return { champ, data };
            })
        );

        championInfos.forEach(({ champ, data }) => {
            container.innerHTML += `
            <div class="champion-card">
                <div class="champion-show-info">
                    <div class="champion-icon">
                        <img src="${window.BASE_URL}/img/champion/${champ.id}.png" alt="${champ.name}">
                    </div>
                    <div class="champion-info">
                        <div class="champion-name">${champ.name}</div>
                        <div class="champion-level">레벨 ${data.championLevel}</div>
                        <div class="champion-points">점수: ${data.championPoints.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
        });


        currentIndex += itemsPerPage;

        if (currentIndex >= championMasteryData.length) {
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "block";
        }
    }

    async getChampionNameById(championId) {
        const response = await fetch(`${window.BASE_URL}/data/ko_KR/champion.json`);
        const data = await response.json();
        const champions = data.data;

        for (const champName in champions) {
            if (champions[champName].key === String(championId)) {
                return champions[champName];
            }
        }

        return null;
    }

    async getChampionIdByName(champName) {
        const response = await fetch(`${window.BASE_URL}/data/ko_KR/champion.json`);
        const data = await response.json();
        const champions = data.data;

        for (const champKey in champions) {
            if (champions[champKey].name.toLowerCase() === champName.toLowerCase()) {
                return champions[champKey].key;
            }
        }

        return null;
    }

    selectSortByLevelAndPoints() {
        const sortSelect = document.getElementById('sort-select');

        sortSelect.onchange = () => {
            const value = sortSelect.value;

            if (value === 'default') {
                sortBy = null;
                order = null;
            } else {
                const [sortType, sortOrder] = value.split('-');
                sortBy = sortType;
                order = sortOrder;
            }

            MasteryService.getInstance().MasteryShowInfoOfChmapion();
        };
    }
    async searchChampionsByName(searchTerm) {
        const response = await fetch(`${window.BASE_URL}/data/ko_KR/champion.json`);
        const data = await response.json();
        const champions = Object.values(data.data);
        return champions.filter(champ => champ.name.includes(searchTerm));
    }
}

class ComponentEvent {
    static #instance = null

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    initSearchButton() {
        const searchBtn = document.querySelector(".search-input-btn");
        const searchInput = document.querySelector(".search-input");
        const autocompleteList = document.querySelector(".autocomplete-list");

        if (searchBtn) {
            searchBtn.onclick = () => {
                this.searchChampions(searchInput.value.trim());
            };
        }

        if (searchInput) {
            searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const firstItem = autocompleteList.querySelector(".autocomplete-item");
                    if (firstItem) {
                        this.selectChampion(firstItem);
                    } else {
                        this.searchChampions(searchInput.value.trim());
                    }
                }
            });
        }

        searchInput.addEventListener("input", async (e) => {
            const searchTerm = e.target.value.trim();
            autocompleteList.innerHTML = "";

            if (searchTerm === "") {
                autocompleteList.innerHTML = "";
                MasteryService.getInstance().MasteryShowInfoOfChmapion();
                loadMoreBtn.style.display = "block";
                return;
            }

            const matchedChampions = await MasteryService.getInstance().searchChampionsByName(searchTerm);
            autocompleteList.innerHTML = "";

            matchedChampions.forEach(champ => {
                const item = document.createElement("div");
                item.classList.add("autocomplete-item");
                const imageUrl = `${window.BASE_URL}/img/champion/${champ.id}.png`

                item.innerHTML = `
                    <img src = "${imageUrl}" alt = "${champ.name}" class = "champion-img-ul">
                    <span class = "champion-name-ul">${champ.name}</span>
                `
                item.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.selectChampion(item);
                });

                autocompleteList.appendChild(item);
            });

        });
    }

    selectChampion(item) {
        const searchInput = document.querySelector(".search-input");
        const autocompleteList = document.querySelector(".autocomplete-list");

        const nameSpan = item.querySelector(".champion-name");
        searchInput.value = nameSpan ? nameSpan.textContent.trim() : item.textContent.trim();

        autocompleteList.innerHTML = "";
        MasteryService.getInstance().MasteryShowInfoOfChmapion();
    }

    searchChampions(query) {
        const autocompleteList = document.querySelector(".autocomplete-list");
        autocompleteList.innerHTML = "";

        if (query === "") return;

        MasteryService.getInstance().MasteryShowInfoOfChmapion();
    }

}    