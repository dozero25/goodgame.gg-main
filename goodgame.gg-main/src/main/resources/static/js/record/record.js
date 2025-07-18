window.onload = async () => {
    HeaderService.getInstance().loadHeader();
    SummonerService.getInstance().summonerShowInfo();
    CheckboxService.getInstance().ShowCheckbox();

    await RecordShowInfoService.getInstance().recodeMatchesShowInfo();

    await ComponentEvent.getInstance().addClickEventShowGameDetailInfo();
    ComponentEvent.getInstance().addClickATag();
    ComponentEvent.getInstance().addClickATagTwice();
    ComponentEvent.getInstance().addClickATagThird();
    ComponentEvent.getInstance().addClickShowMoreButton();
    ComponentEvent.getInstance().addClickRecodeRenewalBtn();
}

let gameNameAndTagLine = "";

let count = 0;
window.start = 0;
window.size = 10;

class RecordApi {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new RecordApi();
        }
        return this.#instance;
    }

    async searchSummonerInfoByGameNameAndTagLine(gameNameAndTagLine) {

        try {
            const responese = await fetch(`http://localhost:8000/api/record/search/summoner/${gameNameAndTagLine}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gameNameAndTagLine),
            });
            const result = await responese.json();
            return result.data;

        } catch (error) {
            console.error("searchSummonerInfoByGameNameAndTagLine", error);
            return error;
        }
    }

    async searchAccountInfoPuuid() {
        try {
            const responese = await fetch(`http://localhost:8000/api/record/get/account/info`);
            const result = await responese.json();

            return result.data;
        } catch (error) {
            console.error("recordError : ", error);
            return error;
        }
    }

    async searchSummonerInfoByEncryptedPUUID() {
        try {
            const responese = await fetch(`http://localhost:8000/api/record/get/summoner/info`);
            const result = await responese.json();

            return result.data;
        } catch (error) {
            console.error("recordError : ", error);
            return error;
        }
    }

    async searchMatchsByMatchId(start, puuid) {
        try {
            const responese = await fetch(`http://localhost:8000/api/record/get/matches?start=${start}&puuid=${puuid}`);
            const result = await responese.json();

            console.log(result);

            return result.data;
        } catch (error) {
            console.error("recordError : ", error);
            return error;
        }
    }

    async searchMatchInfoByMatchId(puuid) {
        try {
            const responese = await fetch(`http://localhost:8000/api/record/get/matches/info?puuid=${puuid}`);
            const result = await responese.json();

            console.log(result);

            return result.data;
        } catch (error) {
            console.error("searchMatchInfoByMatchId : ", error);
            return error;
        }
    }

    async searchLeagueBySummonerName() {
        try {
            const responese = await fetch(`http://localhost:8000/api/record/get/league`);
            const result = await responese.json();

            return result.data;
        } catch (error) {
            console.error("searchLeagueBySummonerName : ", error);
            return error;
        }
    }
}

class RecordShowInfoService {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new RecordShowInfoService();
        }
        return this.#instance;
    }

    async recodeMatchesShowInfo(start, size) {
        const summonerData = await RecordApi.getInstance().searchSummonerInfoByEncryptedPUUID();
        const userData = await UserInfoDataApi.getInstance().searchUserByPuuid(summonerData.puuid, start, size);

        if (!userData || !userData.matchRecordsList || userData.matchRecordsList.length === 0) {
            console.log("더 이상 불러올 매치 데이터가 없습니다.");
            return;
        }

        const fragment = document.createDocumentFragment();
        const daedkkeInfo = document.querySelector(".daedkke-info");

        const existingMatchIds = new Set(
            Array.from(document.querySelectorAll(".match-box"))
                .map(box => box.dataset.matchid)
        );

        const arenaQueueIds = [1700];

        const htmlList = await Promise.all(userData.matchRecordsList.map(async (record, i) => {
            const match = record.matchDto;
            const matchId = match.metadata.matchId;

            if (existingMatchIds.has(matchId)) return null;

            const queueId = match.info.queueId;
            const isArena = arenaQueueIds.includes(queueId);

            const processed = await this.buildMatchContext(match, summonerData.puuid, isArena);

            const html = await ComponentEvent.getInstance().createMatchBoxHtml(
                match,
                match.info.participants.find(p => p.puuid === summonerData.puuid),
                processed.participantObj,
                match.info.queueId,
                match.info.participants,
                processed.bestplayers,
                processed.winTeam,
                processed.loseTeam,
                processed.winTeamArena,
                processed.loseTeamArena,
                processed.userAugments,
                start + i + 1
            );

            return { html, matchId };
        }));

        htmlList.filter(Boolean).forEach(({ html, matchId }) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            const matchBox = tempDiv.firstElementChild;
            const detailView = tempDiv.querySelector(".detail-view-info");

            matchBox.dataset.matchid = matchId;

            fragment.appendChild(matchBox);
            fragment.appendChild(detailView);
        });

        daedkkeInfo.appendChild(fragment);
    }

    async buildMatchContext(match, userPuuid, isArena) {
        const participants = match.info.participants;
        const participantObj = { parIndex: 0, win: "", maxContinuityKill: "", sumAllKill: 0 };
        const bestplayers = {
            bestDamge: 0, bestDamgeSummoner: "", bestDamgeChamp: "", bestDamgePosition: "",
            bestKill: 0, bestKillSummoner: "", bestKillChamp: "", bestKillPosition: "",
            bestDeath: 0, bestDeathSummoner: "", bestDeathChamp: "", bestDeathPosition: "",
            bestAssist: 0, bestAssistSummoner: "", bestAssistChamp: "", bestAssistPosition: "",
            bestDamgeReceive: 0, bestDamgeReceiveSummoner: "", bestDamgeReceiveChamp: "", bestDamgeReceivePosition: "",
            bestgold: 0, bestgoldSummoner: "", bestgoldSummonerChamp: "", bestgoldPosition: "",
            bestKDA: 0, bestKDASummoner: "", bestKDAChamp: "", bestKDAPosition: "",
            bestCs: 0, bestCsSummoner: "", bestCsChamp: "", bestCsPosition: ""
        };
        const winTeam = { winIndex: 0, teamName: "", maxGold: 0, maxKill: 0, winTop: 0, winJun: 0, winMid: 0, winBot: 0, winSur: 0 };
        const loseTeam = { loseIndex: 0, teamName: "", maxGold: 0, maxKill: 0, loseTop: 0, loseJun: 0, loseMid: 0, loseBot: 0, loseSur: 0 };

        const winTeamArena = {};
        const loseTeamArena = {};
        const userAugments = {};

        const formatChampionName = (name) => name === "FiddleSticks" ? "Fiddlesticks" : name;
        const calculateKDA = (kills, assists, deaths) => deaths === 0 ? (kills + assists) : ((kills + assists) / deaths).toFixed(2);

        let userTeamId = null;

        participants.forEach((p, i) => {
            const champName = formatChampionName(p.championName);
            const position = p.individualPosition?.toLowerCase();
            const kda = calculateKDA(p.kills, p.assists, p.deaths);

            if (p.puuid === userPuuid) {
                userTeamId = p.teamId;
                participantObj.parIndex = i;
                participantObj.win = p.win ? "WIN" : "LOSE";

                if (p.pentaKills >= 1) participantObj.maxContinuityKill = "펜타킬";
                else if (p.quadraKills >= 1) participantObj.maxContinuityKill = "쿼드라킬";
                else if (p.tripleKills >= 1) participantObj.maxContinuityKill = "트리플킬";
                else if (p.doubleKills >= 1) participantObj.maxContinuityKill = "더블킬";
            }

            if (p.win === "true") participantObj.sumAllKill += p.kills;

            if (p.magicDamageDealtToChampions + p.physicalDamageDealtToChampions > bestplayers.bestDamge) {
                Object.assign(bestplayers, {
                    bestDamge: p.magicDamageDealtToChampions + p.physicalDamageDealtToChampions,
                    bestDamgeSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestDamgeChamp: champName,
                    bestDamgePosition: position
                });
            }
            if (p.kills > bestplayers.bestKill) {
                Object.assign(bestplayers, {
                    bestKill: p.kills,
                    bestKillSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestKillChamp: champName,
                    bestKillPosition: position
                });
            }
            if (p.deaths > bestplayers.bestDeath) {
                Object.assign(bestplayers, {
                    bestDeath: p.deaths,
                    bestDeathSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestDeathChamp: champName,
                    bestDeathPosition: position
                });
            }
            if (p.assists > bestplayers.bestAssist) {
                Object.assign(bestplayers, {
                    bestAssist: p.assists,
                    bestAssistSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestAssistChamp: champName,
                    bestAssistPosition: position
                });
            }
            if (p.totalDamageTaken > bestplayers.bestDamgeReceive) {
                Object.assign(bestplayers, {
                    bestDamgeReceive: p.totalDamageTaken,
                    bestDamgeReceiveSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestDamgeReceiveChamp: champName,
                    bestDamgeReceivePosition: position
                });
            }
            if (p.goldEarned > bestplayers.bestgold) {
                Object.assign(bestplayers, {
                    bestgold: p.goldEarned,
                    bestgoldSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestgoldSummonerChamp: champName,
                    bestgoldPosition: position
                });
            }
            if (kda > bestplayers.bestKDA) {
                Object.assign(bestplayers, {
                    bestKDA: kda,
                    bestKDASummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestKDAChamp: champName,
                    bestKDAPosition: position
                });
            }
            if (p.totalMinionsKilled > bestplayers.bestCs) {
                Object.assign(bestplayers, {
                    bestCs: p.totalMinionsKilled,
                    bestCsSummoner: `${p.riotIdGameName}#${p.riotIdTagline}`,
                    bestCsChamp: champName,
                    bestCsPosition: position
                });
            }
        });

        participantObj.sumAllKill = 0;
        participants.forEach((p) => {
            if (p.teamId === userTeamId) {
                participantObj.sumAllKill += p.kills;
            }
        });

        isArena
            ? await this.setTeamForArena(participants, winTeamArena, loseTeamArena, userPuuid, userAugments)
            : this.setTeamForStandard(participants, winTeam, loseTeam);

        return {
            match,
            participant: participants[participantObj.parIndex],
            participantObj,
            queueId: match.info.queueId,
            participants,
            bestplayers,
            winTeam,
            loseTeam,
            winTeamArena,
            loseTeamArena,
            userAugments
        };
    }

    async setTeamForArena(participants, winTeamArena, loseTeamArena, userPuuid, userAugments) {
        const teamMap = {};

        participants.forEach(p => {
            const teamId = p.missions.playerScore0;

            if (!teamMap[teamId]) {
                teamMap[teamId] = {
                    teamId,
                    totalScore: 0,
                    players: []
                };
            }
            teamMap[teamId].players.push(p);
        });

        const augmentMap = await this.fetchAllAugments(participants);

        Object.values(teamMap).forEach(team => {
            team.players = team.players.map(p => {
                const augments = [
                    augmentMap[p.playerAugment1] ?? "null",
                    augmentMap[p.playerAugment2] ?? "null",
                    augmentMap[p.playerAugment3] ?? "null",
                    augmentMap[p.playerAugment4] ?? "null"
                ];


                return {
                    ...p,
                    augments
                };
            });
        });

        const sortedTeams = Object.values(teamMap).sort((a, b) => a.teamId - b.teamId);

        sortedTeams.forEach((team, index) => {
            const rank = index + 1;
            const teamKey = `team_${rank}`;
            const teamData = {
                placement: rank,
                teamId: team.teamId,
                players: team.players
            };

            if (rank > 4) {
                loseTeamArena[teamKey] = teamData;
            } else {
                winTeamArena[teamKey] = teamData;
            }
        });

        const userPlayer = participants.find(p => p.puuid === userPuuid);
        if (userPlayer) {
            userAugments.data = [
                augmentMap[userPlayer.playerAugment1] ?? "null",
                augmentMap[userPlayer.playerAugment2] ?? "null",
                augmentMap[userPlayer.playerAugment3] ?? "null",
                augmentMap[userPlayer.playerAugment4] ?? "null"
            ];
        }
    }

    async fetchAllAugments(participants) {
        const ids = [];

        for (const p of participants) {
            [p.playerAugment1, p.playerAugment2, p.playerAugment3, p.playerAugment4]
                .forEach(id => id && ids.push(id));
        }

        const uniqueIds = [...new Set(ids)];

        const augmentMap = {};

        for (const id of uniqueIds) {
            try {
                const res = await AugmentInfoApi.getInstance().showInfoAugment(id);

                if (res && res.data) {
                    augmentMap[id] = res.data;
                } else {
                    console.warn(`No data for augment ID ${id}`, res);
                }
            } catch (e) {
                console.error(`Error fetching augment ID ${id}`, e);
            }
        }
        return augmentMap;
    }

    setTeamForStandard(participants, winTeam, loseTeam) {
        participants.forEach((p, i) => {
            const teamName = p.teamId === 100 ? "블루팀" : "레드팀";
            if (p.win) {
                winTeam.teamName = teamName;
                winTeam.maxGold += p.goldEarned;
                winTeam.maxKill += p.kills;
                if (p.individualPosition === "TOP") winTeam.winTop = i;
                if (p.individualPosition === "JUNGLE") winTeam.winJun = i;
                if (p.individualPosition === "MIDDLE") winTeam.winMid = i;
                if (p.individualPosition === "BOTTOM") winTeam.winBot = i;
                if (p.individualPosition === "UTILITY") winTeam.winSur = i;
            } else {
                loseTeam.teamName = teamName;
                loseTeam.maxGold += p.goldEarned;
                loseTeam.maxKill += p.kills;
                if (p.individualPosition === "TOP") loseTeam.loseTop = i;
                if (p.individualPosition === "JUNGLE") loseTeam.loseJun = i;
                if (p.individualPosition === "MIDDLE") loseTeam.loseMid = i;
                if (p.individualPosition === "BOTTOM") loseTeam.loseBot = i;
                if (p.individualPosition === "UTILITY") loseTeam.loseSur = i;
            }
        });
    }
}

class ComponentEvent {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    addClickShowMoreButton() {
        const button = document.querySelector(".showMoreBtn");
        const accountData = SummonerApi.getInstance().searchAccountInfoPuuid();
        button.addEventListener("click", async () => {
            button.disabled = true;
            start += size;

            try {
                const userData = await UserInfoDataApi.getInstance().searchUserByPuuid(accountData.puuid, start, size);

                if (userData && userData.matchRecordsList && userData.matchRecordsList.length > 0) {
                    await RecordShowInfoService.getInstance().recodeMatchesShowInfo(start, size);
                } else {
                    await RecordApi.getInstance().searchMatchsByMatchId(start, accountData.puuid);
                    await RecordApi.getInstance().searchMatchInfoByMatchId(accountData.puuid);
                    await RecordShowInfoService.getInstance().recodeMatchesShowInfo(start, size);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setTimeout(() => {
                    button.disabled = false;
                }, 2000);
            }
        })
    }

    async addClickEventShowGameDetailInfo() {
        const buttons = document.querySelectorAll(".action");
        const detailViewInfos = document.querySelectorAll(".detail-view-info");

        console.log(buttons.length);
        console.log(detailViewInfos.length);

        if (buttons.length !== detailViewInfos.length) {
            console.warn("[경고] 버튼 개수와 detail-view-info 개수가 다릅니다.");
        }

        buttons.forEach((btn, index) => {
            const detail = detailViewInfos[index];

            btn.addEventListener("click", () => {
                const isVisible = detail.style.display !== "none";
                detail.style.display = isVisible ? "none" : "block";
                btn.classList.replace(
                    isVisible ? "active" : "active-trans",
                    isVisible ? "active-trans" : "active"
                );
            });
        });
    }

    addClickATag() {
        const aTag = document.querySelectorAll(".href-summoner");
        const inputValue = document.querySelectorAll(".sulist-fcc input");

        aTag.forEach((tag, index) => {
            tag.onclick = async () => {
                gameNameAndTagLine = inputValue[index].defaultValue.replaceAll("~", " ");
                let successFlag = await RecordApi.getInstance().searchSummonerInfoByGameNameAndTagLine();

                if (successFlag) {
                    location.href = `/record/${gameNameAndTagLine}`;
                }
            }
        });
    }

    addClickATagTwice() {
        const bestBoxaTag = document.querySelectorAll(".mom-box-a");
        const inputValueTwice = document.querySelectorAll(".mom-box-input");

        bestBoxaTag.forEach((tag, index) => {

            tag.onclick = async () => {
                gameNameAndTagLine = inputValueTwice[index].defaultValue.replaceAll("~", " ");
                gameNameAndTagLine = gameNameAndTagLine.replaceAll("#", "-");
                let successFlag = await RecordApi.getInstance().searchSummonerInfoByGameNameAndTagLine();
                if (successFlag) {
                    location.href = `/record/${gameNameAndTagLine}`;
                }
            }
        });
    }

    addClickATagThird() {
        const winGameTextaTag = document.querySelectorAll(".summoner-name");
        const inputValueThird = document.querySelectorAll(".win-game-text input");

        winGameTextaTag.forEach((tag, index2) => {
            tag.onclick = async () => {
                gameNameAndTagLine = inputValueThird[index2].defaultValue.replaceAll("~", " ");
                let successFlag = await RecordApi.getInstance().searchSummonerInfoByGameNameAndTagLine();

                if (successFlag) {
                    location.href = `/record/${gameNameAndTagLine}`;
                }
            }
        });
    }

    addClickRecodeRenewalBtn() {
        const renewalBtn = document.querySelector(".recode-renewal-btn");
        const renewalRotate = document.querySelector(".fa-arrows-rotate");

        const accountData = SummonerApi.getInstance().searchAccountInfoPuuid();

        renewalBtn.addEventListener("click", async () => {
            renewalBtn.disabled = true;

            renewalRotate.classList.add("spinning");
            const startIndex = 0;

            try {
                const newMatchIds = await RecordApi.getInstance().searchMatchsByMatchId(startIndex, accountData.puuid);

                if (newMatchIds && newMatchIds.length > 0) {
                    await RecordApi.getInstance().searchMatchInfoByMatchId(accountData.puuid, newMatchIds);

                    await RecordShowInfoService.getInstance().recodeMatchesShowInfo(startIndex, size);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setTimeout(() => {
                    renewalRotate.classList.remove("spinning");
                    renewalBtn.disabled = false;
                }, 3000);
            }
        })
    }

    fixChampionName(name) {
        return name === "FiddleSticks" ? "Fiddlesticks" : name;
    }

    queueNameMap = {
        420: "솔로랭크",
        490: "일반게임",
        440: "자유랭크",
        450: "무작위 총력전",
        1700: "아레나"
    };

    getWinTextColorHTML(winStatus) {
        const color = winStatus === "WIN" ? "#0004ff" : "#f4584e";
        return `<font color=\"${color}\">${winStatus}</font>`;
    }

    getTimeAgoString(startTimestamp) {
        const now = new Date();
        const gameStartTime = new Date(startTimestamp);
        const diffMs = now - gameStartTime;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffDays >= 1) {
            return `${diffDays}일 전`;
        } else if (diffHours >= 1) {
            return `${diffHours}시간 전`;
        } else {
            return "방금 전";
        }
    }

    async createMatchBoxHtml(matchData, participant, participantObj, queueId, participantsInfo, bestplayers, winTeam, loseTeam, winTeamArena, loseTeamArena, userAugments) {
        const queueName = this.queueNameMap[queueId] || "기타";
        const timeAgo = this.getTimeAgoString(matchData.info.gameStartTimestamp);
        const duration = new Date(matchData.info.gameDuration * 1000);

        const matchResultClass = participantObj.win == "WIN" ? "match-box win-color" : "match-box lose-color";

        const champName = this.fixChampionName(participant.championName);
        const kda = participant.deaths === 0
            ? (participant.kills + participant.assists)
            : ((participant.kills + participant.assists) / participant.deaths).toFixed(2);

        const rankGameQueues = ["일반게임", "솔로랭크", "자유랭크"];
        const aramQueues = ["무작위 총력전"];
        const arenaQueues = ["아레나"];
        const errorQueues = ["기타"];

        if (rankGameQueues.includes(queueName)) {
            return `
            <div class="${matchResultClass}">
                <div class="match-info-fir">
                    <span class="info-text text-fir">${queueName}</span>
                    <span class="info-text text-sec">${timeAgo}</span>
                    <span class="info-text text-thi">${this.getWinTextColorHTML(participantObj.win)}</span>
                    <span class="info-text text-four">${duration.getMinutes()}:${duration.getSeconds().toString().padStart(2, '0')}</span>
                </div>
                <div class="match-info-sec">
                    <div class="cop-one">
                        <div class="cop-two">
                            <div class="cop-four">
                                <img src="${window.BASE_URL}/img/champion/${champName}.png" alt="">
                            </div>
                            <span class="cop-five">${participant.champLevel}</span>
                        </div>
                        <div class="cop-three">
                            <div class="disflex diflmar">
                                <div class="disflex"><img src="/static/images/spell/${participant.summoner1Id}.png" alt="" class="spell-img"></div>
                                <div class="disflex" style="margin-left: 2px;"><img src="/static/images/spell/${participant.summoner2Id}.png" alt="" class="spell-img"></div>
                            </div>
                            <div class="disflex diflmar" style="margin-top: 2px;">
                                <div class="disflex"><img src="/static/images/perks/${participant.perks.styles[0].selections[0].perk}.png" alt="" class="spell-img"></div>
                                <div class="disflex" style="margin-left: 2px;"><img src="/static/images/perks/${participant.perks.styles[1].style}.png" alt="" class="spell-img"></div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="match-info-thi">
                    <div class="text-kidecs">
                        <span>${participant.kills} / <span style="color: rgb(244, 88, 78);">${participant.deaths}</span> / ${participant.assists} (${kda})</span>
                    </div>
                    <div class="text-kidecs">
                        <span>CS : ${participant.totalMinionsKilled} (${(participant.totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                    </div>
                    <div style="display: flex;">
                        <span class="text-ck">연속킬 : </span>
                        <span class="text-ck">${participantObj.maxContinuityKill == "" ? "X" : participantObj.maxContinuityKill}
                        </span>
                    </div>
                </div>
                <div class="kda-info">
                    <div class="kda-info-center">
                        <div class="text-kidecs">
                            <span>킬관여 : ${Math.round(((participant.kills + participant.assists) / participantObj.sumAllKill) * 100)}%</span>
                        </div>
                        <div class="text-kidecs">
                            <span>제어와드 : ${participant.visionWardsBoughtInGame}</span>
                        </div>
                        <div class="text-kidecs">
                            <span>골드 : ${participant.goldEarned}</span>
                        </div>
                        <div class="text-kidecs">
                            <span>피해량 : ${participant.physicalDamageDealtToChampions + participant.magicDamageDealtToChampions}</span>
                        </div>
                    </div>
                </div>

                <ul class="show-match-summoner">
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[0].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[0].championName}.png" alt="">
                            </div>
                            <a target="_target" href="#" class="href-summoner">${participantsInfo[0].riotIdGameName + "#" + participantsInfo[0].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[0].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[0].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[5].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[5].championName}.png" alt="">5
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[5].riotIdGameName + "#" + participantsInfo[5].riotIdTagline}</a>
                            <input type="hidden" value = ${(participantsInfo[5].riotIdGameName).replaceAll(" ", "~") + "-" + participantsInfo[5].riotIdTagline}>
                            </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[1].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[1].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[1].riotIdGameName + "#" + participantsInfo[1].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[1].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[1].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[6].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[6].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[6].riotIdGameName + "#" + participantsInfo[6].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[6].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[6].riotIdTagline}>
                        </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[2].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[2].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[2].riotIdGameName + "#" + participantsInfo[2].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[2].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[2].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[7].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[7].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[7].riotIdGameName + "#" + participantsInfo[7].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[7].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[7].riotIdTagline}>
                        </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[3].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[3].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[3].riotIdGameName + "#" + participantsInfo[3].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[3].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[3].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[8].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[8].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[8].riotIdGameName + "#" + participantsInfo[8].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[8].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[8].riotIdTagline}>
                        </div>
                    </li>
                    <li class="summoner-list">
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[4].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[4].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[4].riotIdGameName + "#" + participantsInfo[4].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[4].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[4].riotIdTagline}>
                        </div>
                        <div class="sulist-fcc">
                            <div class="sulist-fcc-img">
                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[9].championName == "FilddleSticks" ? "Filddlesticks" : participantsInfo[9].championName}.png" alt="">
                            </div>
                            <a target="_blank" href="#" class="href-summoner">${participantsInfo[9].riotIdGameName + "#" + participantsInfo[9].riotIdTagline}</a>
                            <input type="hidden" value = ${participantsInfo[9].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[9].riotIdTagline}>
                        </div>
                    </li>
                </ul>
                <div class="action-form">
                    <button class="action active-trans">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                </div>
            </div>
            <div class="detail-view-info" style="display: none">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDamgeChamp}.png" style="margin-right: 5px;" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestKillChamp}.png" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDeathChamp}.png" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestAssistChamp}.png" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDamgeReceiveChamp}.png" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestgoldSummonerChamp}.png" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestKDAChamp}.png" alt="">
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
                                    <img src="${window.BASE_URL}/img/champion/${bestplayers.bestCsChamp}.png" alt="">
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
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item5}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[winTeam.winTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winTop].deaths}</span> / ${participantsInfo[winTeam.winTop].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[winTeam.winTop].deaths == 0 ? (participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists) : ((participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists) / participantsInfo[winTeam.winTop].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[winTeam.winTop].totalMinionsKilled}(${(participantsInfo[winTeam.winTop].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winTop].physicalDamageDealtToChampions + participantsInfo[winTeam.winTop].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 91px;">
                                    <div class="aenclek">
                                        <div class="frvizneed">
                                            <div class="ebmaf"> 
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winTop].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winTop].championName}.png" alt="" class="gpvoyimg">
                                            </div>
                                            <span class="jurxazcpgcmw">${participantsInfo[winTeam.winTop].champLevel}</span>
                                        </div>
                                        <div class="spell-img-box">
                                            <div style="display: flex;">
                                                <div style="display: flex;">
                                                    <img src="/static/images/spell/${participantsInfo[winTeam.winTop].summoner1Id}.png"  alt="" class="spell-img-once">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winTop].riotIdGameName + "#" + participantsInfo[winTeam.winTop].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[winTeam.winTop].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winTop].riotIdTagline}>
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
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseTop].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseTop].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseTop].riotIdGameName + "#" + participantsInfo[loseTeam.loseTop].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseTop].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseTop].riotIdTagline}>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseTop].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseTop].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                        ${participantsInfo[loseTeam.loseTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseTop].deaths}</span> / ${participantsInfo[loseTeam.loseTop].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[loseTeam.loseTop].deaths == 0 ? (participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists) : ((participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists) / participantsInfo[loseTeam.loseTop].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseTop].totalMinionsKilled}(${(participantsInfo[loseTeam.loseTop].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 86px;">
                                    <div>
                                        <div class="win-game-img-box">
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item5}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[winTeam.winJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winJun].deaths}</span> / ${participantsInfo[winTeam.winJun].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[winTeam.winJun].deaths == 0 ? (participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists) : ((participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists) / participantsInfo[winTeam.winJun].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[winTeam.winJun].totalMinionsKilled}(${(participantsInfo[winTeam.winJun].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">27,554</span>
                                </div>
                                <div class="win-game-text" style="width: 91px;">
                                    <div class="aenclek">
                                        <div class="frvizneed">
                                            <div class="ebmaf">
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winJun].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winJun].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winJun].riotIdGameName + "#" + participantsInfo[winTeam.winJun].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[winTeam.winJun].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winJun].riotIdTagline}}>
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
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseJun].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseJun].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseJun].riotIdGameName + "#" + participantsInfo[loseTeam.loseJun].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseJun].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseJun].riotIdTagline}>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseJun].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseJun].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[loseTeam.loseJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseJun].deaths}</span> / ${participantsInfo[loseTeam.loseJun].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[loseTeam.loseJun].deaths == 0 ? (participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists) : ((participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists) / participantsInfo[loseTeam.loseJun].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseJun].totalMinionsKilled}(${(participantsInfo[loseTeam.loseJun].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 86px;">
                                    <div>
                                        <div class="win-game-img-box">
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item5}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[winTeam.winMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winMid].deaths}</span> / ${participantsInfo[winTeam.winMid].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[winTeam.winMid].deaths == 0 ? (participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists) : ((participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists) / participantsInfo[winTeam.winMid].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winMid].physicalDamageDealtToChampions + participantsInfo[winTeam.winMid].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">27,554</span>
                                </div>
                                <div class="win-game-text" style="width: 91px;">
                                    <div class="aenclek">
                                        <div class="frvizneed">
                                            <div class="ebmaf">
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winMid].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winMid].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winMid].riotIdGameName + "#" + participantsInfo[winTeam.winMid].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[winTeam.winMid].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winMid].riotIdTagline}>
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
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseMid].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseMid].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseMid].riotIdGameName + "#" + participantsInfo[loseTeam.loseMid].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseMid].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseMid].riotIdTagline}>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseMid].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseMid].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                        ${participantsInfo[loseTeam.loseMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseMid].deaths}</span> / ${participantsInfo[loseTeam.loseMid].assists}
                                    </span>
                                    <span class="build-win-two">
                                        ${participantsInfo[loseTeam.loseMid].deaths == 0 ? (participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists) : ((participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists) / participantsInfo[loseTeam.loseMid].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseMid].totalMinionsKilled}(${(participantsInfo[loseTeam.loseMid].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 86px;">
                                    <div>
                                        <div class="win-game-img-box">
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item5}.png" onerror="this.style.display='none'" alt="">
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
                                            <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item0}.png" onerror="this.style.display='none'" alt="">
                                        </div>
                                        <div style="display: flex;">
                                            <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item1}.png" onerror="this.style.display='none'" alt="">
                                        </div>
                                        <div style="display: flex;">
                                            <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item2}.png" onerror="this.style.display='none'" alt="">
                                        </div>
                                        <div style="display: flex;">
                                            <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item3}.png" onerror="this.style.display='none'" alt="">
                                        </div>
                                        <div style="display: flex;">
                                            <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item4}.png" onerror="this.style.display='none'" alt="">
                                        </div>
                                        <div style="display: flex;">
                                            <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item5}.png" onerror="this.style.display='none'" alt="">
                                                </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[winTeam.winBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winBot].deaths}</span> / ${participantsInfo[winTeam.winBot].assists}
                                    </span>
                                    <span class="build-win-two">
                                        ${participantsInfo[winTeam.winBot].deaths == 0 ? (participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists) : ((participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists) / participantsInfo[winTeam.winBot].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[winTeam.winBot].totalMinionsKilled}(${(participantsInfo[winTeam.winBot].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winBot].physicalDamageDealtToChampions + participantsInfo[winTeam.winBot].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 91px;">
                                    <div class="aenclek">
                                        <div class="frvizneed">
                                            <div class="ebmaf">
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winBot].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winBot].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winBot].riotIdGameName + "#" + participantsInfo[winTeam.winBot].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[winTeam.winBot].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winBot].riotIdTagline}>
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
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseBot].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseBot].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseBot].riotIdGameName + "#" + participantsInfo[loseTeam.loseBot].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseBot].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseBot]}>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseBot].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseBot].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[loseTeam.loseBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseBot].deaths}</span> / ${participantsInfo[loseTeam.loseBot].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[loseTeam.loseBot].deaths == 0 ? (participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists) : ((participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists) / participantsInfo[loseTeam.loseBot].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseBot].totalMinionsKilled}(${(participantsInfo[loseTeam.loseBot].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 86px;">
                                    <div>
                                        <div class="win-game-img-box">
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item5}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[winTeam.winSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winSur].deaths}</span> / ${participantsInfo[winTeam.winSur].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[winTeam.winSur].deaths == 0 ? (participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists) : ((participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists) / participantsInfo[winTeam.winSur].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[winTeam.winSur].totalMinionsKilled}(${(participantsInfo[winTeam.winSur].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winSur].physicalDamageDealtToChampions + participantsInfo[winTeam.winSur].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 91px;">
                                    <div class="aenclek">
                                        <div class="frvizneed">
                                            <div class="ebmaf">
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winSur].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winSur].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winSur].riotIdGameName + "#" + participantsInfo[winTeam.winSur].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[winTeam.winSur].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winSur].riotIdTagline}>
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
                                                <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseSur].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseSur].championName}.png" alt="" class="gpvoyimg">
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
                                    <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseSur].riotIdGameName + "#" + participantsInfo[loseTeam.loseSur].riotIdTagline}</a>
                                    <input type="hidden" value = ${participantsInfo[loseTeam.loseSur].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseSur].riotIdTagline}>
                                </div>
                                <div class="win-game-text" style="width: 50px;">
                                <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseSur].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseSur].magicDamageDealtToChampions}</span>
                                </div>
                                <div class="win-game-text" style="width: 68px;">
                                    <span class="build-win-one">
                                    ${participantsInfo[loseTeam.loseSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseSur].deaths}</span> / ${participantsInfo[loseTeam.loseSur].assists}
                                    </span>
                                    <span class="build-win-two">
                                    ${participantsInfo[loseTeam.loseSur].deaths == 0 ? (participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists) : ((participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists) / participantsInfo[loseTeam.loseSur].deaths).toFixed(2)}
                                    </span>
                                    <span class="build-win-thi">${participantsInfo[loseTeam.loseSur].totalMinionsKilled}(${(participantsInfo[loseTeam.loseSur].totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                                </div>
                                <div class="win-game-text" style="width: 86px;">
                                    <div>
                                        <div class="win-game-img-box">
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item0}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item1}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item2}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item3}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item4}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                            <div style="display: flex;">
                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item5}.png" onerror="this.style.display='none'" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        } else if (aramQueues.includes(queueName)) {
            return `
                <div class="${matchResultClass}">
                    <div class="match-info-fir">
                        <span class="info-text text-fir">${queueName}</span>
                        <span class="info-text text-sec">${timeAgo}</span>
                        <span class="info-text text-thi">${this.getWinTextColorHTML(participantObj.win)}</span>
                        <span class="info-text text-four">${duration.getMinutes()}:${duration.getSeconds().toString().padStart(2, '0')}</span>
                    </div>
                    <div class="match-info-sec">
                        <div class="cop-one">
                            <div class="cop-two">
                                <div class="cop-four">
                                    <img src="${window.BASE_URL}/img/champion/${champName}.png"
                                        alt="" class="">
                                </div>
                                <span class="cop-five">${participant.champLevel}</span>
                            </div>
                            <div class="cop-three">
                                <div class="disflex diflmar">
                                    <div class="disflex"><img src="/static/images/spell/${participant.summoner1Id}.png" alt="" class="spell-img"></div>
                                    <div class="disflex" style="margin-left: 2px;"><img src="/static/images/spell/${participant.summoner2Id}.png" alt="" class="spell-img"></div>
                                </div>

                                <div class="disflex diflmar" style="margin-top: 2px;">
                                    <div class="disflex"><img src="/static/images/perks/${participant.perks.styles[0].selections[0].perk}.png" alt="" class="spell-img"></div>
                                    <div class="disflex" style="margin-left: 2px;"><img src="/static/images/perks/${participant.perks.styles[1].style}.png" alt="" class="spell-img"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="match-info-thi">
                        <div class="text-kidecs">
                            <span>${participant.kills} / <span style="color: rgb(244, 88, 78);">${participant.deaths}</span> / ${participant.assists} (${kda})</span>
                        </div>
                        <div class="text-kidecs">
                            <span>CS : ${participant.totalMinionsKilled} (${(participant.totalMinionsKilled / duration.getMinutes()).toFixed(2)})</span>
                        </div>
                        <div style="display: flex;">
                            <span class="text-ck">연속킬 : </span>
                            <span class="text-ck">${participantObj.maxContinuityKill == "" ? "X" : participantObj.maxContinuityKill}
                            </span>
                        </div>
                    </div>
                    <div class="kda-info">
                        <div class="kda-info-center">
                            <div class="text-kidecs">
                                <span>킬관여 : ${Math.round(((participant.kills + participant.assists) / participantObj.sumAllKill) * 100)}%</span>
                            </div>
                            <div class="text-kidecs">
                                <span>제어와드 : ${participant.visionWardsBoughtInGame}</span>
                            </div>
                            <div class="text-kidecs">
                                <span>골드 : ${participant.goldEarned}</span>
                            </div>
                            <div class="text-kidecs">
                                <span>피해량 : ${participant.physicalDamageDealtToChampions + participant.magicDamageDealtToChampions}</span>
                            </div>
                        </div>
                    </div>
                    <ul class="show-match-summoner">
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[0].championName}.png" alt="">
                                </div>
                                <a target="_target" href="#" class="href-summoner">${participantsInfo[0].riotIdGameName + "#" + participantsInfo[0].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[0].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[0].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[5].championName}.png" alt="">5
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[5].riotIdGameName + "#" + participantsInfo[5].riotIdTagline}</a>
                                <input type="hidden" value = ${(participantsInfo[5].riotIdGameName).replaceAll(" ", "~") + "-" + participantsInfo[5].riotIdTagline}>
                                </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[1].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[1].riotIdGameName + "#" + participantsInfo[1].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[1].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[1].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[6].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[6].riotIdGameName + "#" + participantsInfo[6].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[6].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[6].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[2].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[2].riotIdGameName + "#" + participantsInfo[2].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[2].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[2].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[7].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[7].riotIdGameName + "#" + participantsInfo[7].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[7].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[7].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[3].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[3].riotIdGameName + "#" + participantsInfo[3].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[3].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[3].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[8].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[8].riotIdGameName + "#" + participantsInfo[8].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[8].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[8].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[4].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[4].riotIdGameName + "#" + participantsInfo[4].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[4].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[4].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[9].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${participantsInfo[9].riotIdGameName + "#" + participantsInfo[9].riotIdTagline}</a>
                                <input type="hidden" value = ${participantsInfo[9].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[9].riotIdTagline}>
                            </div>
                        </li>
                    </ul>
                    <div class="action-form">
                        <button class="action active-trans">
                            <i class="fa-solid fa-chevron-up"></i>
                        </button>
                    </div>
                </div>
                <div class="detail-view-info" style="display: none">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDamgeChamp}.png" style="margin-right: 5px;" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestKillChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDeathChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestAssistChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDamgeReceiveChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestgoldSummonerChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestKDAChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestCsChamp}.png" alt="">
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
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winTop].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winTop].deaths}</span> / ${participantsInfo[winTeam.winTop].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winTop].deaths == 0 ? (participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists) : ((participantsInfo[winTeam.winTop].kills + participantsInfo[winTeam.winTop].assists) / participantsInfo[winTeam.winTop].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winTop].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winTop].physicalDamageDealtToChampions + participantsInfo[winTeam.winTop].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winTop].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winTop].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winTop].riotIdGameName + "#" + participantsInfo[winTeam.winTop].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winTop].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winTop].riotIdTagline}>
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
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseTop].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseTop].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseTop].riotIdGameName + "#" + participantsInfo[loseTeam.loseTop].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseTop].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseTop].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseTop].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseTop].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                            ${participantsInfo[loseTeam.loseTop].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseTop].deaths}</span> / ${participantsInfo[loseTeam.loseTop].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseTop].deaths == 0 ? (participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists) : ((participantsInfo[loseTeam.loseTop].kills + participantsInfo[loseTeam.loseTop].assists) / participantsInfo[loseTeam.loseTop].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseTop].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseTop].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winJun].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winJun].deaths}</span> / ${participantsInfo[winTeam.winJun].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winJun].deaths == 0 ? (participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists) : ((participantsInfo[winTeam.winJun].kills + participantsInfo[winTeam.winJun].assists) / participantsInfo[winTeam.winJun].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winJun].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winJun].physicalDamageDealtToChampions + participantsInfo[winTeam.winJun].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winJun].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winJun].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winJun].riotIdGameName + "#" + participantsInfo[winTeam.winJun].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winJun].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winJun].riotIdTagline}}>
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
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseJun].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseJun].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseJun].riotIdGameName + "#" + participantsInfo[loseTeam.loseJun].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseJun].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseJun].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseJun].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseJun].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseJun].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseJun].deaths}</span> / ${participantsInfo[loseTeam.loseJun].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseJun].deaths == 0 ? (participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists) : ((participantsInfo[loseTeam.loseJun].kills + participantsInfo[loseTeam.loseJun].assists) / participantsInfo[loseTeam.loseJun].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseJun].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseJun].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winMid].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winMid].deaths}</span> / ${participantsInfo[winTeam.winMid].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winMid].deaths == 0 ? (participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists) : ((participantsInfo[winTeam.winMid].kills + participantsInfo[winTeam.winMid].assists) / participantsInfo[winTeam.winMid].deaths).toFixed(2)}
                                                        </span>
                                                                    <span class="build-win-thi">${participantsInfo[winTeam.winMid].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winMid].physicalDamageDealtToChampions + participantsInfo[winTeam.winMid].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winMid].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winMid].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winMid].riotIdGameName + "#" + participantsInfo[winTeam.winMid].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winMid].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winMid].riotIdTagline}>
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
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseMid].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseMid].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseMid].riotIdGameName + "#" + participantsInfo[loseTeam.loseMid].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseMid].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseMid].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseMid].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseMid].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                            ${participantsInfo[loseTeam.loseMid].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseMid].deaths}</span> / ${participantsInfo[loseTeam.loseMid].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                            ${participantsInfo[loseTeam.loseMid].deaths == 0 ? (participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists) : ((participantsInfo[loseTeam.loseMid].kills + participantsInfo[loseTeam.loseMid].assists) / participantsInfo[loseTeam.loseMid].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseMid].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseMid].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winBot].item5}.png" onerror="this.style.display='none'" alt="">
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winBot].deaths}</span> / ${participantsInfo[winTeam.winBot].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                            ${participantsInfo[winTeam.winBot].deaths == 0 ? (participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists) : ((participantsInfo[winTeam.winBot].kills + participantsInfo[winTeam.winBot].assists) / participantsInfo[winTeam.winBot].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winBot].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winBot].physicalDamageDealtToChampions + participantsInfo[winTeam.winBot].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winBot].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winBot].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winBot].riotIdGameName + "#" + participantsInfo[winTeam.winBot].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winBot].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winBot].riotIdTagline}>
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
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseBot].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseBot].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseBot].riotIdGameName + "#" + participantsInfo[loseTeam.loseBot].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseBot].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseBot].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseBot].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseBot].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseBot].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseBot].deaths}</span> / ${participantsInfo[loseTeam.loseBot].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseBot].deaths == 0 ? (participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists) : ((participantsInfo[loseTeam.loseBot].kills + participantsInfo[loseTeam.loseBot].assists) / participantsInfo[loseTeam.loseBot].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseBot].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseBot].item5}.png" onerror="this.style.display='none'" alt="">
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
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[winTeam.winSur].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[winTeam.winSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[winTeam.winSur].deaths}</span> / ${participantsInfo[winTeam.winSur].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[winTeam.winSur].deaths == 0 ? (participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists) : ((participantsInfo[winTeam.winSur].kills + participantsInfo[winTeam.winSur].assists) / participantsInfo[winTeam.winSur].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[winTeam.winSur].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[winTeam.winSur].physicalDamageDealtToChampions + participantsInfo[winTeam.winSur].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[winTeam.winSur].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[winTeam.winSur].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[winTeam.winSur].riotIdGameName + "#" + participantsInfo[winTeam.winSur].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[winTeam.winSur].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[winTeam.winSur].riotIdTagline}>
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
                                                                    <img src="${window.BASE_URL}/img/champion/${participantsInfo[loseTeam.loseSur].championName == "FiddleSticks" ? "Fiddlesticks" : participantsInfo[loseTeam.loseSur].championName}.png" alt="" class="gpvoyimg">
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
                                                        <a target="_blank" href="#" class="summoner-name">${participantsInfo[loseTeam.loseSur].riotIdGameName + "#" + participantsInfo[loseTeam.loseSur].riotIdTagline}</a>
                                                        <input type="hidden" value = ${participantsInfo[loseTeam.loseSur].riotIdGameName.replaceAll(" ", "~") + "-" + participantsInfo[loseTeam.loseSur].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${participantsInfo[loseTeam.loseSur].physicalDamageDealtToChampions + participantsInfo[loseTeam.loseSur].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${participantsInfo[loseTeam.loseSur].kills} / <span style="color: rgb(244, 88, 78);">${participantsInfo[loseTeam.loseSur].deaths}</span> / ${participantsInfo[loseTeam.loseSur].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${participantsInfo[loseTeam.loseSur].deaths == 0 ? (participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists) : ((participantsInfo[loseTeam.loseSur].kills + participantsInfo[loseTeam.loseSur].assists) / participantsInfo[loseTeam.loseSur].deaths).toFixed(2)}
                                                        </span>
                                                        <span class="build-win-thi">${participantsInfo[loseTeam.loseSur].totalMinionsKilled}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${participantsInfo[loseTeam.loseSur].item5}.png" onerror="this.style.display='none'" alt="">
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
        `
        } else if (arenaQueues.includes(queueName)) {
            return `
        <div class="${matchResultClass}">
                    <div class="match-info-fir">
                        <span class="info-text text-fir">${queueName}</span>
                        <span class="info-text text-sec">${timeAgo}</span>
                        <span class="info-text text-thi">${this.getWinTextColorHTML(participantObj.win)}</span>
                        <span class="info-text text-four">${duration.getMinutes()}:${duration.getSeconds().toString().padStart(2, '0')}</span>
                    </div>
                    <div class="match-info-sec">
                        <div class="cop-one">
                            <div class="cop-two">
                                <div class="cop-four">
                                    <img src="${window.BASE_URL}/img/champion/${champName}.png"
                                        alt="" class="">
                                </div>
                                <span class="cop-five">${participant.champLevel}</span>
                            </div>
                            <div class="cop-three">
                                <div class="disflex diflmar">
                                    <div class="disflex"><img src="${userAugments.data[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${userAugments.data[0].name || ''}" class="spell-img"></div>
                                    <div class="disflex" style="margin-left: 2px;"><img src="${userAugments.data[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${userAugments.data[1].name || ''}" class="spell-img"></div>
                                </div>

                                <div class="disflex diflmar" style="margin-top: 2px;">
                                    <div class="disflex"><img src="${userAugments.data[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${userAugments.data[2].name || ''}" class="spell-img"></div>
                                    <div class="disflex" style="margin-left: 2px;"><img src="${userAugments.data[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${userAugments.data[3].name || ''}" class="spell-img"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="match-info-thi">
                        <div class="text-kidecs">
                            <span>${participant.kills} / <span style="color: rgb(244, 88, 78);">${participant.deaths}</span> / ${participant.assists} (${kda})</span>
                        </div>
                        <div style="display: flex;">
                            <span class="text-ck">연속킬 : </span>
                            <span class="text-ck">${participantObj.maxContinuityKill == "" ? "X" : participantObj.maxContinuityKill}
                            </span>
                        </div>
                    </div>
                    <div class="kda-info">
                        <div class="kda-info-center">
                            <div class="text-kidecs">
                                <span>${participant.missions.playerScore0}위</span>
                            </div>
                            <div class="text-kidecs">
                                <span>골드 : ${participant.goldEarned}</span>
                            </div>
                            <div class="text-kidecs">
                                <span>피해량 : ${participant.physicalDamageDealtToChampions + participant.magicDamageDealtToChampions}</span>
                            </div>
                        </div>
                    </div>
                    <ul class="show-match-summoner">
                        <li class="summoner-list" style="margin : 5px 0px;">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_1.players[0].championName}.png" alt="">
                                </div>
                                <a target="_target" href="#" class="href-summoner">${winTeamArena.team_1.players[0].riotIdGameName + "#" + winTeamArena.team_1.players[0].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_1.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_1.players[0].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_1.players[1].championName}.png" alt="">5
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_1.players[1].riotIdGameName + "#" + winTeamArena.team_1.players[1].riotIdTagline}</a>
                                <input type="hidden" value = ${(winTeamArena.team_1.players[1].riotIdGameName).replaceAll(" ", "~") + "-" + winTeamArena.team_1.players[1].riotIdTagline}>
                                </div>
                        </li>
                        <li class="summoner-list" style="margin : 5px 0px;">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_2.players[0].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_2.players[0].riotIdGameName + "#" + winTeamArena.team_2.players[0].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_2.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_2.players[0].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_2.players[1].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_2.players[1].riotIdGameName + "#" + winTeamArena.team_2.players[1].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_2.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_2.players[1].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list" style="margin : 5px 0px;">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_3.players[0].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_3.players[0].riotIdGameName + "#" + winTeamArena.team_3.players[0].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_3.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_3.players[0].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_3.players[1].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_3.players[1].riotIdGameName + "#" + winTeamArena.team_3.players[1].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_3.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_3.players[1].riotIdTagline}>
                            </div>
                        </li>
                        <li class="summoner-list" style="margin : 5px 0px;">
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_4.players[0].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_4.players[0].riotIdGameName + "#" + winTeamArena.team_4.players[0].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_4.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_4.players[0].riotIdTagline}>
                            </div>
                            <div class="sulist-fcc">
                                <div class="sulist-fcc-img">
                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_4.players[1].championName}.png" alt="">
                                </div>
                                <a target="_blank" href="#" class="href-summoner">${winTeamArena.team_4.players[1].riotIdGameName + "#" + winTeamArena.team_4.players[1].riotIdTagline}</a>
                                <input type="hidden" value = ${winTeamArena.team_4.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_4.players[1].riotIdTagline}>
                            </div>
                        </li>
                    </ul>
                    <div class="action-form">
                        <button class="action active-trans">
                            <i class="fa-solid fa-chevron-up"></i>
                        </button>
                    </div>
                </div>
                <div class="detail-view-info" style="display: none">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDamgeChamp}.png" style="margin-right: 5px;" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestKillChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDeathChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestAssistChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestDamgeReceiveChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestgoldSummonerChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestKDAChamp}.png" alt="">
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
                                                        <img src="${window.BASE_URL}/img/champion/${bestplayers.bestCsChamp}.png" alt="">
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

                                            <div class="game-info-sang">
                                                <div class="game-info-sang-zeae">
                                                    <span class="game-info-sang-text" style="width: 86px;">아이템</span>
                                                    <span class="game-info-sang-text" style="width: 68px;">KDA</span>
                                                    <span class="game-info-sang-text" style="width: 50px;">딜량</span>
                                                    <span class="game-info-sang-text" style="width: 91px;">소환사</span>
                                                    <span class="game-info-sang-text" style="width: 30px;"></span>
                                                </div>
                                                <span class="game-info-sang-line">순위</span>
                                                <div class="game-info-sang-zeae">
                                                    <span class="game-info-sang-text" style="width: 30px;"></span>
                                                    <span class="game-info-sang-text" style="width: 91px;">소환사</span>
                                                    <span class="game-info-sang-text" style="width: 50px;">딜량</span>
                                                    <span class="game-info-sang-text" style="width: 68px;">KDA</span>
                                                    <span class="game-info-sang-text" style="width: 86px;">아이템</span>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena win-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${winTeamArena.team_1.players[0].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_1.players[0].deaths}</span> / ${winTeamArena.team_1.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${winTeamArena.team_1.players[0].deaths == 0 ? (winTeamArena.team_1.players[0].kills + winTeamArena.team_1.players[0].assists) : ((winTeamArena.team_1.players[0].kills + winTeamArena.team_1.players[0].assists) / winTeamArena.team_1.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_1.players[0].physicalDamageDealtToChampions + winTeamArena.team_1.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_1.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_1.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_1.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_1.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_1.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_1.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_1.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_1.players[0].riotIdGameName + "#" + winTeamArena.team_1.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_1.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_1.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${winTeamArena.team_1.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_1.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_1.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_1.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_1.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_1.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_1.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_1.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_1.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_1.players[1].riotIdGameName + "#" + winTeamArena.team_1.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_1.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_1.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_1.players[1].physicalDamageDealtToChampions + winTeamArena.team_1.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                            ${winTeamArena.team_1.players[1].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_1.players[1].deaths}</span> / ${winTeamArena.team_1.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${winTeamArena.team_1.players[1].deaths == 0 ? (winTeamArena.team_1.players[1].kills + winTeamArena.team_1.players[1].assists) : ((winTeamArena.team_1.players[1].kills + winTeamArena.team_1.players[1].assists) / winTeamArena.team_1.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_1.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena win-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${winTeamArena.team_2.players[0].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_2.players[0].deaths}</span> / ${winTeamArena.team_2.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${winTeamArena.team_2.players[0].deaths == 0 ? (winTeamArena.team_2.players[0].kills + winTeamArena.team_2.players[0].assists) : ((winTeamArena.team_2.players[0].kills + winTeamArena.team_2.players[0].assists) / winTeamArena.team_2.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_2.players[0].physicalDamageDealtToChampions + winTeamArena.team_2.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_2.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_2.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_2.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_2.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_2.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_2.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_2.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_2.players[0].riotIdGameName + "#" + winTeamArena.team_2.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_2.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_2.players[0].riotIdTagline}}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${winTeamArena.team_2.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_2.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_2.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_2.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_2.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_2.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_2.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_2.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_2.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_2.players[1].riotIdGameName + "#" + winTeamArena.team_2.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_2.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_2.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_2.players[1].physicalDamageDealtToChampions + winTeamArena.team_2.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${winTeamArena.team_2.players[1].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_2.players[1].deaths}</span> / ${winTeamArena.team_2.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${winTeamArena.team_2.players[1].deaths == 0 ? (winTeamArena.team_2.players[1] + winTeamArena.team_2.players[1].assists) : ((winTeamArena.team_2.players[1].kills + winTeamArena.team_2.players[1].assists) / winTeamArena.team_2.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_2.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena win-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${winTeamArena.team_3.players[0].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_3.players[0].deaths}</span> / ${winTeamArena.team_3.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${winTeamArena.team_3.players[0].deaths == 0 ? (winTeamArena.team_3.players[0].kills + winTeamArena.team_3.players[0].assists) : ((winTeamArena.team_3.players[0].kills + winTeamArena.team_3.players[0].assists) / winTeamArena.team_3.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_3.players[0].physicalDamageDealtToChampions + winTeamArena.team_3.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_3.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_3.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_3.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_3.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_3.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_3.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_3.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_3.players[0].riotIdGameName + "#" + winTeamArena.team_3.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_3.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_3.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${winTeamArena.team_3.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_3.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_3.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_3.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_3.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_3.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_3.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_3.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_3.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_3.players[1].riotIdGameName + "#" + winTeamArena.team_3.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_3.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_3.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_3.players[1].physicalDamageDealtToChampions + winTeamArena.team_3.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                            ${winTeamArena.team_3.players[1].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_3.players[1].deaths}</span> / ${winTeamArena.team_3.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                            ${winTeamArena.team_3.players[1].deaths == 0 ? (winTeamArena.team_3.players[1].kills + winTeamArena.team_3.players[1].assists) : ((winTeamArena.team_3.players[1].kills + winTeamArena.team_3.players[1].assists) / winTeamArena.team_3.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_3.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena win-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                            </div>
                                                            <div style="display: flex;">
                                                                <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${winTeamArena.team_4.players[0].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_4.players[0].deaths}</span> / ${winTeamArena.team_4.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                            ${winTeamArena.team_4.players[0].deaths == 0 ? (winTeamArena.team_4.players[0].kills + winTeamArena.team_4.players[0].assists) : ((winTeamArena.team_4.players[0].kills + winTeamArena.team_4.players[0].assists) / winTeamArena.team_4.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_4.players[0].physicalDamageDealtToChampions + winTeamArena.team_4.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_4.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_4.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_4.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_4.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_4.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_4.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_4.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_4.players[0].riotIdGameName + "#" + winTeamArena.team_4.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_4.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_4.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${winTeamArena.team_4.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${winTeamArena.team_4.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : winTeamArena.team_4.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${winTeamArena.team_4.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_4.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_4.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${winTeamArena.team_4.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${winTeamArena.team_4.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${winTeamArena.team_4.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${winTeamArena.team_4.players[1].riotIdGameName + "#" + winTeamArena.team_4.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${winTeamArena.team_4.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + winTeamArena.team_4.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${winTeamArena.team_4.players[1].physicalDamageDealtToChampions + winTeamArena.team_4.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${winTeamArena.team_4.players[1].kills} / <span style="color: rgb(244, 88, 78);">${winTeamArena.team_4.players[1].deaths}</span> / ${winTeamArena.team_4.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${winTeamArena.team_4.players[1].deaths == 0 ? (winTeamArena.team_4.players[1].kills + winTeamArena.team_4.players[1].assists) : ((winTeamArena.team_4.players[1].kills + winTeamArena.team_4.players[1].assists) / winTeamArena.team_4.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${winTeamArena.team_4.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="game-info-user-arena lose-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_5.players[0].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_5.players[0].deaths}</span> / ${loseTeamArena.team_5.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_5.players[0].deaths == 0 ? (loseTeamArena.team_5.players[0].kills + loseTeamArena.team_5.players[0].assists) : ((loseTeamArena.team_5.players[0].kills + loseTeamArena.team_5.players[0].assists) / loseTeamArena.team_5.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_5.players[0].physicalDamageDealtToChampions + loseTeamArena.team_5.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_5.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_5.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_5.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_5.players[0].augments[0].iconSmallUrl || ''}" alt="${loseTeamArena.team_5.players[0].augments[0].name || ''}" onerror="this.style.display='none'" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_5.players[0].augments[1].iconSmallUrl || ''}" alt="${loseTeamArena.team_5.players[0].augments[0].name || ''}" onerror="this.style.display='none'" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_5.players[0].augments[2].iconSmallUrl || ''}" alt="${loseTeamArena.team_5.players[0].augments[0].name || ''}" onerror="this.style.display='none'" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_5.players[0].augments[3].iconSmallUrl || ''}" alt="${loseTeamArena.team_5.players[0].augments[0].name || ''}" onerror="this.style.display='none'" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_5.players[0].riotIdGameName + "#" + loseTeamArena.team_5.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_5.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_5.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${loseTeamArena.team_5.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_5.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_5.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_5.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_5.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_5.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_5.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_5.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_5.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_5.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_5.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_5.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_5.players[1].riotIdGameName + "#" + loseTeamArena.team_5.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_5.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_5.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_5.players[1].physicalDamageDealtToChampions + loseTeamArena.team_5.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_5.players[1].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_5.players[1].deaths}</span> / ${loseTeamArena.team_5.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_5.players[1].deaths == 0 ? (loseTeamArena.team_5.players[1].kills + loseTeamArena.team_5.players[1].assists) : ((loseTeamArena.team_5.players[1].kills + loseTeamArena.team_5.players[1].assists) / loseTeamArena.team_5.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_5.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena lose-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_6.players[0].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_6.players[0].deaths}</span> / ${loseTeamArena.team_6.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_6.players[0].deaths == 0 ? (loseTeamArena.team_6.players[0].kills + loseTeamArena.team_6.players[0].assists) : ((loseTeamArena.team_6.players[0].kills + loseTeamArena.team_6.players[0].assists) / loseTeamArena.team_6.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_6.players[0].physicalDamageDealtToChampions + loseTeamArena.team_6.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_6.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_6.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_6.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_6.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_6.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_6.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_6.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_6.players[0].riotIdGameName + "#" + loseTeamArena.team_6.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_6.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_6.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${loseTeamArena.team_6.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_6.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_6.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_6.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_6.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_6.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_6.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_6.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_6.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_6.players[1].riotIdGameName + "#" + loseTeamArena.team_6.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_6.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_6.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_6.players[1].physicalDamageDealtToChampions + loseTeamArena.team_6.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_6.players[1].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_6.players[1].deaths}</span> / ${loseTeamArena.team_6.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_6.players[1].deaths == 0 ? (loseTeamArena.team_6.players[1].kills + loseTeamArena.team_6.players[1].assists) : ((loseTeamArena.team_6.players[1].kills + loseTeamArena.team_6.players[1].assists) / loseTeamArena.team_6.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_6.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena lose-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_7.players[0].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_7.players[0].deaths}</span> / ${loseTeamArena.team_7.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_7.players[0].deaths == 0 ? (loseTeamArena.team_7.players[0].kills + loseTeamArena.team_7.players[0].assists) : ((loseTeamArena.team_7.players[0].kills + loseTeamArena.team_7.players[0].assists) / loseTeamArena.team_7.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_7.players[0].physicalDamageDealtToChampions + loseTeamArena.team_7.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_7.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_7.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_7.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_7.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_7.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_7.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_7.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_7.players[0].riotIdGameName + "#" + loseTeamArena.team_7.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_7.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_7.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${loseTeamArena.team_7.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_7.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_7.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_7.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_7.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_7.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_7.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_7.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_7.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_7.players[1].riotIdGameName + "#" + loseTeamArena.team_7.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_7.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_7.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_7.players[1].physicalDamageDealtToChampions + loseTeamArena.team_7.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_7.players[1].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_7.players[1].deaths}</span> / ${loseTeamArena.team_7.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_7.players[1].deaths == 0 ? (loseTeamArena.team_7.players[1].kills + loseTeamArena.team_7.players[1].assists) : ((loseTeamArena.team_7.players[1].kills + loseTeamArena.team_7.players[1].assists) / loseTeamArena.team_7.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_7.players[1].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="game-info-user-arena lose-color">
                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[0].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[0].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[0].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[0].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[0].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[0].item5}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_8.players[0].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_8.players[0].deaths}</span> / ${loseTeamArena.team_8.players[0].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_8.players[0].deaths == 0 ? (loseTeamArena.team_8.players[0].kills + loseTeamArena.team_8.players[0].assists) : ((loseTeamArena.team_8.players[0].kills + loseTeamArena.team_8.players[0].assists) / loseTeamArena.team_8.players[0].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                        <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_8.players[0].physicalDamageDealtToChampions + loseTeamArena.team_8.players[0].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_8.players[0].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_8.players[0].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_8.players[0].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_8.players[0].augments[0].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[0].augments[0].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_8.players[0].augments[1].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[0].augments[1].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_8.players[0].augments[2].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[0].augments[2].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_8.players[0].augments[3].iconSmallUrl || ''}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[0].augments[3].name || ''}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_8.players[0].riotIdGameName + "#" + loseTeamArena.team_8.players[0].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_8.players[0].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_8.players[0].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                </div>

                                                <div class="iafoul">
                                                   <div>${loseTeamArena.team_8.placement}위</div>
                                                </div>

                                                <div class="win-game-info">
                                                    <div class="win-game-text" style="width: 30px;"></div>
                                                    <div class="win-game-text" style="width: 91px;">
                                                        <div class="aenclek">
                                                            <div class="frvizneed">
                                                                <div class="ebmaf">
                                                                    <img src="${window.BASE_URL}/img/champion/${loseTeamArena.team_8.players[1].championName == "FiddleSticks" ? "Fiddlesticks" : loseTeamArena.team_8.players[1].championName}.png" alt="" class="gpvoyimg">
                                                                </div>
                                                                <span class="jurxazcpgcmw">${loseTeamArena.team_8.players[1].champLevel}</span>
                                                            </div>
                                                            <div class="spell-img-box">
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_8.players[1].augments[0].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[1].augments[0].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_8.players[1].augments[1].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[1].augments[1].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <div style="display: flex;">
                                                                        <img src="${loseTeamArena.team_8.players[1].augments[2].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[1].augments[2].name}" class="spell-img-once">
                                                                    </div>
                                                                    <div style="display: flex; margin-left: 2px;">
                                                                        <img src="${loseTeamArena.team_8.players[1].augments[3].iconSmallUrl}" onerror="this.style.display='none'" alt="${loseTeamArena.team_8.players[1].augments[3].name}" class="spell-img-once">
                                                                    </div>
                                                                </div>
                                                                <div style="display: flex; margin-top: 2px;"></div>
                                                            </div>
                                                        </div>
                                                        <a target="_blank" href="#" class="summoner-name">${loseTeamArena.team_8.players[1].riotIdGameName + "#" + loseTeamArena.team_8.players[1].riotIdTagline}</a>
                                                        <input type="hidden" value = ${loseTeamArena.team_8.players[1].riotIdGameName.replaceAll(" ", "~") + "-" + loseTeamArena.team_8.players[1].riotIdTagline}>
                                                    </div>
                                                    <div class="win-game-text" style="width: 50px;">
                                                    <span class="build-win-thi" style="margin-bottom: 6px;">${loseTeamArena.team_8.players[1].physicalDamageDealtToChampions + loseTeamArena.team_8.players[1].magicDamageDealtToChampions}</span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 68px;">
                                                        <span class="build-win-one">
                                                        ${loseTeamArena.team_8.players[1].kills} / <span style="color: rgb(244, 88, 78);">${loseTeamArena.team_8.players[1].deaths}</span> / ${loseTeamArena.team_8.players[1].assists}
                                                        </span>
                                                        <span class="build-win-two">
                                                        ${loseTeamArena.team_8.players[1].deaths == 0 ? (loseTeamArena.team_8.players[1].kills + loseTeamArena.team_8.players[1].assists) : ((loseTeamArena.team_8.players[1].kills + loseTeamArena.team_8.players[1].assists) / loseTeamArena.team_8.players[1].deaths).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div class="win-game-text" style="width: 86px;">
                                                        <div>
                                                            <div class="win-game-img-box">
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[1].item0}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[1].item1}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[1].item2}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[1].item3}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[1].item4}.png" onerror="this.style.display='none'" alt="">
                                                                </div>
                                                                <div style="display: flex;">
                                                                    <img src="${window.BASE_URL}/img/item/${loseTeamArena.team_8.players[1].item5}.png" onerror="this.style.display='none'" alt="">
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
        `
        } else if (errorQueues.includes(queueName)) {
            return `
            <div class="match-box">불편을 끼쳐 드려 죄송합니다. 빠르게 조치하겠습니다.</div>
        `
        }
    }
}
