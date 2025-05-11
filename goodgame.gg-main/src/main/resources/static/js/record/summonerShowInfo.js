class SummonerApi{
    static #instance = null;

    static getInstance(){
        if(this.#instance == null){
            this.#instance = new SummonerApi();
        }
        return this.#instance;
    }

    searchAccountInfoPuuid() {
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/record/get/account/info`,
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

    searchSummonerInfoByEncryptedPUUID() {
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/record/get/summoner/info",
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

    searchLeagueBySummonerName() {
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/record/get/league",
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

class SummonerService{
    static #instance = null;

    static getInstance(){
        if(this.#instance == null){
            this.#instance = new SummonerService();
        }
        return this.#instance;
    }

    summonerShowInfo(){
        const accountData = SummonerApi.getInstance().searchAccountInfoPuuid();
        const summonerData = SummonerApi.getInstance().searchSummonerInfoByEncryptedPUUID();
        const leagueData = SummonerApi.getInstance().searchLeagueBySummonerName();
        

        const profilLeft = document.querySelector(".profil-left");
        const profilRight = document.querySelector(".profil-right");
        

        const winning = leagueData.length != 0 ? ((leagueData[0].wins / (leagueData[0].wins + leagueData[0].losses)) * 100).toFixed(1) : "";

        profilLeft.innerHTML = `
            <div class="profil-img">
                <img src="${window.BASE_URL}/img/profileicon/${summonerData.profileIconId}.png" alt="">
            </div>
             <div class="profil-summoner">
                <h2>${accountData.gameName} #${accountData.tagLine}</h2>
                <h4>소환사 레벨 : ${summonerData.summonerLevel}</h1>
            </div>
        `;

        profilRight.innerHTML = `
            <div class="rank-box">
                <div class="rank-img" style="margin-left: 10px;">
                    <div class="img-box">
                        <img src="/static/images/tier/${leagueData.length != 0 ? leagueData[0].tier : "unranked"}.png" onerror="this.style.display='none'" alt="">
                    </div>
                </div>
                <div class="rank-info">
                    <div class="rank-score" >
                        <div>
                            <h2 style="font-size : 20px">${leagueData.length != 0 ? leagueData[0].tier : "Unranked"}</h2>
                        </div>
                        <div>
                            <h4 style="font-size : 15px">${leagueData.length != 0 ? leagueData[0].leaguePoints : 0}LP</h4>
                        </div>
                        <div>
                            <h2 style="font-size : 20px">${leagueData.length != 0 ? leagueData[0].wins : ""}승 ${leagueData.length != 0 ? leagueData[0].losses : ""}패</h2>
                        </div>
                        <div>
                            <h4 style="font-size : 15px">승률 ${winning}%</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    
}