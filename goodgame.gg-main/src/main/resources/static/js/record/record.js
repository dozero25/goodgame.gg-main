window.onload = () => {
    HeaderService.getInstance().loadHeader();
    RecordShowInfoService.getInstance().summonerShowInfo();
    
    ComponentEvent.getInstance().addClickEventShowGameDetailInfo();
    ComponentEvent.getInstance().addClickATag();
    ComponentEvent.getInstance().addClickATagTwice();
    ComponentEvent.getInstance().addClickATagThird();
}

let gameNameAndTagLine = "";

let count = 0;

class RecordApi{
    static #instance = null;
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new RecordApi();
        }
        return this.#instance;
    }

    searchSummonerInfoByGameNameAndTagLine(){
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

    searchAccountInfoPuuid(){
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

    searchSummonerInfoByEncryptedPUUID(){
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

    searchMatchsByMatchId(){
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/record/get/matches",
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

    searchMatchInfoByMatchId(){
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/record/get/matches/info",
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

    searchLeagueBySummonerName(){
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

    searchChampionMasteryByPuuid(){
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/record/get/championMastery",
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

class RecordShowInfoService{
    static #instance = null;
    static getInstance(){
        if(this.#instance == null){
            this.#instance = new RecordShowInfoService();
        }
        return this.#instance;
    }
// const show6 = RecordApi.getInstance().searchChampionMasteryByPuuid();
    
    summonerShowInfo(){
        const accountData = RecordApi.getInstance().searchAccountInfoPuuid();
        const summonerData = RecordApi.getInstance().searchSummonerInfoByEncryptedPUUID();
        const leagueData = RecordApi.getInstance().searchLeagueBySummonerName();
        RecordApi.getInstance().searchMatchsByMatchId();

        const profilLeft = document.querySelector(".profil-left");
        const profilRight = document.querySelector(".profil-right");
        const daedkkeInfo = document.querySelector(".daedkke-info");
 
        const winning = leagueData.length != 0 ? ((leagueData[0].wins /(leagueData[0].wins + leagueData[0].losses))*100).toFixed(1) : "";

        profilLeft.innerHTML = `
            <div class="profil-img">
                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${summonerData.profileIconId}.png" alt="">
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
                        <img src="/static/images/tier/${leagueData.length != 0  ? leagueData[0].tier : "unranked"}.png" onerror="this.style.display='none'" alt="">
                    </div>
                </div>
                <div class="rank-info">
                    <div class="rank-score" >
                        <div>
                            <h2 style="font-size : 20px">${leagueData.length != 0  ? leagueData[0].tier : "Unranked"}</h2>
                        </div>
                        <div>
                            <h4 style="font-size : 15px">${leagueData.length != 0  ? leagueData[0].leaguePoints : 0}LP</h4>
                        </div>
                        <div>
                            <h2 style="font-size : 20px">${leagueData.length != 0  ? leagueData[0].wins : ""}승 ${leagueData.length != 0  ? leagueData[0].losses : ""}패</h2>
                        </div>
                        <div>
                            <h4 style="font-size : 15px">승률 ${winning}%</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const matchInfo = RecordApi.getInstance().searchMatchInfoByMatchId();

        matchInfo.forEach((data, index) => {

            const startEndTime = new Date(matchInfo[index].info.gameDuration * 1000);
            const whereTime = new Date(matchInfo[index].info.gameStartTimestamp);
            const participantsInfo = matchInfo[index].info.participants;

            const participantObj = {
                parIndex: 0,
                win : "",
                maxContinuityKill:"",
                sumAllKill : 0
            }
            
            const bestplayers = {
                bestDamge : 0,
                bestDamgeSummoner : "",
                bestDamgeChamp:"",
                bestDamgePosition : "",
            
                bestKill : 0,
                bestKillSummoner : "",
                bestKillChamp:"",
                bestKillPosition : "",
                
                bestDeath : 0,
                bestDeathSummoner : "",
                bestDeathChamp : "",
                bestDeathPosition : "",
            
                bestAssist : 0,
                bestAssistSummoner : "",
                bestAssistChamp : "",
                bestAssistPosition : "",
            
                bestDamgeReceive : 0,
                bestDamgeReceiveSummoner : "",
                bestDamgeReceiveChamp : "",
                bestDamgeReceivePosition : "",
            
                bestgold : 0,
                bestgoldSummoner : "",
                bestgoldSummonerChamp : "",
                bestgoldPosition : "",
            
                bestKDA: 0,
                bestKDASummoner : "",
                bestKDAChamp:"",
                bestKDAPosition : "",
            
                bestCs : 0,
                bestCsSummoner : "",
                bestCsChamp : "",
                bestCsPosition : ""
            
            }
            const winTeam = {
                winIndex : 0,
                teamId : 0,
                teamName : "",
                maxGold : 0,
                maxKill : 0,
                winTop:0,
                winJun:0,
                winMid:0,
                winBot:0,
                winSur:0
            }

            const loseTeam = {
                loseIndex : 0,
                teamName : "",
                maxGold : 0,
                maxKill : 0,
                loseTop:0,
                loseJun:0,
                loseMid:0,
                loseBot:0,
                loseSur:0
            }
            
            participantsInfo.forEach((data, index1) => {
                if(participantsInfo[index1].puuid == summonerData.puuid){
                    participantObj.parIndex = index1;
                    participantObj.win = participantsInfo[index1].win == "true" ? "WIN": "LOSE";
                    
                    if(participantsInfo[index1].doubleKills >= 1){
                        participantObj.maxContinuityKill = "더블킬";
                    }
                    if(participantsInfo[index1].tripleKills >= 1){
                        participantObj.maxContinuityKill = "트리플킬";
                    }
                    if(participantsInfo[index1].quadraKills >= 1){
                        participantObj.maxContinuityKill = "쿼드라킬";
                    }
                    if(participantsInfo[index1].pentaKills >= 1){
                        participantObj.maxContinuityKill = "펜타킬";
                    }
                }

                if(participantsInfo[index1].win == "true"){
                    participantObj.sumAllKill += participantsInfo[index1].kills;
                    
                }     
            });

            participantsInfo.forEach((data, index2) => {
                if(participantsInfo[index2].magicDamageDealtToChampions + participantsInfo[index2].physicalDamageDealtToChampions > bestplayers.bestDamge){
                    bestplayers.bestDamge = participantsInfo[index2].magicDamageDealtToChampions + participantsInfo[index2].physicalDamageDealtToChampions;
                    bestplayers.bestDamgeSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestDamgeChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestDamgePosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if(participantsInfo[index2].kills > bestplayers.bestKill){
                    bestplayers.bestKill = participantsInfo[index2].kills;
                    bestplayers.bestKillSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestKillChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestKillPosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if(participantsInfo[index2].deaths> bestplayers.bestDeath){
                    bestplayers.bestDeath = participantsInfo[index2].deaths;
                    bestplayers.bestDeathSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestDeathChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestDeathPosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if(participantsInfo[index2].assists > bestplayers.bestAssist){
                    bestplayers.bestAssist = participantsInfo[index2].assists;
                    bestplayers.bestAssistSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestAssistChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestAssistPosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if(participantsInfo[index2].totalDamageTaken > bestplayers.bestDamgeReceive){
                    bestplayers.bestDamgeReceive = participantsInfo[index2].totalDamageTaken;
                    bestplayers.bestDamgeReceiveSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestDamgeReceiveChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestDamgeReceivePosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if(participantsInfo[index2].goldEarned > bestplayers.bestgold){
                    bestplayers.bestgold = participantsInfo[index2].goldEarned;
                    bestplayers.bestgoldSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestgoldSummonerChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestgoldPosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if((participantsInfo[index2].deaths == 0 ? (participantsInfo[index2].kills + participantsInfo[index2].assists):(participantsInfo[index2].kills + participantsInfo[index2].assists)/participantsInfo[index2].deaths).toFixed(2) > bestplayers.bestKDA){
                    bestplayers.bestKDA = (participantsInfo[index2].deaths == 0 ? (participantsInfo[index2].kills + participantsInfo[index2].assists):(participantsInfo[index2].kills + participantsInfo[index2].assists)/participantsInfo[index2].deaths).toFixed(2);
                    bestplayers.bestKDASummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestKDAChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestKDAPosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
                if(participantsInfo[index2].totalMinionsKilled> bestplayers.bestCs){
                    bestplayers.bestCs = participantsInfo[index2].totalMinionsKilled;
                    bestplayers.bestCsSummoner = participantsInfo[index2].riotIdGameName +"#"+participantsInfo[index2].riotIdTagline;
                    bestplayers.bestCsChamp = participantsInfo[index2].championName == "FiddleSticks"? "Fiddlesticks": participantsInfo[index2].championName;
                    bestplayers.bestCsPosition = participantsInfo[index2].individualPosition.toLowerCase();
                }
            });

            participantsInfo.forEach((data, index3) => {

                if(participantsInfo[index3].win == "true" && matchInfo[index].info.queueId != 450){
                    winTeam.teamName = participantsInfo[index3].teamId == 100 ? "블루팀" : "레드팀"
                    winTeam.maxGold += participantsInfo[index3].goldEarned;
                    winTeam.maxKill += participantsInfo[index3].kills;

                    if(participantsInfo[index3].individualPosition == "TOP"){
                        winTeam.winTop = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "JUNGLE"){
                        winTeam.winJun = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "MIDDLE"){
                        winTeam.winMid = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "BOTTOM"){
                        winTeam.winBot = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "UTILITY"){
                        winTeam.winSur = index3;
                    }
                }
                if(participantsInfo[index3].win == "false" && matchInfo[index].info.queueId != 450){
                    loseTeam.teamName = participantsInfo[index3].teamId == 100 ? "블루팀" : "레드팀"
                    loseTeam.maxGold += participantsInfo[index3].goldEarned;
                    loseTeam.maxKill += participantsInfo[index3].kills;

                    if(participantsInfo[index3].individualPosition == "TOP"){
                        loseTeam.loseTop = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "JUNGLE"){
                        loseTeam.loseJun = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "MIDDLE"){
                        loseTeam.loseMid = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "BOTTOM"){
                        loseTeam.loseBot = index3;
                    }
                    if(participantsInfo[index3].individualPosition == "UTILITY"){
                        loseTeam.loseSur = index3;
                    }
                    
                }


            });  

            if(matchInfo[index].info.queueId == 450){
                participantsInfo.forEach((data, index4) => {

                    if(participantsInfo[index4].win == "true"){
                        winTeam.teamName = participantsInfo[index4].teamId == 100 ? "블루팀" : "레드팀"
                        winTeam.maxGold += participantsInfo[index4].goldEarned;
                        winTeam.maxKill += participantsInfo[index4].kills;
    
                        if(participantsInfo[index4].lane == "TOP"){
                            winTeam.winTop = index4;
                            winTeam.winJun = index4;
                            winTeam.winMid = index4;
                            winTeam.winBot = index4;
                            winTeam.winSur = index4;

                        }
                    }
                    
                    if(participantsInfo[index4].win == "false"){
                        loseTeam.teamName = participantsInfo[index4].teamId == 100 ? "블루팀" : "레드팀"
                        loseTeam.maxGold += participantsInfo[index4].goldEarned;
                        loseTeam.maxKill += participantsInfo[index4].kills;                    
                    }
                    if(index4== 0 || index4 == 5 && participantsInfo[index4].win == "true"){
                        winTeam.winIndex = index4;
                    }
                    if(index4== 0 || index4 == 5 && participantsInfo[index4].win == "false"){
                        loseTeam.loseIndex = index4;
                    }
                });
            }

            if(matchInfo[index].info.queueId == 450){
                winTeam.winTop = winTeam.winIndex;
                winTeam.winJun = winTeam.winIndex+1;
                winTeam.winMid = winTeam.winIndex+2;
                winTeam.winBot = winTeam.winIndex+3;
                winTeam.winSur = winTeam.winIndex+4;
    
                loseTeam.loseTop = loseTeam.loseIndex;
                loseTeam.loseJun = loseTeam.loseIndex+1;
                loseTeam.loseMid = loseTeam.loseIndex+2;
                loseTeam.loseBot = loseTeam.loseIndex+3;
                loseTeam.loseSur = loseTeam.loseIndex+4;
            }

            if(matchInfo[index].info.queueId == 420 || matchInfo[index].info.queueId == 490 || matchInfo[index].info.queueId == 490){
                daedkkeInfo.innerHTML += `
                <div class="match-box win-color" id="match-box">
                    <div class="match-info-fir">
                        <span class="info-text text-fir">${matchInfo[index].info.queueId == 420 ? "솔로랭크": matchInfo[index].info.queueId == 490 ? "일반게임" : "자유랭크"}</span>
                        <span class="info-text text-sec">${(whereTime.getMonth()+1).toString.length == 2 ? whereTime.getMonth()+1 : "0"+(whereTime.getMonth()+1)}/${whereTime.getDate()}</span>
                        <span class="info-text text-thi">${participantObj.win == "WIN" 
                        ? document.querySelectorAll('.text-thi').innerHTML = `<font color="#0004ff">${participantObj.win}</font>` 
                        : document.querySelectorAll('.text-thi').innerHTML = `<font color="#f4584e">${participantObj.win}</font>`}
                        </span>
                        <span class="info-text text-four">${startEndTime.getMinutes()}:${startEndTime.getSeconds()}</span>
                    </div>
                    <div class="match-info-sec">
                        <div class="cop-one">
                            <div class="cop-two">
                                <div class="cop-four">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[participantObj.parIndex].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[participantObj.parIndex].championName}.png"
                                        alt="" class="">
                                </div>
                                <span class="cop-five">${participantsInfo[participantObj.parIndex].champLevel}</span>
                            </div>
                            <div class="cop-three">
                                <div class="disflex diflmar">
                                    <div class="disflex"><img src="/static/images/spell/${participantsInfo[participantObj.parIndex].summoner1Id}.png" alt="" class="spell-img"></div>
                                    <div class="disflex" style="margin-left: 2px;"><img src="/static/images/spell/${participantsInfo[participantObj.parIndex].summoner2Id}.png" alt="" class="spell-img"></div>
                                </div>
    
                                <div class="disflex diflmar" style="margin-top: 2px;">
                                    <div class="disflex"><img src="/static/images/perks/${participantsInfo[participantObj.parIndex].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img"></div>
                                    <div class="disflex" style="margin-left: 2px;"><img src="/static/images/perks/${participantsInfo[participantObj.parIndex].perks.styles[1].style}.png" alt="" class="spell-img"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="match-info-thi">
                        <div class="text-kidecs">
                            <span>${participantsInfo[participantObj.parIndex].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[participantObj.parIndex].deaths}</span> / ${participantsInfo[participantObj.parIndex].assists} (${participantsInfo[participantObj.parIndex].deaths == 0 ? (participantsInfo[participantObj.parIndex].kills + participantsInfo[participantObj.parIndex].assists):((participantsInfo[participantObj.parIndex].kills + participantsInfo[participantObj.parIndex].assists)/participantsInfo[participantObj.parIndex].deaths).toFixed(2)})</span>
                        </div> 
                        <div class="text-kidecs">
                            <span>CS : ${participantsInfo[participantObj.parIndex].totalMinionsKilled} (${(participantsInfo[participantObj.parIndex].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                        </div>
                        <div style="display: flex;">
                            <span class="text-ck">연속킬 : </span>
                            <span class="text-ck">${participantObj.maxContinuityKill == "" ? "X": participantObj.maxContinuityKill}
                            </span>
                        </div>
                    </div>
                    <div class="kda-info">
                        <div class="kda-info-center">
                            <div class="text-kidecs">
                                <span>킬관여 : ${Math.round(((participantsInfo[participantObj.parIndex].kills+participantsInfo[participantObj.parIndex].assists)/participantObj.sumAllKill)*100)}%</span>
                            </div>
                            <div class="text-kidecs">
                                <span>제어와드 : ${participantsInfo[participantObj.parIndex].visionWardsBoughtInGame}</span>
                            </div>
                            <div class="text-kidecs">
                                <span>골드 : ${participantsInfo[participantObj.parIndex].goldEarned}</span>
                            </div>
                            <div class="text-kidecs">
                                <span>피해량 : ${participantsInfo[participantObj.parIndex].physicalDamageDealtToChampions+participantsInfo[participantObj.parIndex].magicDamageDealtToChampions}</span>
                            </div>
                        </div>
                    </div>
                    <ul class="show-match-summoner">
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[0].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[0].championName}.png" alt="">
                                </div>
                                <a target="_target" href="#" class="href-summoner">${participantsInfo[0].riotIdGameName +"#"+participantsInfo[0].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[0].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[0].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[5].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[5].championName}.png" alt="">5
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[5].riotIdGameName+"#"+participantsInfo[5].riotIdTagline}</a>
                                <input type="hidden" value = ${(participantsInfo[5].riotIdGameName).replaceAll(" ", "~")+"-"+participantsInfo[5].riotIdTagline}>
                                </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[1].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[1].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[1].riotIdGameName+"#"+participantsInfo[1].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[1].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[1].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[6].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[6].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[6].riotIdGameName+"#"+participantsInfo[6].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[6].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[6].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[2].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[2].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[2].riotIdGameName +"#"+participantsInfo[2].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[2].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[2].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[7].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[7].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[7].riotIdGameName+"#"+participantsInfo[7].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[7].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[7].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[3].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[3].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[3].riotIdGameName+"#"+participantsInfo[3].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[3].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[3].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[8].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[8].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[8].riotIdGameName+"#"+participantsInfo[8].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[8].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[8].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[4].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[4].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[4].riotIdGameName+"#"+participantsInfo[4].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[4].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[4].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[9].championName == "FilddleSticks"? "Filddlesticks":participantsInfo[9].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[9].riotIdGameName+"#"+participantsInfo[9].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[9].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[9].riotIdTagline}>
                            </div>
                        </li>
                    </ul>
                    <div class="action-form">
                        <button class="action active-trans">
                            <i class="fa-solid fa-chevron-up"></i>
                        </button>
                    </div>
                </div>
                <div class="detail-view-info" style="display : none">
                            <div class="sel-gasang">
                                <button class="sel-gasang-btn">개요</button>
                                <button class="sel-gasang-btn">상세</button>
                            </div>
                            <div class="ingame-info-box">
                                <div>
                                    <div>
                                        <div class="max-or-min" >
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최고딜량</span>
                                                <span class="mom-box-exp">${bestplayers.bestDamge}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestDamgeChamp}.png" style="margin-right: 5px;" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a">${bestplayers.bestDamgeSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value=${bestplayers.bestDamgeSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestDamgePosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최다 킬</span>
                                                <span class="mom-box-exp">${bestplayers.bestKill}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestKillChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestKillSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestKillSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestKillPosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최다 데스</span>
                                                <span class="mom-box-exp">${bestplayers.bestDeath}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestDeathChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestDeathSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestDeathSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestDeathPosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최다 어시스트</span>
                                                <span class="mom-box-exp">${bestplayers.bestAssist}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestAssistChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestAssistSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestAssistSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestAssistPosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="max-or-min">
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최다 받은 피해량</span>
                                                <span class="mom-box-exp">${bestplayers.bestDamgeReceive}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestDamgeReceiveChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestDamgeReceiveSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestDamgeReceiveSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestDamgeReceivePosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최다 획득 골드</span>
                                                <span class="mom-box-exp">${bestplayers.bestgold}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestgoldSummonerChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestgoldSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestgoldSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestgoldPosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최고 KDA</span>
                                                <span class="mom-box-exp">${bestplayers.bestKDA}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestKDAChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestKDASummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestKDASummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestKDAPosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mom-box">
                                                <span class="mom-box-sub">최고 CS</span>
                                                <span class="mom-box-exp">${bestplayers.bestCs}</span>
                                                <div
                                                    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                    <div class="mom-box-user-box">
                                                        <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestCsChamp}.png" alt="">
                                                        <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestCsSummoner}</a>
                                                        <input type="hidden" class="mom-box-input" value = ${bestplayers.bestCsSummoner.replaceAll(" ", "~")}>
                                                    </div>
                                                    <div style="align-items: end;">
                                                        <img src="/static/images/position/${bestplayers.bestCsPosition}.png" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="margin-bottom: 40px;">
                                            <div class="game-info">
                                                <div class="wol-info">
                                                    <span class="wol-info-fir">승리</span>
                                                    <span size="11" class="wol-info-text">${winTeam.teamName}</span>
                                                    <span class="wol-info-two">
                                                        <span class="wol-info-text" style="margin-right: 5px;">${(winTeam.maxGold / 1000).toFixed(1)}k</span>
                                                        <i class="fa-solid fa-coins" style="color: gold;"></i>
                                                    </span>
                                                    <span class="score-info" style="margin-right : 5px">${winTeam.maxKill}</span>
                                                </div>
                                                <div style="margin: 0px 1px;">
                                                    VS
                                                </div>
                                                <div class="wol-info-right">
                                                    <span class="score-info-right">${loseTeam.maxKill}</span>
                                                    <span class="wol-info-two">
                                                        <span class="wol-info-text" style="margin-left: 5px;">${(loseTeam.maxGold / 1000).toFixed(1)}k</span>
                                                        <i class="fa-solid fa-coins" style="color: gold;"></i>
                                                    </span>
                                                    <span size="11" class="wol-info-text">${loseTeam.teamName}</span>
                                                    <span class="wol-info-fir-right">패배</span>
                                                </div>
                                            </div>
                                            <div class="game-info-sang">
                                                <div class="game-info-sang-zeae">
                                                    <span class="game-info-sang-text" style="width: 86px;">아이템</span>
                                                    <span class="game-info-sang-text" style="width: 68px;">KDA/CS</span>
                                                    <span class="game-info-sang-text" style="width: 50px;">딜량</span>
                                                    <span class="game-info-sang-text" style="width: 91px;">소환사</span>
                                                    <span class="game-info-sang-text" style="width: 30px;"></span>
                                                </div>
                                                <span class="game-info-sang-line">라인</span>
                                                <div class="game-info-sang-zeae">
                                                    <span class="game-info-sang-text" style="width: 30px;"></span>
                                                    <span class="game-info-sang-text" style="width: 91px;">소환사</span>
                                                    <span class="game-info-sang-text" style="width: 50px;">딜량</span>
                                                    <span class="game-info-sang-text" style="width: 68px;">KDA/CS</span>
                                                    <span class="game-info-sang-text" style="width: 86px;">아이템</span>
                                                </div>
                                            </div>
                                            <div class="game-info-user">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winTop].deaths}</span> / ${participantsInfo[winTeam.winTop].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winTop].deaths == 0 ? (participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists):((participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists)/participantsInfo[winTeam.winTop].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winTop].totalMinionsKilled}(${(participantsInfo[winTeam.winTop].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winTop].physicalDamageDealtToChampions+participantsInfo[winTeam.winTop].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf"> 
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winTop].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winTop].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[winTeam.winTop].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winTop].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winTop].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winTop].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winTop].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winTop].riotIdGameName + "#"+ participantsInfo[winTeam.winTop].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winTop].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winTop].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>
    
                                                <div class="iafoul">
                                                   <img src="/static/images/position/top.png" alt="" class="position-img">
                                                </div>
    
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseTop].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseTop].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseTop].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseTop].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseTop].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseTop].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseTop].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseTop].riotIdGameName + "#"+ participantsInfo[loseTeam.loseTop].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseTop].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseTop].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseTop].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseTop].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                            ${participantsInfo[loseTeam.loseTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseTop].deaths}</span> / ${participantsInfo[loseTeam.loseTop].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseTop].deaths == 0 ? (participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists):((participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists)/participantsInfo[loseTeam.loseTop].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseTop].totalMinionsKilled}(${(participantsInfo[loseTeam.loseTop].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winJun].deaths}</span> / ${participantsInfo[winTeam.winJun].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winJun].deaths == 0 ? (participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists):((participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists)/participantsInfo[winTeam.winJun].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winJun].totalMinionsKilled}(${(participantsInfo[winTeam.winJun].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">27,554</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winJun].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winJun].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[winTeam.winJun].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winJun].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winJun].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winJun].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winJun].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winJun].riotIdGameName + "#"+ participantsInfo[winTeam.winJun].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winJun].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winJun].riotIdTagline}}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>
    
                                                <div class="iafoul">
                                                   <img src="/static/images/position/jungle.png" alt="" class="position-img">
                                                </div>
    
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseJun].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseJun].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseJun].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseJun].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseJun].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseJun].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseJun].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseJun].riotIdGameName + "#"+ participantsInfo[loseTeam.loseJun].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseJun].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseJun].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseJun].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseJun].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseJun].deaths}</span> / ${participantsInfo[loseTeam.loseJun].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseJun].deaths == 0 ? (participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists):((participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists)/participantsInfo[loseTeam.loseJun].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseJun].totalMinionsKilled}(${(participantsInfo[loseTeam.loseJun].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winMid].deaths}</span> / ${participantsInfo[winTeam.winMid].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winMid].deaths == 0 ? (participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists):((participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists)/participantsInfo[winTeam.winMid].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winMid].physicalDamageDealtToChampions+participantsInfo[winTeam.winMid].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">27,554</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winMid].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winMid].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[winTeam.winMid].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winMid].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winMid].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winMid].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winMid].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winMid].riotIdGameName + "#"+ participantsInfo[winTeam.winMid].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winMid].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winMid].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>
    
                                                <div class="iafoul">
                                                   <img src="/static/images/position/middle.png" alt="" class="position-img">
                                                </div>
    
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseMid].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseMid].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseMid].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseMid].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseMid].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseMid].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseMid].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseMid].riotIdGameName + "#"+ participantsInfo[loseTeam.loseMid].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseMid].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseMid].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseMid].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseMid].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                            ${participantsInfo[loseTeam.loseMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseMid].deaths}</span> / ${participantsInfo[loseTeam.loseMid].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                            ${participantsInfo[loseTeam.loseMid].deaths == 0 ? (participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists):((participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists)/participantsInfo[loseTeam.loseMid].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseMid].totalMinionsKilled}(${(participantsInfo[loseTeam.loseMid].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item5}.png" onerror="this.style.display='none'" alt="">
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winBot].deaths}</span> / ${participantsInfo[winTeam.winBot].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                            ${participantsInfo[winTeam.winBot].deaths == 0 ? (participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists):((participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists)/participantsInfo[winTeam.winBot].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winBot].totalMinionsKilled}(${(participantsInfo[winTeam.winBot].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winBot].physicalDamageDealtToChampions+participantsInfo[winTeam.winBot].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winBot].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winBot].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[winTeam.winBot].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winBot].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winBot].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winBot].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winBot].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winBot].riotIdGameName + "#"+ participantsInfo[winTeam.winBot].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winBot].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winBot].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>
    
                                                <div class="iafoul">
                                                   <img src="/static/images/position/bottom.png" alt="" class="position-img">
                                                </div>
    
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseBot].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseBot].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseBot].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseBot].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseBot].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseBot].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseBot].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseBot].riotIdGameName + "#"+ participantsInfo[loseTeam.loseBot].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseBot].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseBot]}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseBot].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseBot].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseBot].deaths}</span> / ${participantsInfo[loseTeam.loseBot].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseBot].deaths == 0 ? (participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists):((participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists)/participantsInfo[loseTeam.loseBot].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseBot].totalMinionsKilled}(${(participantsInfo[loseTeam.loseBot].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winSur].deaths}</span> / ${participantsInfo[winTeam.winSur].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winSur].deaths == 0 ? (participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists):((participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists)/participantsInfo[winTeam.winSur].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winSur].totalMinionsKilled}(${(participantsInfo[winTeam.winSur].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winSur].physicalDamageDealtToChampions+participantsInfo[winTeam.winSur].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winSur].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winSur].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[winTeam.winSur].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winSur].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[winTeam.winSur].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winSur].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[winTeam.winSur].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winSur].riotIdGameName + "#"+ participantsInfo[winTeam.winSur].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winSur].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winSur].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>
    
                                                <div class="iafoul">
                                                   <img src="/static/images/position/utility.png" alt="" class="position-img">
                                                </div>
    
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseSur].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseSur].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseSur].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseSur].summoner1Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/spell/${participantsInfo[loseTeam.loseSur].summoner2Id}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseSur].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="/static/images/perks/${participantsInfo[loseTeam.loseSur].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseSur].riotIdGameName + "#"+ participantsInfo[loseTeam.loseSur].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseSur].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseSur].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseSur].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseSur].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseSur].deaths}</span> / ${participantsInfo[loseTeam.loseSur].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseSur].deaths == 0 ? (participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists):((participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists)/participantsInfo[loseTeam.loseSur].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseSur].totalMinionsKilled}(${(participantsInfo[loseTeam.loseSur].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                `;
            }
            
            if(matchInfo[index].info.queueId == 450){
                daedkkeInfo.innerHTML += `
            <div class="match-box win-color" id="match-box">
                <div class="match-info-fir">
                    <span class="info-text text-fir">칼바람</span>
                    <span class="info-text text-sec">${(whereTime.getMonth()+1).toString.length == 2 ? whereTime.getMonth()+1 : "0"+(whereTime.getMonth()+1)}/${whereTime.getDate()}</span>
                    <span class="info-text text-thi">${participantObj.win == "WIN" 
                    ? document.querySelectorAll('.text-thi').innerHTML = `<font color="#0004ff">${participantObj.win}</font>` 
                    : document.querySelectorAll('.text-thi').innerHTML = `<font color="#f4584e">${participantObj.win}</font>`}
                    </span>
                    <span class="info-text text-four">${startEndTime.getMinutes()}:${startEndTime.getSeconds()}</span>
                </div>
                <div class="match-info-sec">
                    <div class="cop-one">
                        <div class="cop-two">
                            <div class="cop-four">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[participantObj.parIndex].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[participantObj.parIndex].championName}.png"
                                    alt="" class="">
                            </div>
                            <span class="cop-five">${participantsInfo[participantObj.parIndex].champLevel}</span>
                        </div>
                        <div class="cop-three">
                            <div class="disflex diflmar">
                                <div class="disflex"><img src="/static/images/spell/${participantsInfo[participantObj.parIndex].summoner1Id}.png" alt="" class="spell-img"></div>
                                <div class="disflex" style="margin-left: 2px;"><img src="/static/images/spell/${participantsInfo[participantObj.parIndex].summoner2Id}.png" alt="" class="spell-img"></div>
                            </div>

                            <div class="disflex diflmar" style="margin-top: 2px;">
                                <div class="disflex"><img src="/static/images/perks/${participantsInfo[participantObj.parIndex].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img"></div>
                                <div class="disflex" style="margin-left: 2px;"><img src="/static/images/perks/${participantsInfo[participantObj.parIndex].perks.styles[1].style}.png" alt="" class="spell-img"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="match-info-thi">
                    <div class="text-kidecs">
                        <span>${participantsInfo[participantObj.parIndex].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[participantObj.parIndex].deaths}</span> / ${participantsInfo[participantObj.parIndex].assists} (${participantsInfo[participantObj.parIndex].deaths == 0 ? (participantsInfo[participantObj.parIndex].kills + participantsInfo[participantObj.parIndex].assists):((participantsInfo[participantObj.parIndex].kills + participantsInfo[participantObj.parIndex].assists)/participantsInfo[participantObj.parIndex].deaths).toFixed(2)})</span>
                    </div>
                    <div class="text-kidecs">
                        <span>CS : ${participantsInfo[participantObj.parIndex].totalMinionsKilled} (${(participantsInfo[participantObj.parIndex].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                    </div>
                    <div style="display: flex;">
                        <span class="text-ck">연속킬 : </span>
                        <span class="text-ck">${participantObj.maxContinuityKill == "" ? "X": participantObj.maxContinuityKill}
                        </span>
                    </div>
                </div>
                <div class="kda-info">
                    <div class="kda-info-center">
                        <div class="text-kidecs">
                            <span>킬관여 : ${Math.round(((participantsInfo[participantObj.parIndex].kills+participantsInfo[participantObj.parIndex].assists)/participantObj.sumAllKill)*100)}%</span>
                        </div>
                        <div class="text-kidecs">
                            <span>제어와드 : ${participantsInfo[participantObj.parIndex].visionWardsBoughtInGame}</span>
                        </div>
                        <div class="text-kidecs">
                            <span>골드 : ${participantsInfo[participantObj.parIndex].goldEarned}</span>
                        </div>
                        <div class="text-kidecs">
                            <span>피해량 : ${participantsInfo[participantObj.parIndex].physicalDamageDealtToChampions+participantsInfo[participantObj.parIndex].magicDamageDealtToChampions}</span>
                        </div>
                    </div>
                </div>
                <ul class="show-match-summoner">
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[0].championName}.png" alt="">
                            </div>
                            <a target="_target" href="#" class="href-summoner">${participantsInfo[0].riotIdGameName +"#"+participantsInfo[0].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[0].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[0].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[5].championName}.png" alt="">5
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[5].riotIdGameName+"#"+participantsInfo[5].riotIdTagline}</a>
                            <input type="hidden" value = ${(participantsInfo[5].riotIdGameName).replaceAll(" ", "~")+"-"+participantsInfo[5].riotIdTagline}>
                            </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[1].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[1].riotIdGameName+"#"+participantsInfo[1].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[1].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[1].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[6].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[6].riotIdGameName+"#"+participantsInfo[6].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[6].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[6].riotIdTagline}>
                        </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[2].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[2].riotIdGameName +"#"+participantsInfo[2].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[2].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[2].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[7].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[7].riotIdGameName+"#"+participantsInfo[7].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[7].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[7].riotIdTagline}>
                        </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[3].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[3].riotIdGameName+"#"+participantsInfo[3].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[3].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[3].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[8].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[8].riotIdGameName+"#"+participantsInfo[8].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[8].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[8].riotIdTagline}>
                        </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[4].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[4].riotIdGameName+"#"+participantsInfo[4].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[4].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[4].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[9].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[9].riotIdGameName+"#"+participantsInfo[9].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[9].riotIdGameName.replaceAll(" ", "~")+"-"+participantsInfo[9].riotIdTagline}>
                        </div>
                    </li>
                </ul>
                <div class="action-form">
                    <button class="action active-trans">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                </div>
            </div>
            <div class="detail-view-info" style="display : none">
                        <div class="sel-gasang">
                            <button class="sel-gasang-btn">개요</button>
                            <button class="sel-gasang-btn">상세</button>
                        </div>
                        <div class="ingame-info-box">
                            <div>
                                <div>
                                    <div class="max-or-min" >
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최고딜량</span>
                                            <span class="mom-box-exp">${bestplayers.bestDamge}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestDamgeChamp}.png" style="margin-right: 5px;" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a">${bestplayers.bestDamgeSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value=${bestplayers.bestDamgeSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최다 킬</span>
                                            <span class="mom-box-exp">${bestplayers.bestKill}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestKillChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestKillSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestKillSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최다 데스</span>
                                            <span class="mom-box-exp">${bestplayers.bestDeath}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestDeathChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestDeathSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestDeathSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최다 어시스트</span>
                                            <span class="mom-box-exp">${bestplayers.bestAssist}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestAssistChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestAssistSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestAssistSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="max-or-min">
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최다 받은 피해량</span>
                                            <span class="mom-box-exp">${bestplayers.bestDamgeReceive}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestDamgeReceiveChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestDamgeReceiveSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestDamgeReceiveSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최다 획득 골드</span>
                                            <span class="mom-box-exp">${bestplayers.bestgold}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestgoldSummonerChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestgoldSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestgoldSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최고 KDA</span>
                                            <span class="mom-box-exp">${bestplayers.bestKDA}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestKDAChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestKDASummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestKDASummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mom-box">
                                            <span class="mom-box-sub">최고 CS</span>
                                            <span class="mom-box-exp">${bestplayers.bestCs}</span>
                                            <div
                                                style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                                <div class="mom-box-user-box">
                                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${bestplayers.bestCsChamp}.png" alt="">
                                                    <a target="_blank" href="#" class="mom-box-a" style="margin-left: 5px;">${bestplayers.bestCsSummoner}</a>
                                                    <input type="hidden" class="mom-box-input" value = ${bestplayers.bestCsSummoner.replaceAll(" ", "~")}>
                                                </div>
                                                <div style="align-items: end;">
                                                    <img src="/static/images/position/middle.png" alt="">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="margin-bottom: 40px;">
                                        <div class="game-info">
                                            <div class="wol-info">
                                                <span class="wol-info-fir">승리</span>
                                                <span size="11" class="wol-info-text">${winTeam.teamName}</span>
                                                <span class="wol-info-two">
                                                    <span class="wol-info-text" style="margin-right: 5px;">${(winTeam.maxGold / 1000).toFixed(1)}k</span>
                                                    <i class="fa-solid fa-coins" style="color: gold;"></i>
                                                </span>
                                                <span class="score-info" style="margin-right : 5px">${winTeam.maxKill}</span>
                                            </div>
                                            <div style="margin: 0px 1px;">
                                                VS
                                            </div>
                                            <div class="wol-info-right">
                                                <span class="score-info-right">${loseTeam.maxKill}</span>
                                                <span class="wol-info-two">
                                                    <span class="wol-info-text" style="margin-left: 5px;">${(loseTeam.maxGold / 1000).toFixed(1)}k</span>
                                                    <i class="fa-solid fa-coins" style="color: gold;"></i>
                                                </span>
                                                <span size="11" class="wol-info-text">${loseTeam.teamName}</span>
                                                <span class="wol-info-fir-right">패배</span>
                                            </div>
                                        </div>
                                        <div class="game-info-sang">
                                            <div class="game-info-sang-zeae">
                                                <span class="game-info-sang-text" style="width: 86px;">아이템</span>
                                                <span class="game-info-sang-text" style="width: 68px;">KDA/CS</span>
                                                <span class="game-info-sang-text" style="width: 50px;">딜량</span>
                                                <span class="game-info-sang-text" style="width: 91px;">소환사</span>
                                                <span class="game-info-sang-text" style="width: 30px;"></span>
                                            </div>
                                            <span class="game-info-sang-line">라인</span>
                                            <div class="game-info-sang-zeae">
                                                <span class="game-info-sang-text" style="width: 30px;"></span>
                                                <span class="game-info-sang-text" style="width: 91px;">소환사</span>
                                                <span class="game-info-sang-text" style="width: 50px;">딜량</span>
                                                <span class="game-info-sang-text" style="width: 68px;">KDA/CS</span>
                                                <span class="game-info-sang-text" style="width: 86px;">아이템</span>
                                            </div>
                                        </div>
                                        <div class="game-info-user">
                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winTop].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[winTeam.winTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winTop].deaths}</span> / ${participantsInfo[winTeam.winTop].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[winTeam.winTop].deaths == 0 ? (participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists):((participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists)/participantsInfo[winTeam.winTop].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[winTeam.winTop].totalMinionsKilled}(${(participantsInfo[winTeam.winTop].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winTop].physicalDamageDealtToChampions+participantsInfo[winTeam.winTop].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winTop].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winTop].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[winTeam.winTop].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winTop].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winTop].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winTop].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winTop].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winTop].riotIdGameName + "#"+ participantsInfo[winTeam.winTop].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[winTeam.winTop].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winTop].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 30px;"></div>
                                            </div>

                                            <div class="iafoul">
                                               <img src="/static/images/position/middle.png" alt="" class="position-img">
                                            </div>

                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 30px;"></div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseTop].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseTop].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseTop].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseTop].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseTop].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseTop].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseTop].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseTop].riotIdGameName + "#"+ participantsInfo[loseTeam.loseTop].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseTop].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseTop].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseTop].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseTop].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseTop].deaths}</span> / ${participantsInfo[loseTeam.loseTop].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[loseTeam.loseTop].deaths == 0 ? (participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists):((participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists)/participantsInfo[loseTeam.loseTop].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseTop].totalMinionsKilled}(${(participantsInfo[loseTeam.loseTop].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseTop].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="game-info-user">
                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winJun].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[winTeam.winJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winJun].deaths}</span> / ${participantsInfo[winTeam.winJun].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[winTeam.winJun].deaths == 0 ? (participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists):((participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists)/participantsInfo[winTeam.winJun].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[winTeam.winJun].totalMinionsKilled}(${(participantsInfo[winTeam.winJun].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">27,554</span>
                                                </div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winJun].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winJun].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[winTeam.winJun].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winJun].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winJun].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winJun].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winJun].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winJun].riotIdGameName + "#"+ participantsInfo[winTeam.winJun].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[winTeam.winJun].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winJun].riotIdTagline}}>
                                                </div>
                                                <div class="win-game-text" style="width: 30px;"></div>
                                            </div>

                                            <div class="iafoul">
                                               <img src="/static/images/position/middle.png" alt="" class="position-img">
                                            </div>

                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 30px;"></div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseJun].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseJun].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseJun].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseJun].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseJun].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseJun].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseJun].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseJun].riotIdGameName + "#"+ participantsInfo[loseTeam.loseJun].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseJun].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseJun].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseJun].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseJun].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[loseTeam.loseJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseJun].deaths}</span> / ${participantsInfo[loseTeam.loseJun].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[loseTeam.loseJun].deaths == 0 ? (participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists):((participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists)/participantsInfo[loseTeam.loseJun].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseJun].totalMinionsKilled}(${(participantsInfo[loseTeam.loseJun].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseJun].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="game-info-user">
                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winMid].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[winTeam.winMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winMid].deaths}</span> / ${participantsInfo[winTeam.winMid].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[winTeam.winMid].deaths == 0 ? (participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists):((participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists)/participantsInfo[winTeam.winMid].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winMid].physicalDamageDealtToChampions+participantsInfo[winTeam.winMid].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">27,554</span>
                                                </div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winMid].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winMid].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[winTeam.winMid].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winMid].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winMid].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winMid].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winMid].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winMid].riotIdGameName + "#"+ participantsInfo[winTeam.winMid].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[winTeam.winMid].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winMid].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 30px;"></div>
                                            </div>

                                            <div class="iafoul">
                                               <img src="/static/images/position/middle.png" alt="" class="position-img">
                                            </div>

                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 30px;"></div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseMid].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseMid].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseMid].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseMid].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseMid].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseMid].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseMid].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseMid].riotIdGameName + "#"+ participantsInfo[loseTeam.loseMid].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseMid].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseMid].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseMid].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseMid].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseMid].deaths}</span> / ${participantsInfo[loseTeam.loseMid].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseMid].deaths == 0 ? (participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists):((participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists)/participantsInfo[loseTeam.loseMid].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseMid].totalMinionsKilled}(${(participantsInfo[loseTeam.loseMid].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseMid].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="game-info-user">
                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                        <div style="display: flex;">
                                                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item0}.png" onerror="this.style.display='none'" alt="">
                                                        </div>
                                                        <div style="display: flex;">
                                                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item1}.png" onerror="this.style.display='none'" alt="">
                                                        </div>
                                                        <div style="display: flex;">
                                                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item2}.png" onerror="this.style.display='none'" alt="">
                                                        </div>
                                                        <div style="display: flex;">
                                                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item3}.png" onerror="this.style.display='none'" alt="">
                                                        </div>
                                                        <div style="display: flex;">
                                                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item4}.png" onerror="this.style.display='none'" alt="">
                                                        </div>
                                                        <div style="display: flex;">
                                                            <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winBot].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[winTeam.winBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winBot].deaths}</span> / ${participantsInfo[winTeam.winBot].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winBot].deaths == 0 ? (participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists):((participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists)/participantsInfo[winTeam.winBot].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[winTeam.winBot].totalMinionsKilled}(${(participantsInfo[winTeam.winBot].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winBot].physicalDamageDealtToChampions+participantsInfo[winTeam.winBot].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winBot].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winBot].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[winTeam.winBot].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winBot].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winBot].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winBot].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winBot].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winBot].riotIdGameName + "#"+ participantsInfo[winTeam.winBot].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[winTeam.winBot].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winBot].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 30px;"></div>
                                            </div>

                                            <div class="iafoul">
                                               <img src="/static/images/position/middle.png" alt="" class="position-img">
                                            </div>

                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 30px;"></div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseBot].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseBot].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseBot].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseBot].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseBot].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseBot].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                <img src="/static/images/perks/${participantsInfo[loseTeam.loseBot].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseBot].riotIdGameName + "#"+ participantsInfo[loseTeam.loseBot].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseBot].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseBot]}>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseBot].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseBot].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[loseTeam.loseBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseBot].deaths}</span> / ${participantsInfo[loseTeam.loseBot].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[loseTeam.loseBot].deaths == 0 ? (participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists):((participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists)/participantsInfo[loseTeam.loseBot].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseBot].totalMinionsKilled}(${(participantsInfo[loseTeam.loseBot].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseBot].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="game-info-user">
                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[winTeam.winSur].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[winTeam.winSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winSur].deaths}</span> / ${participantsInfo[winTeam.winSur].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[winTeam.winSur].deaths == 0 ? (participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists):((participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists)/participantsInfo[winTeam.winSur].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[winTeam.winSur].totalMinionsKilled}(${(participantsInfo[winTeam.winSur].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winSur].physicalDamageDealtToChampions+participantsInfo[winTeam.winSur].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[winTeam.winSur].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[winTeam.winSur].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[winTeam.winSur].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winSur].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winSur].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winSur].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[winTeam.winSur].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winSur].riotIdGameName + "#"+ participantsInfo[winTeam.winSur].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[winTeam.winSur].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[winTeam.winSur].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 30px;"></div>
                                            </div>

                                            <div class="iafoul">
                                               <img src="/static/images/position/middle.png" alt="" class="position-img">
                                            </div>

                                            <div class="win-game-info">
                                                <div class="win-game-text" style="width: 30px;"></div>
                                                <div class="win-game-text" style="width: 91px;">
                                                    <div class="aenclek">
                                                        <div class="frvizneed">
                                                            <div class="ebmaf">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${participantsInfo[loseTeam.loseSur].championName == "FiddleSticks"? "Fiddlesticks":participantsInfo[loseTeam.loseSur].championName}.png" alt="" class="gpvoyimg">
                                                            </div>
                                                            <span class="jurxazcpgcmw">${participantsInfo[loseTeam.loseSur].champLevel}</span>
                                                        </div>
                                                        <div class="spell-img-box">
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseSur].summoner1Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/spell/${participantsInfo[loseTeam.loseSur].summoner2Id}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex;">
                                                                <div style="display: flex;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseSur].perks.styles[0].selections[0].perk}.png" alt="" class="spell-img-once">
                                                                </div>
                                                                <div style="display: flex; margin-left: 2px;">
                                                                    <img src="/static/images/perks/${participantsInfo[loseTeam.loseSur].perks.styles[1].style}.png" alt="" class="spell-img-once">
                                                                </div>
                                                            </div>
                                                            <div style="display: flex; margin-top: 2px;"></div>
                                                        </div>
                                                    </div>
                                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseSur].riotIdGameName + "#"+ participantsInfo[loseTeam.loseSur].riotIdTagline}</a>
                                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseSur].riotIdGameName.replaceAll(" ", "~") + "-"+ participantsInfo[loseTeam.loseSur].riotIdTagline}>
                                                </div>
                                                <div class="win-game-text" style="width: 50px;">
                                                <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseSur].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseSur].magicDamageDealtToChampions}</span>
                                                </div>
                                                <div class="win-game-text" style="width: 68px;">
                                                    <span class="build-win-one">
                                                    ${participantsInfo[loseTeam.loseSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseSur].deaths}</span> / ${participantsInfo[loseTeam.loseSur].assists}
                                                    </span>
                                                    <span class="build-win-two">
                                                    ${participantsInfo[loseTeam.loseSur].deaths == 0 ? (participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists):((participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists)/participantsInfo[loseTeam.loseSur].deaths).toFixed(2)}
                                                    </span>
                                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseSur].totalMinionsKilled}(${(participantsInfo[loseTeam.loseSur].totalMinionsKilled/startEndTime.getMinutes()).toFixed(2)})</span>
                                                </div>
                                                <div class="win-game-text" style="width: 86px;">
                                                    <div>
                                                        <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${participantsInfo[loseTeam.loseSur].item5}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
            `;
            }
            
            participantObj.win == "LOSE" ? document.querySelectorAll(".match-box")[count].classList.replace("win-color","lose-color") : null;
            count++;
        });
    }
}

class ComponentEvent {
    static #instance = null;
    static getInstance(){
        if(this.#instance == null){
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    addClickEventShowGameDetailInfo(){
        const button = document.querySelectorAll(".action");
        const detailViewInfo = document.querySelectorAll(".detail-view-info");
        
        button.forEach((btn, index) => {
            
            btn.onclick = () => {
                if(detailViewInfo[index].style.display != "none"){
                    detailViewInfo[index].style.display = "none";
                    button[index].classList.replace("active","active-trans");
                } else {
                    detailViewInfo[index].style.display = "block";
                    button[index].classList.replace("active-trans","active");
                }
            }
        });
    }


    addClickATag(){
        const aTag = document.querySelectorAll(".href-summoner");
        const inputValue = document.querySelectorAll(".sulist-fcc input");
        
        aTag.forEach((tag, index) =>{
            tag.onclick = () =>{
                gameNameAndTagLine = inputValue[index].defaultValue.replaceAll("~", " ");
                let successFlag = RecordApi.getInstance().searchSummonerInfoByGameNameAndTagLine();

                if(successFlag){
                    location.href = `/record/${gameNameAndTagLine}`;
                } 
            }
        });
    }

    addClickATagTwice(){
        const bestBoxaTag = document.querySelectorAll(".mom-box-a");
        const inputValueTwice = document.querySelectorAll(".mom-box-input");

        bestBoxaTag.forEach((tag, index) =>{
            
            tag.onclick = () =>{
                gameNameAndTagLine = inputValueTwice[index].defaultValue.replaceAll("~", " ");
                gameNameAndTagLine = gameNameAndTagLine.replaceAll("#", "-");
                let successFlag = RecordApi.getInstance().searchSummonerInfoByGameNameAndTagLine();
                if(successFlag){
                    location.href = `/record/${gameNameAndTagLine}`;
                }
            }
        });
    }

    addClickATagThird(){
        const winGameTextaTag = document.querySelectorAll(".summoner-name");
        const inputValueThird= document.querySelectorAll(".win-game-text input");

        winGameTextaTag.forEach((tag, index2) =>{
            tag.onclick = () =>{
                gameNameAndTagLine = inputValueThird[index2].defaultValue.replaceAll("~", " ");
                let successFlag = RecordApi.getInstance().searchSummonerInfoByGameNameAndTagLine();

                if(successFlag){
                    location.href = `/record/${gameNameAndTagLine}`;
                } 
            }
        });
    }
}