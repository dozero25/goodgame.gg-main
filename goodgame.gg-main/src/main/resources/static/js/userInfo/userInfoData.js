class UserInfoDataApi {
    static #instance = null;

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new UserInfoDataApi();
        }
        return this.#instance;
    }
    

    async searchUserByPuuid(puuid, start = 0, size = 10) {
        try {
            const response = await fetch(`http://localhost:8000/api/data/user?start=${start}&size=${size}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puuid }),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("dataError : ", error);
            return null;
        }
    }


}