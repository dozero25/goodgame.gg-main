window.onload = () => {
    HeaderService.getInstance().loadHeader();

    DuoMainService.getInstance().getLoadAllDuoList();

    ComponentEvent.getInstance().addClickEventModalButton();
    ComponentEvent.getInstance().addClickEventInsertButton(); 
    ComponentEvent.getInstance().addClickEventCheckButton();    
    ComponentEvent.getInstance().addClickEventTierButton();   
    ComponentEvent.getInstance().addClickEventPositionButton();
    ComponentEvent.getInstance().addClickEventQueButton();   
}

let searchObj = {
    searchQueValue: "",
    searchPositionValue: "",
    searchTierValue: "",
    limit: "Y",
    count: 12,
    page: 1
};

let duoObj = {

    duoGameId: "",
    duoQue: "",
    duoPosition: "",
    duoContent: "",
    duoThreeChampions:""

};

let checkObj = {
    duoGameId: ""
}

let checkOpenedObj = {
    positionOpen: 0,

    modalOpen: 0,
    queOpen: 0,
    tierOpen: 0,
    queDoubleIn: 0,
    positionDoubleIn: 0,

}

let gameNameAndTagLine ="";

class DuoMainApi {

    static #instance = null;

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new DuoMainApi();

        }
        return this.#instance;
    }

    getAllDuoList(searchObj) {

        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/duo/search`,
            data: searchObj,
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

    getDuoTotalCount() {

        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/duo/totalCount",
            data: {
                "searchQueValue": searchObj.searchQueValue,
                "searchPositionValue": searchObj.searchPositionValue,
                "searchTierValue": searchObj.searchTierValue

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

    postInsertDuo() {
        let successFlag = null;

        $.ajax({
            async: false,
            type: "post",
            url: "http://localhost:8000/api/duo/insert",
            data: duoObj,
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
                console.log(error);
            }
        });
        return successFlag;
    }

    CheckNick() {
        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/duo/checkNick",
            data: checkObj,
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

class DuoMainService {

    static #instance = null;

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new DuoMainService();
        }
        return this.#instance;
    }

    loadPageController() {

        const pageController = document.querySelector(".page-controller");

        const totalcount = DuoMainApi.getInstance().getDuoTotalCount(searchObj);

        const maxPageNumber = totalcount % searchObj.count == 0
            ? Math.floor(totalcount / searchObj.count)
            : Math.floor(totalcount / searchObj.count) + 1;

        pageController.innerHTML = `
            <span class="pre-button disabled"><i class="fa-solid fa-play pre"></i></span>
            <ul class="page-numbers">
            </ul>
            <span class="next-button disabled"><i class="fa-solid fa-play next"></i></span>
        `;

        if (searchObj.page != 1) {
            const preButton = pageController.querySelector(".pre-button");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchObj.page--;
                this.getLoadAllDuoList();
            }
        }

        if (searchObj.page != maxPageNumber) {
            const preButton = pageController.querySelector(".next-button");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchObj.page++;
                this.getLoadAllDuoList();
            }
        }
        const startIndex = searchObj.page % 5 == 0
            ? searchObj.page - 4
            : searchObj.page - (searchObj.page % 5) + 1;

        const endIndex = startIndex + 4 <= maxPageNumber ? startIndex + 4 : maxPageNumber;

        const pageNumbers = document.querySelector(".page-numbers");

        for (let i = startIndex; i <= endIndex; i++) {
            pageNumbers.innerHTML += ` 
                <li><span class ="page-button ${i == searchObj.page ? "disabled" : ""}">${i}</span></li>
            `;
        }

        const pageButtons = document.querySelectorAll(".page-button");
        pageButtons.forEach(button => {
            const pageNumber = button.textContent;
            if (pageNumber != searchObj.page) {
                button.onclick = () => {
                    searchObj.page = pageNumber;
                    this.getLoadAllDuoList();
                }
            }
        });
    }

    getLoadAllDuoList() {
        //리스트 전체 출력(조건에 맞게)
        const responseData = DuoMainApi.getInstance().getAllDuoList(searchObj);
        const duoTable = document.querySelector(".duo-table");

        duoTable.innerHTML = "";

        responseData.forEach((data, index) => {

            const now = new Date();
            const deadLine = new Date(data.duoWdate);
            const deadTime = (Math.floor((deadLine.getTime() - now.getTime()) / 1000 / 60));
            const uploadTime = Math.floor((now.getTime() - (new Date(data.duoWdate).getTime() - 900000)) / 60000);
            var champion=data.duoThreeChampions.toString().split("-");

            duoTable.innerHTML += `
        <div class="duoMiniBoard">
             <div id="miniBoardA">
                <span style="color: #36a2ce;  font-size: 12px">${uploadTime < 60 ? uploadTime + '분 전' : uploadTime < 1440 ? Math.floor(uploadTime / 60) + '시간 전' : Math.floor(uploadTime / 1440) + '일 전'}</span>
                <span style="color: rgb(153,153,153); font-size: 12px">${deadTime < 0 ? '만료' : deadTime + '분 후 만료'}</span>
             </div>
             <div id="miniBoardB">
                <span> ${data.duoQue} ${data.duoTier} 포지션 ${data.duoPosition==""?"상관없이":data.duoPosition} 갑니다</span>
             </div>
             <div id="miniBoardC" >
               <span> ${data.duoContent} </span>
             </div>
             <div id="miniBoardD" >
                  <img src="static/images/duo/position/${data.duoPosition}.png">
                  <a target="_target" href="#" class="nicknameClick">${data.duoGameId}</a>
                  <input type="hidden" class="mini-board-value" value = ${data.duoGameId.replaceAll(" ", "~").replaceAll("#", "-")}>
             </div>
             <div id="miniBoardE" >
                <img src="static/images/duo/tier/${data.duoTier}.png" class="miniBoardEImg"><br>
                 <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champion[0]}.png" class="miniBoardEImg"><br>
                  <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champion[1]}.png" class="miniBoardEImg"><br>
                    <img src="https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champion[2]}.png" class="miniBoardEImg"><br>
                       <button type="button" class="copy-button" value="${data.duoGameId}">아이디 복사</button>
             </div>
                
           
        </div>
            `;

        });
        this.loadPageController();
        ComponentEvent.getInstance().addClickATag();
        ComponentEvent.getInstance().addClickEventCopyButton();
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


    addClickEventModalButton() {
     //글 입력(모달창 여는 버튼) 누를때

        const btn = document.getElementById("insert-btn");
        const modal = document.getElementById("modalWrap");
        const closeBtn = document.getElementById("closeBtn");
        const modalBody = document.getElementById("modalBody");

        const idValue = document.getElementById("input-duoGameid");
        const contentValue = document.getElementById("duoContentValue");
        const idCheck = document.getElementById("pass");
        const idCheckMessage = document.getElementById("modalGameIdCheckMessage");


        btn.onclick = function () {


            if (btn.innerText == "글 작성") {
                btn.innerText = "글 작성 취소";
                modal.style.display = "block";
            } else if (btn.innerText == "글 작성 취소") {
                btn.innerText = "글 작성";
                modal.style.display = "none";
                idValue.value = "";
                contentValue.value = "";
                idCheck.value = "X";
                idCheckMessage.innerHTML = "";

            }

        };

        closeBtn.onclick = function () {
            modal.style.display = "none";
            btn.innerText = "글 작성";
            idValue.value = "";
            contentValue.value = "";
            idCheck.value = "X";
            idCheckMessage.innerHTML = "";
        };

        //모달 창 이외의 부분이 눌릴 때 창 닫히고 내부 데이터 초기화
        window.onclick = function (e) {
            if (!btn.contains(e.target) && !modalBody.contains(e.target)) {
                btn.innerText = "글 작성";
                modal.style.display = "none";
                idValue.value = "";
                contentValue.value = "";
                idCheck.value = "X";
                idCheckMessage.innerHTML = "";
            }
        };

    }

    addClickEventInsertButton() {

        const insertBtn = document.getElementById("insert-success-btn");

        insertBtn.onclick = () => {
            const passCheck = document.getElementById("pass");
            if (passCheck.value.toString() === "X") {
                alert("아이디 확인을 진행해주세요");
            } else {
                const modal = document.getElementById("modalWrap");
                const GameIdValue = document.getElementById("input-duoGameid");
                const QueValue = document.querySelector('input[type=radio][name=duoQue]:checked');
                const PositionValue = document.querySelector('input[type=radio][name=duoPosition]:checked');
                const ContentValue = document.getElementById("duoContentValue");
                const idCheckMessage = document.getElementById("modalGameIdCheckMessage");

                duoObj.duoGameId = GameIdValue.value;
                duoObj.duoQue = QueValue.value;
                duoObj.duoPosition = PositionValue.value;
                duoObj.duoContent = ContentValue.value;


                DuoMainApi.getInstance().postInsertDuo();
                modal.style.display = "none";
                searchObj.searchQueValue = "";
                searchObj.searchPositionValue = "";
                searchObj.searchTierValue = "";
                searchObj.page = 1;
                DuoMainService.getInstance().getLoadAllDuoList();
                location.reload(true);
               
                GameIdValue.value = "";
                ContentValue.value = "";
                idCheckMessage.innerHTML = "";
                passCheck.value = "X";
            }
        }
    }

    addClickEventCheckButton() {
        const checkBtn = document.getElementById("check-gameid-btn");
        const printMsg = document.getElementById("modalGameIdCheckMessage");

        checkBtn.onclick = function () {
            const givenNick = document.getElementById("input-duoGameid");
            const passCheck = document.getElementById("pass");

            if (!(givenNick.value.toString().includes("#"))) {
                passCheck.value = "X";
                printMsg.style.color = "red";
                printMsg.innerText = "아이디 확인 필요";
                alert('아이디 형식을 확인해주세요\n(게임 닉네임+#+태그)');
            } else {
                checkObj.duoGameId = givenNick.value;
                let resultflag = (DuoMainApi.getInstance().CheckNick());
                if (resultflag == 1) {

                    passCheck.value = "X";
                    printMsg.style.color = "red";
                    printMsg.innerText = "아이디 확인 필요";
                    alert('아이디가 존재하지 않거나 아이디 형식을 확인해주세요\n(게임 닉네임+#+태그)');
                } else {

                    passCheck.value = "O";
                    printMsg.style.color = "green";
                    printMsg.innerHTML = "아이디 통과";

                    alert('아이디 통과');
                }

            }
        }

    }

    addClickEventCopyButton() {
        const copyBtn = document.querySelectorAll(".copy-button");

        copyBtn.forEach(function (data) {
            data.addEventListener('click', function () {

                window.navigator.clipboard.writeText(data.value);

                alert("복사 완료!");
            })


        });
    }

    addClickEventTierButton() {
        const tierSelectField = document.getElementById("tier-selectField");
        const tierList = document.getElementById("tier-list");
        const tierArrowIcon = document.getElementById("tier-arrowIcon");
        const tierOptions = document.querySelectorAll(".tier-options");
        const tierSelectText = document.getElementById("tier-selectText");
        const positionSelectText = document.getElementById("position-selectText");
        const queSelectText = document.getElementById("que-selectText");

        tierSelectField.onclick = function () {
            tierList.classList.toggle("tier-hide");

            tierArrowIcon.classList.toggle("tier-rotate");
            if (checkOpenedObj.tierOpen == 0) {
                checkOpenedObj.tierOpen = 1;
            } else if (checkOpenedObj.tierOpen == 1) {
                checkOpenedObj.tierOpen = 0;
            }

        }


        tierOptions.forEach(function (data) {
            data.addEventListener('click', function () {

                tierSelectText.innerHTML = this.textContent;
                tierList.classList.toggle("tier-hide");
                tierArrowIcon.classList.toggle("tier-rotate");
                checkOpenedObj.tierDoubleIn = 1;
                if (tierSelectText.innerText === "티어 전체") {
                    searchObj.searchTierValue = ""
                } else {
                    searchObj.searchTierValue = tierSelectText.innerText;
                }
                if (queSelectText.innerText === "게임타입 전체") {
                    searchObj.searchQueValue = ""
                } else {
                    searchObj.searchPositionValue = queSelectText.innerText;
                }
                if (positionSelectText.innerText === "상관 없음") {
                    searchObj.searchPositionValue = ""
                } else {
                    searchObj.searchPositionValue = positionSelectText.innerText;
                }

                DuoMainService.getInstance().getLoadAllDuoList();
                checkOpenedObj.tierOpen = 0;
            })


        });

        document.addEventListener('click', function (e) {

            if (!tierSelectField.contains(e.target) && checkOpenedObj.tierOpen == 1 && checkOpenedObj.tierDoubleIn == 0) {
                tierList.classList.toggle("tier-hide");
                tierArrowIcon.classList.toggle("tier-rotate");
                checkOpenedObj.tierOpen = 0;

            }
            checkOpenedObj.tierDoubleIn = 0;
        });

    }

    addClickEventPositionButton() {
        const positionSelectField = document.getElementById("position-selectField");

        const positionList = document.getElementById("position-list");

        const positionArrowIcon = document.getElementById("position-arrowIcon");

        const positionOptions = document.querySelectorAll(".position-options");

        const tierSelectText = document.getElementById("tier-selectText");
        const positionSelectText = document.getElementById("position-selectText");
        const queSelectText = document.getElementById("que-selectText");

        positionSelectField.onclick = function () {

            positionList.classList.toggle("position-hide");

            positionArrowIcon.classList.toggle("position-rotate");
            if (checkOpenedObj.positionOpen == 0) {
                checkOpenedObj.positionOpen = 1;
            } else if (checkOpenedObj.positionOpen == 1) {
                checkOpenedObj.positionOpen = 0;
            }
        }

        positionOptions.forEach(function (data) {
            data.addEventListener('click', function () {


                positionSelectText.innerHTML = this.textContent;

                positionList.classList.toggle("position-hide");

                positionArrowIcon.classList.toggle("position-rotate");
                checkOpenedObj.positionDoubleIn = 1;

                if (tierSelectText.innerText === "티어 전체") {
                    searchObj.searchTierValue = ""
                } else {
                    searchObj.searchTierValue = tierSelectText.innerText;
                }
                if (queSelectText.innerText === "게임타입 전체") {
                    searchObj.searchQueValue = ""
                } else {
                    searchObj.searchQueValue = queSelectText.innerText;
                }
                if (positionSelectText.innerText === "상관 없음") {
                    searchObj.searchPositionValue = ""
                } else {
                    searchObj.searchPositionValue = positionSelectText.innerText;
                }

                DuoMainService.getInstance().getLoadAllDuoList();
                checkOpenedObj.positionOpen = 0;
            })


        });

        document.addEventListener('click', function (e) {
            if (!positionSelectField.contains(e.target) && checkOpenedObj.positionOpen == 1 && checkOpenedObj.positionDoubleIn == 0) {
                positionList.classList.toggle("position-hide");
                positionArrowIcon.classList.toggle("position-rotate");
                checkOpenedObj.positionOpen = 0;
            }
            checkOpenedObj.positionDoubleIn = 0;
        });
    }

    addClickEventQueButton() {
        
        const queSelectField = document.getElementById("que-selectField");
        const queList = document.getElementById("que-list");
        const queArrowIcon = document.getElementById("que-arrowIcon");
        const queOptions = document.querySelectorAll(".que-options");
        const tierSelectText = document.getElementById("tier-selectText");
        const positionSelectText = document.getElementById("position-selectText");
        const queSelectText = document.getElementById("que-selectText");

        queSelectField.onclick = function () {
            queList.classList.toggle("que-hide");

            queArrowIcon.classList.toggle("que-rotate");
            if (checkOpenedObj.queOpen == 0) {
                checkOpenedObj.queOpen = 1;
            } else if (checkOpenedObj.queOpen == 1) {
                checkOpenedObj.queOpen = 0;
            }

        }

        queOptions.forEach(function (data) {
            data.addEventListener('click', function () {
                queSelectText.innerHTML = this.textContent;
                queList.classList.toggle("que-hide");
                queArrowIcon.classList.toggle("que-rotate");
                checkOpenedObj.queDoubleIn = 1;
                if (tierSelectText.innerText === "티어 전체") {
                    searchObj.searchTierValue = ""
                } else {
                    searchObj.searchTierValue = tierSelectText.innerText;
                }
                if (queSelectText.innerText === "게임타입 전체") {
                    searchObj.searchQueValue = ""
                } else {
                    searchObj.searchQueValue = queSelectText.innerText;
                }
                if (positionSelectText.innerText === "상관 없음") {
                    searchObj.searchPositionValue = ""
                } else {
                    searchObj.searchPositionValue = positionSelectText.innerText;
                }

                DuoMainService.getInstance().getLoadAllDuoList();
                checkOpenedObj.queOpen = 0;
            })


        });

        document.addEventListener('click', function (e) {
            if (!queSelectField.contains(e.target) && checkOpenedObj.queOpen == 1 && checkOpenedObj.queDoubleIn == 0) {

                queList.classList.toggle("que-hide");
                queArrowIcon.classList.toggle("que-rotate");
                checkOpenedObj.queOpen = 0;
            }
            checkOpenedObj.queDoubleIn = 0;
        });

    }

    addClickATag(){
        const aTag = document.querySelectorAll(".nicknameClick");
        const inputValue = document.querySelectorAll(".mini-board-value");
    
        aTag.forEach((tag, index) =>{
            tag.onclick = () =>{
                gameNameAndTagLine = inputValue[index].defaultValue.replaceAll("~", " ");
                let successFlag = DuoMainApi.getInstance().searchSummonerInfoByGameNameAndTagLine();

                if(successFlag){
                    location.href = `/record/${gameNameAndTagLine}`;
                } 
            }
        });
    }
}






