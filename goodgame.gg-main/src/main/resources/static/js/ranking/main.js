window.onload = () => {
    HeaderService.getInstance().loadHeader();
    RankingMainService.getInstance().getLoadAllRankingList();

    ComponentEvent.getInstance().addClickEventSearchButton();
    ComponentEvent.getInstance().addClickEventsCssButton();
}



let ddragonUrl = "https://ddragon.leagueoflegends.com/cdn";


let checkObj = {
    summoner : ""
}

let searchRankingObj = {
    queueType : "solo",
    tier : "all",
    gameName : "",
    tagLine : "",
    limit : "Y",
    count : 30,
    page : 1,
    index : 0
}

let gameNameAndTagLine ="";

class RankingMainApi {
    static #instance = null;
    static getInstance(){
        if(this.#instance == null) {
            this.#instance = new RankingMainApi();
        }
        return this.#instance;
    }
    getAllRankingList(searchRankingObj){
        let returnData = null;

        $.ajax({
            async : false,
            type: "get",
            url: `http://localhost:8000/api/ranking/allList`,
            data: searchRankingObj,
            dataType: "json",
            success : response => {
                returnData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });

        return returnData;
    }


    checkNick(checkObj){
        let returnData = null;

        $.ajax({
            async : false,
            type: "get",
            url: `http://localhost:8000/api/ranking/checkNick`,
            data: checkObj,
            dataType: "json",
            success : response => {
                returnData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });

        return returnData;
    }




    getSearchRankingTotalCount(){
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/ranking/totalCount",
            data: {
                "queueType" : searchRankingObj.queueType,
                "tier" : searchRankingObj.tier,
                "gameName" : searchRankingObj.gameName,
                "tagLine" : searchRankingObj.tagLine
            },
            dataType: "json",
            success: response => {
                returnData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnData;
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
                alert("입력데이터를 다시 확인해주세요.");
            }
        });

        return returnData;
    }

}

class RankingMainService {
    static #instance = null;
    static getInstance(){
        if(this.#instance == null) {
            this.#instance = new RankingMainService();
        }
        return this.#instance;
    }

    loadPageController() {
        const pageController = document.querySelector(".page-controller");
        const infoContainer = document.querySelector(".info-container");
        const bottomContainer = document.querySelector(".total-page-count");

        const totalcount = RankingMainApi.getInstance().getSearchRankingTotalCount(searchRankingObj);
        const maxPageNumber = totalcount % searchRankingObj.count == 0
            ? Math.floor(totalcount / searchRankingObj.count)
            : Math.floor(totalcount / searchRankingObj.count) + 1;

        pageController.innerHTML = `
        <span class="pre-button disabled"><i class="fa-solid fa-play pre"></i></span>
        <ul class="page-numbers">
        </ul>
        <span class="next-button disabled"><i class="fa-solid fa-play next"></i></span>
        `;



        if(searchRankingObj.page != 1) {
            const preButton = pageController.querySelector(".pre-button");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchRankingObj.page--;
                this.getLoadAllRankingList();
            }
        }

        if(searchRankingObj.page != maxPageNumber) {
            const nextButton = pageController.querySelector(".next-button");
            nextButton.classList.remove("disabled");

            nextButton.onclick = () => {
                searchRankingObj.page++;
                this.getLoadAllRankingList();
            }
        }
        const startIndex = searchRankingObj.page % 10 == 0
            ? searchRankingObj.page - 9
            : searchRankingObj.page - (searchRankingObj.page % 10) + 1;

        const endIndex = startIndex + 9 <= maxPageNumber ? startIndex + 9 : maxPageNumber;




        const pageNumbers = document.querySelector(".page-numbers");

        for(let i = startIndex; i <= endIndex; i++) {
            pageNumbers.innerHTML += `
                <li><span class ="page-button ${i == searchRankingObj.page ? "disabled" : ""}">${i}</span></li>
            `;
        }

        const pageButtons = document.querySelectorAll(".page-button");
        pageButtons.forEach(button => {
            const pageNumber = button.textContent;
            if(pageNumber != searchRankingObj.page) {
                button.onclick = () => {
                    searchRankingObj.page = pageNumber;
                    this.getLoadAllRankingList();
                }
            }
        });

        //상단 하단 추가 정보
        const formattedTotalCount = totalcount.toLocaleString();
        infoContainer.innerHTML = `<p>현재 소환사의 협곡에는 ${formattedTotalCount}명 있습니다.</p>
                                    <p>마스터 이상의 소환사를 표시합니다. 순위는 주기적으로 업데이트 됩니다.</p>`

        const rowNum = document.querySelectorAll(".td-num")
        const start = rowNum[0].textContent;
        const end = rowNum[29].textContent;
        bottomContainer.innerHTML =`<span># ${start} ~ ${end} / 총 ${formattedTotalCount} 소환사</span>`


    }

    getLoadAllRankingList(){

        const responeseData = RankingMainApi.getInstance().getAllRankingList(searchRankingObj);
        const rankingTable = document.querySelector(".ranking-table tbody");

        rankingTable.innerHTML = '';

        responeseData.forEach((data, index) => {
            const formattedLeaguePoints = data.leaguePoints.toLocaleString();
            rankingTable.innerHTML += `
            <tr>
                <td class="td-num">${data.rankingRowNum}</td>
                <td class="td-name"> 
                    <a target="_target" class="summoner-link" href="#" style="text-decoration: none; color: inherit;">
                    <input type="hidden" class="td-name-link-value" value = ${data.gameName.replaceAll(" ", "~")+"-"+data.tagLine}>  
                    <img style="border-radius: 50%" src="${ddragonUrl}/14.8.1/img/profileicon/${data.profileIconId}.png" width="32px" height="32px">
                    <div>
                        <span class="td-name-span">${data.gameName}</span> 
                        <span>#${data.tagLine}</span>
                    </div>
                    </a>
                </td>
                <td class="td-tier">${data.tier} ${['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(data.tier) ? '' : data.rankValue}</td>
                <td class="td-lp">${formattedLeaguePoints} LP</td>
                <td class="td-level">${data.summonerLevel}</td>
                <td class="td-winRate">
                    <div class="td-winRate-div">
                        <div class="winRate-chart">
                            <div class="wins" style="flex-grow: ${data.wins}">
                                <span>${data.wins}W</span>
                            </div>
                            <div class="losses" style="flex-grow: ${data.losses}">
                                <span>${data.losses}L</span>
                            </div>
                        </div>
                        <span class="windRate-color">${data.winRate}</span>
                    </div>    
                                     
                </td>
            </tr>
            
            `;
        });
        ComponentEvent.getInstance().addClickATag();
        this.loadPageController();
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

    addClickEventSearchButton(){
        const selectItem = document.querySelectorAll(".select-item,.select-item-all");
        const searchInput = document.querySelector(".search-input");
        const queueSoloButton = document.querySelector(".queue-solo");
        const queueFlexButton = document.querySelector(".queue-flex");


        queueSoloButton.onclick = () => clickQueueType("solo");
        queueFlexButton.onclick = () => clickQueueType("flex");

        function clickQueueType(queue) {
            searchRankingObj.queueType = queue;
            selectItem.value = "all";
            searchInput.value = "";
            searchRankingObj.gameName = searchInput.value;
            searchRankingObj.tagLine = "";
            searchRankingObj.page = 1;
            searchRankingObj.tier = "all";
            RankingMainService.getInstance().getLoadAllRankingList();
        }

        selectItem.forEach(function (elem) {
            elem.addEventListener('click', function () {
                searchRankingObj.tier = elem.value;
                searchInput.value = "";
                searchRankingObj.gameName = "";
                searchRankingObj.tagLine = "";
                searchRankingObj.page = 1;
                RankingMainService.getInstance().getLoadAllRankingList();
            });
        })



        searchInput.addEventListener('keyup',function (event){
            if (event.keyCode == 13) {
                if (searchInput.value != null && searchInput.value != "" && searchInput.value.includes("#")) {
                    checkObj.summoner = searchInput.value.split("#")[0];
                    searchRankingObj.gameName = searchInput.value.split("#")[0];
                    searchRankingObj.tagLine = searchInput.value.split("#")[1];
                    searchRankingObj.page = 1;
                } else {
                    checkObj.summoner = searchInput.value;
                    searchRankingObj.gameName = searchInput.value;
                    searchRankingObj.tagLine = "";
                    searchRankingObj.page = 1;

                }

                let flag = RankingMainApi.getInstance().checkNick(checkObj);

                if (flag == 0) {
                    alert("존재하지 않는 소환사 입니다.")
                } else {
                    RankingMainService.getInstance().getLoadAllRankingList();
                }


            }

        })
    }

    addClickEventsCssButton(){

        const selectButton= document.querySelector('.select-button')
        const selectDiv= document.querySelector('.select-div')
        const selectItem = document.querySelectorAll(".select-item, .select-item-all");
        const arrow= document.querySelector('.arrow')
        const queues = document.querySelectorAll('.queue-solo, .queue-flex');


        queues.forEach(function(elem) {
            elem.addEventListener('click', function() {

                queues.forEach(function(index) {
                    index.classList.remove('selected');
                });

                elem.classList.add('selected');

                selectButton.innerHTML = ''; // 셀렉트 버튼 내용 초기화

                const span = document.createElement('span');
                span.textContent = 'ALL';
                selectButton.appendChild(span);

                arrowToggle();

            });
        });

        function arrowToggle() {
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'arrow';
            arrowSpan.textContent = '▼';
            selectButton.appendChild(arrowSpan);
        }

        // select-button 클릭 시 메뉴 토글
        selectButton.addEventListener('click', function() {
            selectButton.classList.toggle('selectButton-clicked');
            selectDiv.style.display = selectDiv.style.display === 'none' ? 'flex' : 'none';
            // 화살표 방향 변경
            this.querySelector('.arrow').textContent = selectDiv.style.display === 'none' ? '▼' : '▲';
        });


        selectItem.forEach(item => {
            item.addEventListener('click', function() {

                const text = this.querySelector('span').textContent;
                const imgSrc = this.querySelector('img') ? this.querySelector('img').src : null;

                // 버튼 내용을 초기화
                selectButton.innerHTML = '';

                // 이미지가 있는 경우, 이미지 추가
                if (imgSrc) {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.width = 22;
                    img.height = 22;
                    selectButton.appendChild(img);
                }

                // 텍스트 추가
                const span = document.createElement('span');
                span.textContent = text;
                selectButton.appendChild(span);

                // 화살표 토글
                arrowToggle()

                // 선택 시 메뉴 닫기
                selectButton.classList.remove('selectButton-clicked');
                selectDiv.style.display = 'none';
            });
        });



        // 메뉴 바깥 클릭 시 닫힘 처리
        document.addEventListener('click', function(e) {
            if (!selectButton.contains(e.target) && !selectDiv.contains(e.target)) {
                selectDiv.style.display = 'none';
                selectButton.classList.remove('selectButton-clicked');
                arrow.textContent = '▼'; // 화살표 방향 초기화
            }
        });
    }

    addClickATag(){
        const aTag = document.querySelectorAll(".summoner-link");
        const inputValue = document.querySelectorAll(".td-name-link-value");
        
        aTag.forEach((tag, index) =>{
            

            tag.onclick = () =>{
                gameNameAndTagLine = inputValue[index].defaultValue.replaceAll("~", " ");
                console.log(gameNameAndTagLine);
                let successFlag = RankingMainApi.getInstance().searchSummonerInfoByGameNameAndTagLine();

                if(successFlag){
                    location.href = `/record/${gameNameAndTagLine}`;
                } 
            }
        });
    }
}