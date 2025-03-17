window.onload = () => {
    HeaderService.getInstance().loadHeader();

    ComponentEvent.getInstance().ClickEventPopupForCheckUserPw();
    ComponentEvent.getInstance().ClickEventDeleteButton();

}

//1.삭제할 데이터 선택
let DeleteObj = {
  userIndex: "",
  userPw: ""
}

//2. Api
class MyPageApi {
    static #instance = null;

    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new MyPageApi();
        }
        return this.#instance;
    }





    deleteUserData() {
        
        let successFlag = false;


        $.ajax({
            async: false, 

            type: "DELETE", 
            url: `http://localhost:8000/api/mypage/delete/${PrincipalApi.getInstance().getPrincipal().user.userIndex}`, 
            contentType: "application/json",

            dataType: "json", 
            success: response => { 
                successFlag = response.data;

            },
            error: error => { 
                console.log(error); 
            }
        });

        return successFlag; 
    }

        pwCheck(inputPassword) {
            DeleteObj.userIndex = `${PrincipalApi.getInstance().getPrincipal().user.userIndex}`;
            DeleteObj.userPw = `${inputPassword}`;
            
            let returnData = null;
            
            $.ajax({
                async: false, 
                type: "get", 
                url: `http://localhost:8000/api/mypage/delete/pwCheck`, 
               data:DeleteObj,
                contentType: "application/json",
                dataType: "json", 
                success: response => { 
                   returnData=response.data;

                },
                error: error => { 
                    console.log(error); 
                }
            });

            return returnData; 
        }

}

class MyPageService{
    static #instance = null;
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new MyPageService();
        }
        return this.#instance;
    }
        popupForCheckUserPw() {
            const popupWindow = window.open('', '_blank', 'width=600,height=400');

            const popupContent = `
             <h1>비밀번호를 입력해주세요.</h1>
                <input type="password" id="pop-upForDelete">
             <button id="confirmButton">확인</button>

             `
            popupWindow.document.write(popupContent);


            setTimeout(() => {
                const confirmButton = popupWindow.document.getElementById('confirmButton');

                confirmButton.onclick = () => {
                    const inputPassword = popupWindow.document.getElementById('pop-upForDelete').value;
                    const isPasswordMatch = MyPageApi.getInstance().pwCheck(inputPassword);
                    if (isPasswordMatch) {
                        alert("인증이 완료되었습니다.");
                        document.getElementById('check-user-pw-button').disabled = true;
                        document.getElementById('delete-button').disabled = false;
                        popupWindow.close();
                    } else {
                        popupWindow.alert("비밀번호가 일치하지 않습니다.");
                       popupWindow.close();
                    }
                }
            }, 100);

            
        };

        deleteAll() {
            let successFlagB=MyPageApi.getInstance().deleteUserData();
            console.log("sFB="+successFlagB);
            return successFlagB;
        }
}


class ComponentEvent {
    static #instance = null;
    static getInstance() {
        if(this.#instance == null) {
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    ClickEventPopupForCheckUserPw() {
        const confirmButton = MyPageService.getInstance().popupWindow;
        const checkUserPwButton = document.getElementById('check-user-pw-button');
                checkUserPwButton.onclick = () => {
                 MyPageService.getInstance().popupForCheckUserPw();
                };
    };

    ClickEventDeleteButton() {
        const DeleteButton = document.getElementById("delete-button");

        DeleteButton.onclick = () => {

         let successFlagA= MyPageService.getInstance().deleteAll();

           if(successFlagA) {
                document.getElementById('check-user-pw-button').disabled = false;
                document.getElementById('delete-button').disabled = true;
                alert("회원탈퇴 완료되었습니다.");
                window.location.href = "/main";
                window.location.href = "/logout";
           } else {
               alert("회원탈퇴 실패하었습니다aaaaaaaaaa.");
               location.reload();
           }
        };
    }
}




