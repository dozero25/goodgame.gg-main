class AugmentInfoApi{
    static #instance = null;

    static getInstance(){
        if(this.#instance == null){
            this.#instance = new AugmentInfoApi();
        }
        return this.#instance;
    }

    async showInfoAugment(id){
        try {
            const response = await fetch(`http://localhost:8000/api/augments/${id}`)
            const result = await response.json();

            return result;
        } catch (error) {
            console.error("augmentError", error);
            return error;
        }
    }

}