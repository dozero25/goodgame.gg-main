window.onload = () => {
    HeaderService.getInstance().loadHeader();

    MyPageService.getInstance().printMyPage();
    MyPageService.getInstance().printBoardElement();
    MyPageService.getInstance().printReplyTable();
    
    ComponentEvent.getInstance().deleteClickButtonBoard();
    ComponentEvent.getInstance().deleteClickButtonReplyBoard();
    
    ComponentEvent.getInstance().addClickEventModificationButton();
}
//1.데이터를 저장할 변수 추가하기
const MyPageObj = {
    userIndex: "",
    userId: "",
    userPw: "",
    userNick: "",
    userGender: "",
    userEmail: "",
    roleId: 1
}

let BoardObj = {
    boardIndex: "",
    boardSubject: "",
    userIndex: "",
    boardContent: "",
    boardRegDate: "",
    boardVisit: "",
    boardLike: "",
}

let ReplyObj = {
    replyIndex: "",
    boardIndex: "",
    userIndex: "",
    replyContent: "",
    replyGroup: "",
    replySequence: "",
    replyRegDate: "",
};

let searchObjByBoard = {
    limit: "Y",
    count: 10,
    page: 1,
    userIndex: ""
}

let searchObjByReply = {
    limit: "Y",
    count: 10,
    page: 1,
    userIndex: ""
}

let deletebox = {
    boardIndex : "",
    userIndex : ""
}

let deleteReplyBox = {
    boardIndex : "",
    replyGroup : "",
    replySequence : "",
    userIndex : ""
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

    //정보를 수정.
    modifyUserInfo() {
        let successFlag = false;

        $.ajax({
            async: false,
            type: "patch",
            url: `http://localhost:8000/api/mypage/update/${PrincipalApi.getInstance().getPrincipal().user.userIndex}`,
            contentType: "application/json",
            data: JSON.stringify(MyPageObj),
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

    printMyPageUser() {
        let returnData = null;

        $.ajax({
            async: false,
            type: "GET",
            url: `http://localhost:8000/api/mypage/selectOne/${PrincipalApi.getInstance().getPrincipal().user.userIndex}`,

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

    printBoardList() {
        let returnData = null;

        searchObjByBoard.userIndex = `${PrincipalApi.getInstance().getPrincipal().user.userIndex}`;
        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/mypage/searchList/board`,
            contentType: "application/json",
            data: searchObjByBoard,
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
    getTotalBoardCount() {

        let returnData = null;

        BoardObj.userIndex = `${PrincipalApi.getInstance().getPrincipal().user.userIndex}`;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/mypage/getTotalBoardCount",
            data: { userIndex: BoardObj.userIndex },
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

    printReplyList() {
        let returnData = null;
        searchObjByReply.userIndex = `${PrincipalApi.getInstance().getPrincipal().user.userIndex}`;
        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/mypage/searchList/reply`,
            contentType: "application/json",
            data: searchObjByReply,
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

    getTotalReplyCount() {

        let returnData = null;

        ReplyObj.userIndex = `${PrincipalApi.getInstance().getPrincipal().user.userIndex}`;

        $.ajax({
            async: false,
            type: "get",
            url: "http://localhost:8000/api/mypage/getTotalReplyCount",
            data: { userIndex: ReplyObj.userIndex },
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

    deleteBoardInMypage() {
        let successFlag = false;

        $.ajax({
            async: false,
            type: "delete",
            url: `http://localhost:8000/api/mypage/delete/board/info/${deletebox.boardIndex}`,
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
            }
        });

        return successFlag;
    }

    deleteReplyInMypage() {
        let successFlag = false;

        $.ajax({
            async: false,
            type: "delete",
            url: `http://localhost:8000/api/mypage/delete/board/reply/info/${deleteReplyBox.boardIndex}/${deleteReplyBox.replyGroup}/${deleteReplyBox.replySequence}`,
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
            }
        });

        return successFlag;
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

    setMyPageObjValues() {
        const modificationInputs = document.querySelectorAll(".modification-input");

        MyPageObj.userNick = modificationInputs[0].value;
        MyPageObj.userEmail = modificationInputs[1].value;
        MyPageObj.userGender = modificationInputs[2].checked ? "m" : "w";

    }

    printMyPage() {
        const responseData = MyPageApi.getInstance().printMyPageUser();
        const modificationInputs = document.querySelector(".user-info-box");

        modificationInputs.innerHTML = `
            <div>
            <span class="user-info">기본정보</span>
        </div>
        <div class="getUserInfo">
            <label class="modification-label">IMAGE</label>
            <div>
                <img src="/static/images/MyPage-Profile.png" alt="">
            </div>

        </div>
        <div class="getUserInfo">
            <label class="modification-label">NICK</label>
            <div>
                <input type="text" class="modification-input" style="cursor: default;" value="${responseData?.userNick}" disabled>
            </div>
        </div>
        <div class="getUserInfo">
            <label class="modification-label">PASSWORD</label>
            <div>
                <input type="password" class="modification-input" style="cursor: default;" value="${responseData?.userEmail}" disabled>
            </div>
        </div>
        <div class="getUserInfo">
            <label class="modification-label">EMAIL</label>
            <div>
                <input type="text" class="modification-input" style="cursor: default;" value="${responseData?.userEmail}" disabled>
            </div>
        </div>
        <div class="getUserInfo">
            <label class="modification-label">GENDER</label>
            <div style="display: flex;">
                <input type="radio" class="modification-input" name="gender" style="cursor: default;" value="${responseData?.userGender}" disabled>
                <label for="" style="margin-right: 10px;">M</label>
                <input type="radio" class="modification-input" name="gender" style="cursor: default;" value="${responseData?.userGender}" disabled>
                <label for="">W</label>
            </div>
        </div>
            `;

    }

    printBoardElement() {
        const boardData = MyPageApi.getInstance().printBoardList();
        const boardTable = document.querySelector(".board-table-box table tbody");
        boardTable.innerHTML = "";

        boardData.forEach((data, index) => {
            boardTable.innerHTML += `
                <tr class="board-box-wrap">
                    <td>${data.boardIndex}</td>
                    <td>${data.boardSubject}</td>
                    <td>${data.boardRegDate}</td>
                    <td>${data.boardVisit}</td>
                    <td>${data.boardLike}</td>
                    <td class="delete-board-btn"><button value=${data.boardIndex} class="delete-btn-board">삭제</button></td>
                </tr>
            `
        });
        this.loadBoardPageController();
        ComponentEvent.getInstance().deleteClickButtonReplyBoard();
    }

    loadBoardPageController() {
        //페이징 담당: 페이징에 필요한 것들이 전부 들어있고, 주의 해야할 점은 페이지 값이 바뀌면 getLoadAllDuoList를 통해 리스트를 다시 불러와야한다.

        const pageController = document.querySelector(".page-controller-board");

        const totalcount = MyPageApi.getInstance().getTotalBoardCount();


        const maxPageNumber = totalcount % searchObjByBoard.count == 0
            ? Math.floor(totalcount / searchObjByBoard.count)
            : Math.floor(totalcount / searchObjByBoard.count) + 1;

        pageController.innerHTML = `
        <span class="pre-button-board disabled"><i class="fa-solid fa-play pre-board"></i></span>
        <ul class="page-numbers-board">
        
        </ul>
        <span class="next-button-board disabled"><i class="fa-solid fa-play next"></i></span>
        `;

        if (searchObjByBoard.page != 1) {
            const preButton = pageController.querySelector(".pre-button-board");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchObjByBoard.page--;
                this.printBoardElement();
            }
        }

        if (searchObjByBoard.page != maxPageNumber) {
            const preButton = pageController.querySelector(".next-button-board");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchObjByBoard.page++;
                this.printBoardElement();
            }
        }
        const startIndex = searchObjByBoard.page % 5 == 0
            ? searchObjByBoard.page - 4
            : searchObjByBoard.page - (searchObjByBoard.page % 5) + 1;


        const endIndex = startIndex + 4 <= maxPageNumber ? startIndex + 4 : maxPageNumber;

        const pageNumbers = document.querySelector(".page-numbers-board");

        for (let i = startIndex; i <= endIndex; i++) {
            pageNumbers.innerHTML += `
            <li><span class ="page-button-board ${i == searchObjByBoard.page ? "disabled" : ""}">${i}</span></li>
            `;
        }

        const pageButtons = document.querySelectorAll(".page-button-board");
        pageButtons.forEach(button => {
            const pageNumber = button.textContent;
            if (pageNumber != searchObjByBoard.page) {
                button.onclick = () => {
                    searchObjByBoard.page = pageNumber;
                    this.printBoardElement();
                }
            }
        });
    }

    printReplyTable() {
        const replyData = MyPageApi.getInstance().printReplyList();
        const replyTable = document.querySelector(".reply-table-box table tbody");
        replyTable.innerHTML = "";

        replyData.forEach((data, index) => {
            replyTable.innerHTML += `
            <tr class="reply-box-wrap">
                <td>${data.boardIndex}</td>
                <td>${data.replyContent}</td>
                <td>${data.replyRegDate}</td>
                <td class="delete-reply-btn"><button class="reply-delete-btn" value="${data.boardIndex}">삭제</button></td>
                <input type="hidden" value="${data.replyGroup}" class="reply-gorup-delete">
                <input type="hidden" value="${data.replySequence}" class="reply-seq-delete">
            </tr>
            `
        });
        this.loadReplyPageController();
        ComponentEvent.getInstance().deleteClickButtonReplyBoard();
    }

    loadReplyPageController() {
        //페이징 담당: 페이징에 필요한 것들이 전부 들어있고, 주의 해야할 점은 페이지 값이 바뀌면 getLoadAllDuoList를 통해 리스트를 다시 불러와야한다.

        const pageController = document.querySelector(".page-controller-reply");

        const totalcount = MyPageApi.getInstance().getTotalReplyCount();


        const maxPageNumber = totalcount % searchObjByReply.count == 0
            ? Math.floor(totalcount / searchObjByReply.count)
            : Math.floor(totalcount / searchObjByReply.count) + 1;

        pageController.innerHTML = `
        <span class="pre-button-reply disabled"><i class="fa-solid fa-play pre-reply"></i></span>
        <ul class="page-numbers-reply">
        
        </ul>
        <span class="next-button-reply disabled"><i class="fa-solid fa-play next"></i></span>
        `;

        if (searchObjByReply.page != 1) {
            const preButton = pageController.querySelector(".pre-button-reply");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchObjByReply.page--;
                this.printReplyTable();
            }
        }

        if (searchObjByReply.page != maxPageNumber) {
            const preButton = pageController.querySelector(".next-button-reply");
            preButton.classList.remove("disabled");

            preButton.onclick = () => {
                searchObjByReply.page++;
                this.printReplyTable();
            }
        }
        const startIndex = searchObjByReply.page % 5 == 0
            ? searchObjByReply.page - 4
            : searchObjByReply.page - (searchObjByReply.page % 5) + 1;


        const endIndex = startIndex + 4 <= maxPageNumber ? startIndex + 4 : maxPageNumber;

        const pageNumbers = document.querySelector(".page-numbers-reply");

        for (let i = startIndex; i <= endIndex; i++) {
            pageNumbers.innerHTML += `
            <li><span class ="page-button-reply ${i == searchObjByReply.page ? "disabled" : ""}">${i}</span></li>
            `;
        }

        const pageButtons = document.querySelectorAll(".page-button-reply");
        pageButtons.forEach(button => {
            const pageNumber = button.textContent;
            if (pageNumber != searchObjByReply.page) {
                button.onclick = () => {
                    searchObjByReply.page = pageNumber;
                    this.printReplyTable();
                }
            }
        });
    }

}
//이벤트나 동작을 담당
//4. ComponentEvent
class ComponentEvent {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    //
    addClickEventModificationButton() {
        const modificationButton = document.querySelector(".modification-button");

        /*modificationButton.addEventListener("click", function() {*/
        modificationButton.onclick = () => {
            const modificationInputs = document.querySelectorAll('.modification-input');
            const modificationOKButton = document.querySelector('.modificationOK-button');

            modificationInputs.forEach(input => {
                input.disabled = false;
                input.style.backgroundColor = "#515151";
            });


            modificationButton.disabled = true;
            modificationOKButton.disabled = false;

            modificationOKButton.onclick = () => {
                MyPageService.getInstance().setMyPageObjValues();

                let successFlag = MyPageApi.getInstance().modifyUserInfo();

                if (successFlag) {
                    alert("수정 완료되었습니다.");

                    modificationInputs.forEach(input => {
                        input.disabled = true;
                    });
                    modificationButton.disabled = false;
                    modificationOKButton.disabled = true;
                    MyPageService.getInstance().printMyPage();
                } else {
                    alert("수정에 실패했습니다. 다시 시도해주세요.");
                    location.reload();
                }
            };
        }
    }

    deleteClickButtonBoard(){
        const deleteBtn = document.querySelectorAll(".delete-btn-board");

        deleteBtn.forEach((btn, index) => {
            btn.onclick = () => {
                deletebox.boardIndex = btn.value;
                deletebox.userIndex = PrincipalApi.getInstance().getPrincipal().user.userIndex;

                const successFlag = new MyPageApi().deleteBoardInMypage(deletebox);
                
                if(successFlag){
                    const row = btn.closest('.board-box-wrap');
                    row.style.display = 'none';
                }
            }
        });
        
    }

    deleteClickButtonReplyBoard(){
        const deleteBtn = document.querySelectorAll(".reply-delete-btn");

        const groupVal = document.querySelectorAll(".reply-gorup-delete");
        const seqVal = document.querySelectorAll(".reply-seq-delete");

        deleteBtn.forEach((btn, index) => {
            btn.onclick = () => {
                deleteReplyBox.boardIndex = btn.value;
                deleteReplyBox.replyGroup = groupVal[index].value;
                deleteReplyBox.replySequence = seqVal[index].value;
                deleteReplyBox.userIndex = PrincipalApi.getInstance().getPrincipal().user.userIndex;

                const successFlag = new MyPageApi().deleteReplyInMypage(deleteReplyBox);
                
                if(successFlag){
                    const row = btn.closest('.reply-box-wrap');
                    row.style.display = 'none';
                }
            }
        });
        
    }


    changeProfileImage() {
        const profileImage = document.querySelector('.Profile-img');
        const imgFile = document.querySelector('.img-file');

        imgFile.onchange = () => {
            const file = imgFile.files;

            if (file) {
                const reader = new FileReader();

                reader.onload = () => {
                    profileImage.src = reader.result;
                };

                reader.readAsDataURL(file);
            }
        };
    }
}

