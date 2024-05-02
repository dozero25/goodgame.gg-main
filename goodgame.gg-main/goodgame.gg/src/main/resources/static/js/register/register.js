window.onload = () => {
    ComponentEvent.getInstance().addClickEventRegisterButton();
}

const userObj= {
    userId : "",
    userPw : "",
    userNick : "",
    userGender : "",
    userEmail : "",
}

class UserRegisterApi{
    static #instance = null;
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new UserRegisterApi();
        }
        return this.#instance;
    }

    registerUser(){
        let successFlag = null;

        $.ajax({
            async: false,
            type: "post",
            url: "http://localhost:8000/api/account/register/user",
            contentType: "application/json",
            data: JSON.stringify(userObj),
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
                alert(error.responseJSON.data.registerError);
            }

        });

        return successFlag;
    }
}

class UserRegisterService{
    static #instance = null;
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new UserRegisterService();
        }
        return this.#instance;
    }

    setErrors(errors){

    }

    setUserObjectValues(){
        const id = document.querySelector(".id");
        const pw = document.querySelector(".pw");
        const nickName = document.querySelector(".nickName");
        const gender = $('[name="gender"]:checked').val();
        const email = document.querySelector(".email");

        userObj.userId = id.value;
        userObj.userPw = pw.value;
        userObj.userNick = nickName.value;
        userObj.userGender = gender;
        userObj.userEmail = email.value;
    }

}

class ComponentEvent{
    static #instance = null;
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    addClickEventRegisterButton(){
        const regButton = document.querySelector(".register-button");

        regButton.onclick = () => {
            UserRegisterService.getInstance().setUserObjectValues();

            let successFlag = new UserRegisterApi().registerUser();
        
            if(successFlag) {
                alert("회원가입 되셨습니다.");
                location.href="/login";
            }
        }
    }
}