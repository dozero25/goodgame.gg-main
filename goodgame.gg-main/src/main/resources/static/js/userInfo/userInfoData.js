class UserInfoDataApi{
    static #instance = null;

    static getInstance(){
        if(this.#instance == null){
            this.#instance = new UserInfoDataApi();
        }
        return this.#instance;
    }

    async searchUserByPuuid(puuid){
        try {
            const response = await fetch(`http://localhost:8000/api/data/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puuid }),
            })
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("dataError : ", error);
            return error;
        }
    }


}