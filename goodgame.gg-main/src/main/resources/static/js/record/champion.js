window.onload = () => {
    HeaderService.getInstance().loadHeader();
    SummonerService.getInstance().summonerShowInfo();
    CheckboxService.getInstance().ShowCheckbox();
}

class ChampionApi{
    static #instance = null;

    static getInstance(){
        if(this.#instance == null){
            this.#instance = new ChampionApi();
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
}