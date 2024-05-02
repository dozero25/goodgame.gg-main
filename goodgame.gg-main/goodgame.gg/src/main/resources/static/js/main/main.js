window.onload = () => {
    HeaderService.getInstance().loadHeader();
    RotationsService.getInstance().loadRotationsChampion();
    ComponentEvent.getInstance().addClickSearchButton();
}

let gameNameAndTagLine ="";

class MainApi{
    static #instance = null;
    static getInstance(){
        if(this.#instance == null){
            this.#instance = new MainApi();
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
                alert("입력데이터를 다시 확인해주세요.");
            }
        });

        return returnData;
    }
}

class MainService{
    static #instance = null;
    static getInstance(){
        if(this.#instance == null){
            this.#instance = new MainService();
        }
        return this.#instance;
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

    addClickSearchButton(){
        const searchInput = document.querySelector(".search");
        const seachButton = document.querySelector(".search-button");

        seachButton.onclick = () => {
            gameNameAndTagLine = searchInput.value;
            gameNameAndTagLine = gameNameAndTagLine.replace("#", "-");
            let successFlag = MainApi.getInstance().searchSummonerInfoByGameNameAndTagLine();
            
            if(successFlag){
                location.href = `/record/${gameNameAndTagLine}`;
            } else {
                searchInput.focus();
            }
        }

        searchInput.onkeyup = () => {
            if(window.event.keyCode === 13) {
                seachButton.onclick();
    
            }
        }
    }
}