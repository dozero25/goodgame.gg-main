window.onload = () => {
    HeaderService.getInstance().loadHeader();
    RotationsService.getInstance().loadRotationsChampion();
    MainService.getInstance().addInputAutocomplete();
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

    async inputSummonerInfoForMongoDB(gameName, TagLine){
        
        try {
            const responese = await fetch(`http://localhost:8000/api/record/user/store`, {
                method : "POST",
                headers : {"Content-Type": "application/json"},
                body : JSON.stringify({gameName, TagLine}), 
            });
            const result = await responese.json();
            return result.data;
        } catch (error) {
            console.log("inputSummonerInfoForMongoDB", error);
            return error;
        }
    }

    async getAutoCompleteList(inputValue){
        try {
            const responese = await fetch(`http://localhost:8000/api/record/auto/users?input=${encodeURIComponent(inputValue)}`);
            const result = await responese.json();

            return result.data;
        } catch (error) {
            console.log("getAutoCompleteList", error);
            return [];
        }
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

    addInputAutocomplete() {
        const searchInput = document.querySelector(".search");
        const autocompleteBox = document.getElementById("autocomplete-box");

        searchInput.addEventListener("input", async () => {
            const inputValue = searchInput.value.trim();
            if (inputValue.length === 0) {
                autocompleteBox.innerHTML = "";
                autocompleteBox.style.display = "none";
                return;
            }

            const inputUserList = await MainApi.getInstance().getAutoCompleteList(inputValue);
            autocompleteBox.innerHTML = "";

            if (inputUserList.length === 0) {
                autocompleteBox.style.display = "none";
                return;
            }

            inputUserList.forEach(user => {
                const item = document.createElement("div");
                item.classList.add("autocomplete-item");
                item.textContent = `${user.gameName}#${user.tagLine}`;
                item.onclick = () => {
                    searchInput.value = `${user.gameName}#${user.tagLine}`;
                    autocompleteBox.innerHTML = "";
                    autocompleteBox.style.display = "none";
                };
                autocompleteBox.appendChild(item);
            });

            autocompleteBox.style.display = "block";
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

    addClickSearchButton(){
        const searchInput = document.querySelector(".search");
        const seachButton = document.querySelector(".search-button");

        seachButton.onclick = () => {
            gameNameAndTagLine = searchInput.value;
            // gameNameAndTagLine = "hide on bush#kr1";
            gameNameAndTagLine = gameNameAndTagLine.replace("#", "~");
            const encoded = encodeURIComponent(gameNameAndTagLine);
            
            const [gameName, tagLine] = gameNameAndTagLine.split("~");

            let successFlag = MainApi.getInstance().searchSummonerInfoByGameNameAndTagLine();
            MainApi.getInstance().inputSummonerInfoForMongoDB(gameName, tagLine);
            if(successFlag){
                location.href = `/record/${encoded}`;
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