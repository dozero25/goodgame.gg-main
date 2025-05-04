window.onload = () => {
    HeaderService.getInstance().loadHeader();

    MyPageService.getInstance().oauth2DeleteSection();
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
        if (this.#instance == null) {
            this.#instance = new MyPageApi();
        }
        return this.#instance;
    }

    deleteUserData() {
        let successFlag = false;

        $.ajax({
            async: false,

            type: "DELETE",
            url: `http://localhost:8000/api/mypage/delete/${PrincipalApi.getInstance().getPrincipal().userIndex}`,
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
        DeleteObj.userIndex = `${PrincipalApi.getInstance().getPrincipal().userIndex}`;
        DeleteObj.userPw = `${inputPassword}`;

        let returnData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/mypage/delete/pwCheck`,
            data: DeleteObj,
            contentType: "application/json",
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

}

class MyPageService {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new MyPageService();
        }
        return this.#instance;
    }
    popupForCheckUserPw() {
        const width = 600;
        const height = 400;

        const screenX = window.screen.availWidth;
        const screenY = window.screen.availHeight;

        const left = (screenX - width) / 2;
        const top = (screenY - height) / 2;
        
        const popupWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);

        const popupContent = `
             <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100%;
                            margin: 0;
                        }
                        .container {
                            background-color: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            width: 100%;
                            max-width: 400px;
                            text-align: center;
                        }
                        h1 {
                            font-size: 22px;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        input[type="password"] {
                            width: 100%;
                            padding: 10px;
                            margin: 10px 0;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            font-size: 16px;
                        }
                        button {
                            width: 100%;
                            padding: 10px;
                            background-color: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-size: 16px;
                            cursor: pointer;
                            transition: background-color 0.3s;
                        }
                        button:hover {
                            background-color: #0056b3;
                        }
                    </style>
                    <title>회원 탈퇴</title>
                </head>
                <body>
                    <div class="container">
                        <h1>비밀번호를 입력해주세요.</h1>
                        <input type="password" id="pop-upForDelete" placeholder="비밀번호">
                        <button id="confirmButton">확인</button>
                    </div>
                </body>
            </html>
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
        let successFlagB = MyPageApi.getInstance().deleteUserData();
        return successFlagB;
    }

    oauth2DeleteSection() {
        const userType = PrincipalApi.getInstance().getPrincipal().type;

        if (userType === "oauth2") {
            document.getElementById('check-user-pw-button').style.display = "none";
            document.getElementById('delete-button').disabled = false;

            document.getElementById('delete-button').onclick = () => {
                const width = 400;
                const height = 250;
        
                const screenX = window.screen.availWidth;
                const screenY = window.screen.availHeight;
        
                const left = (screenX - width) / 2;
                const top = (screenY - height) / 2;

                const confirmWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);

                const confirmContent = `
                        <html>
                            <head>
                                <style>
                                    body {
                                        font-family: 'Arial', sans-serif;
                                        text-align: center;
                                        background-color: #f8f9fa;
                                        padding: 30px;
                                    }

                                    h2 {
                                        color: #dc3545;
                                    }

                                    p {
                                        margin-top: 10px;
                                        color: #333;
                                    }

                                    #confirm-delete-btn {
                                        margin-top: 20px;
                                        padding: 10px 20px;
                                        background-color: #dc3545;
                                        color: white;
                                        border: none;
                                        border-radius: 5px;
                                        cursor: pointer;
                                    }

                                    #confirm-delete-btn:hover {
                                        background-color: #c82333;
                                    }
                                </style>
                                <title>회원 탈퇴 확인</title>
                            </head>
                            <body>
                                <h2>정말로 회원 탈퇴하시겠습니까?</h2>
                                <p>탈퇴를 원하지 않으면 이 창을 닫아주세요.</p>
                                <button id="confirm-delete-btn">탈퇴하기</button>

                                <script>
                                    window.onload = function() {
                                        document.getElementById('confirm-delete-btn').onclick = function() {
                                            window.opener.postMessage({ action: "confirmDelete" }, "*");
                                            window.close();
                                        };
                                    };
                                </script>
                            </body>
                        </html>
                `;

                confirmWindow.document.open();
                confirmWindow.document.write(confirmContent);
                confirmWindow.document.close();
            };

            window.addEventListener("message", (event) => {
                if (event.data.action === "confirmDelete") {
                    const successFlag = MyPageService.getInstance().deleteAll();
                    if (successFlag) {
                        alert("회원탈퇴 완료되었습니다.");
                        window.location.href = "/logout";
                    } else {
                        alert("회원탈퇴 실패하였습니다.");
                        location.reload();
                    }
                }
            });
        } else {
            ComponentEvent.getInstance().ClickEventPopupForCheckUserPw();
            ComponentEvent.getInstance().ClickEventDeleteButton();
        }
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

            let successFlagA = MyPageService.getInstance().deleteAll();

            if (successFlagA) {
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




