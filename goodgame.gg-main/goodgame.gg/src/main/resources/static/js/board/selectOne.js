window.onload = () => {
    HeaderService.getInstance().loadHeader();

    BoardSelectOneService.getInstance().setBoardSelectOneBoardIndex();
    BoardSelectOneService.getInstance().loadselectOneBoard();
    BoardSelectOneService.getInstance().getLoadBoardReply();

    ComponentEvent.getInstance().addClickEventDeleteBoardButton();
    ComponentEvent.getInstance().addClickEventUpdateBoardButton();
    ComponentEvent.getInstance().addClickEventLikeButton();
    ComponentEvent.getInstance().addClickEventReplyInsertButton();
    ComponentEvent.getInstance().addClickShowReplyInsertText();
    ComponentEvent.getInstance().addClickEventReplyInputBtn();
    ComponentEvent.getInstance().addClickEventReplyGroupDeleteBtn();
    ComponentEvent.getInstance().addClickEventReplySequenceDeleteBtn();
    ComponentEvent.getInstance().addClickEventOpenLoadBoardReplyUpdate();
    ComponentEvent.getInstance().addClickEventReplyGroupUpdateBtn();
}

const boardObj = {
    boardIndex: "",
    boardSubject: "",
    userIndex: "",
    userId: "",
    userNick: "",
    replyCount: "",
    boardContent: "",
    boardVisit: "",
    boardRegDate: "",
    boardUploadName: "",
    boardUploadSize: "",
    boardUploadLocation: "",
    boardLikeCount: 0
}

const boardLikeObj = {
    boardLikeId: 0,
    boardIndex: 0,
    userIndex: 0,
    boardLike: 0,
    boardBad: 0
}

const replyObj = {
    replyIndex: 0,
    boardIndex: 0,
    userIndex: 0,
    userId: "",
    userNick: "",
    replyContent: "",
    replyGroup: 0,
    replySequence: 0,
    replyRegDate: ""
}

class BoardSelectOneApi {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new BoardSelectOneApi();
        }
        return this.#instance;
    }

    selectOneBoard() {
        let responseData = null;
        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/board/selectOne/${boardObj.boardIndex}`,
            data: boardObj,
            dataType: "json",
            success: response => {
                this.visitBoard();
                this.findlikeBoard();
                responseData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });
        return responseData;
    }



    deleteBoard(boardIndex) {
        let returnFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/delete?boardIndex=${boardObj.boardIndex}`,
            dataType: "json",
            success: response => {
                returnFlag = true;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnFlag;
    }



    visitBoard() {

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/board/visit?boardIndex=${boardObj.boardIndex}`,
            dataType: "json",
            success: response => {
            },
            error: error => {
                console.log(error);
            }
        });

    }


    findlikeBoard() {
        let responseData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/board/find/like`,
            data: boardLikeObj,
            dataType: "json",
            success: response => {
                responseData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });
        return responseData;
    }

    likeCountBoard(boardLikeObj) {
        let responseData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/board/like/count`,
            data: boardLikeObj,
            dataType: "json",
            success: response => {
                responseData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });
        return responseData;
    }



    likeBoard(boardLikeObj) {
        let returnFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/like`,
            data: boardLikeObj,
            dataType: "json",
            success: response => {
                returnFlag = true;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnFlag;

    }


    likeBadCancel(boardLikeObj) {
        let returnFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/cancel`,
            data: boardLikeObj,
            dataType: "json",
            success: response => {
                returnFlag = true;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnFlag;
    }
    
    insertBoardReplyGroup() {
        let successFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: "http://localhost:8000/api/board/selectOne/reply/insert",
            contentType: "application/json",
            data: JSON.stringify(replyObj),
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
                console.log(error);
                alert(error.responseJSON.data.nullReplyError);
            }
        });
        return successFlag;

    }

    insertBoardReplySequ() {
        let successFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/selectOne/reply/insert/${replyObj.replyGroup}`,
            contentType: "application/json",
            data: JSON.stringify(replyObj),
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
                alert(error.responseJSON.data.nullReplyError);
            }
        });
        return successFlag;


    }



    getBoardReply() {
        let responseData = null;

        $.ajax({
            async: false,
            tyep: "get",
            url: `http://localhost:8000/api/board/selectOne/reply/${replyObj.boardIndex}`,
            dataType: "json",
            data: replyObj,
            success: response => {
                responseData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });
        return responseData;


    }


    updateBoardReply() {
        let successFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/selectOne/reply/update`,
            contentType: "application/json",
            data: JSON.stringify(replyObj),
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


    loadUpdateBoardReply() {
        let responseData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/board/selectOne/reply/update/${replyObj.replyIndex}`,
            dataType: "json",
            success: response => {
                responseData = response;
            },
            error: error => {
                console.log(error);

            }
        });
        return responseData;

    }


    deleteBoardReply() {
        let returnFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/selectOne/replyGroup/delete?replyIndex=${replyObj.replyIndex}&boardIndex=${replyObj.boardIndex}`,
            dataType: "json",
            success: response => {
                returnFlag = true;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnFlag;

    }


    deleteBoardReplySqu() {
        let returnFlag = false;

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/selectOne/replySequence/delete?replyIndex=${replyObj.replyIndex}`,
            dataType: "json",
            success: response => {
                returnFlag = true;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnFlag;

    }

}


class BoardSelectOneService {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new BoardSelectOneService();
        }
        return this.#instance;
    }

    setBoardSelectOneBoardIndex() {
        const URLSearch = new URLSearchParams(location.search);
        const principal = PrincipalApi.getInstance().getPrincipal();

        boardObj.boardIndex = URLSearch.get("boardIndex");
        boardLikeObj.boardIndex = URLSearch.get("boardIndex");

        boardLikeObj.userIndex = principal == null ? null : principal.user.userIndex;

        replyObj.boardIndex = URLSearch.get("boardIndex");
    }


    loadselectOneBoard() {
        const responseData = BoardSelectOneApi.getInstance().selectOneBoard();
        const principal = PrincipalApi.getInstance().getPrincipal();
        const boardTitle = document.querySelector(".board-title");
        
        let likeValue = BoardSelectOneApi.getInstance().findlikeBoard();
        boardLikeObj.boardLike = likeValue;

        const regDate = new Date(responseData.boardRegDate);
        const formattedRegDate = `${regDate.getFullYear()}년 ${regDate.getMonth() + 1}월 ${regDate.getDate()}일 
                                    ${regDate.getHours() < 12 ? '오전' : '오후'} ${regDate.getHours() % 12 || 12}시 ${regDate.getMinutes()}분 `;

        boardTitle.innerHTML += `
            <div>
            <a href="/board">
                 <button type="button" class="returnBoard">목록으로</button>
            </a>
             ${boardLikeObj.userIndex != null && principal.user.userIndex == responseData.userIndex ?
                `
                <button type="button" class="update-btn" value="${responseData.boardIndex}">글수정</button>
                <button type="button" class="delete-btn" value="${responseData.boardIndex}">글삭제</button>
            </div>
            `: `
            <div>
                <button type="button" class="update-btn" value="${responseData.boardIndex}"  style="display:none;">글수정</button>
                <button type="button" class="delete-btn" value="${responseData.boardIndex}"  style="display:none;">글삭제</button>
            </div>`
            }

            <div class = "sub">
                <span class="boardSubject">${responseData.boardSubject}</span>
            </div>
        `;

        const boardMeta = document.querySelector(".board-meta");

        boardMeta.innerHTML = `
                <div class="board-info-bar">
                    <div>게시글 번호 : <span class="info-bar-text">${responseData.boardIndex}</span></div>
                    <div class="info-bar-mar">|</div>
                    <div>작성자 : <span class="info-bar-text">${responseData.userNick}</span></div>
                    <div class="info-bar-mar">|</div>
                    <div>작성날짜 : <span class="info-bar-text">${formattedRegDate}</span></div>
                    <div class="info-bar-mar">|</div>
                    <div>조회수 : <span class="info-bar-text">${responseData.boardVisit + 1}</span></div>
                    <div class="info-bar-mar">|</div>
                    <div>추천수 : <span class="info-bar-text">${responseData.boardLikeCount}</span></div>
                </div>
        `;

        const boardTable = document.querySelector(".board-content");
        const boardImgBox = document.querySelector(".board-img-box");

        boardTable.innerHTML = `  
            <div class = "boardContent-box">
                <textarea class="boardContent" id="boardContent" cols="80" rows="30" readonly>${responseData.boardContent}</textarea>
            </div>
        `
        boardImgBox.innerHTML = `
        ${!responseData.boardUploadLocation ? '' : `<img src="/images/${responseData.boardUploadLocation}" class="boardFile" alt="boardfile">`}
        `;

        const buttonContainer = document.querySelector(".button-container");
        buttonContainer.innerHTML = `

              <button id="like-btn" class="like-btn">
                     ${boardLikeObj.boardLike == 1 ? '<span class="emoji">👍 Like!</span>' : '<span class="emoji">👍 Like!</span>'}
              </button> 
        `;
    }

    getLoadBoardReply() {
        const principal = PrincipalApi.getInstance().getPrincipal();
        const responseData = BoardSelectOneApi.getInstance().getBoardReply();
        const replyTable = document.querySelector(".reply-table");

        let num1 = 0;
        let num2 = 0;

        responseData.forEach((data, index) => {

            const repRegDate = new Date(data.replyRegDate);

            const formattedRegDate = `${repRegDate.getFullYear()}-${("0" + (repRegDate.getMonth() + 1)).slice(-2)}-${("0" + repRegDate.getDate()).slice(-2)} 
                                    ${("0" + repRegDate.getHours()).slice(-2)}:${("0" + repRegDate.getMinutes()).slice(-2)}:${("0" + repRegDate.getSeconds()).slice(-2)}`;

            replyTable.innerHTML += `
            ${data.replySequence == 1 ?
                    `
                <br>

                <table class = "reply-table-info">
                    <thead>
                        <tr>
                            <th class="table-info-th">${data.userNick}</th>
                            <th class="GroupRegDate" font-size: 0.8em;>${formattedRegDate}</th>
                        <tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="GroupContent">${data.replyContent}</td>
                        </tr>
                        <tr>
                            <td>
                                <div class="reply-update-box" style="display:none">
                                    <div style="display:flex">
                                        <input type="text" class="rply-update-input" maxlength="300" value="${data.replyContent}">
                                        <button type="button" class="rply-update-btn" value="${data.replyIndex}">수정완료✔</button>
                                    </div>
                                </div>
                            </td>
                            
                        </tr>
                    </tbody>
                    <tfoot class ="updateGroup-tfoot">
                        <tr>
                        
                            <td>
                                <button type="button" id="reply-group-insert" class="reply-group-insert"  data-value1="${data.replyIndex}"  data-value2="${data.boardIndex}" class="replyGroupUpdateBtn">답글</button>                           
                            ${boardLikeObj.userIndex != null && principal.user.userIndex == data.userIndex ? `  
                                <button type="button" id="reply-group-update"  data-value1="${data.replyIndex}"  data-value2="${data.boardIndex}" class="replyGroupUpdateBtn">수정</button>                           
                                <button type="button" id="reply-group-delete" class="replyGroupDeleteBtn" data-value1="${data.replyIndex}"  data-value2="${data.boardIndex}" >삭제</button>
                            </td>
                            `: `
                            <td style="display:none;">
                                <button type="button" id="reply-group-update"  value="${data.replyIndex}" class="replyGroupUpdateBtn">수정</button>                                                     
                                <button type="button" id="reply-group-delete" class="replyGroupDeleteBtn" value="${data.replyIndex}" style="display:none;">삭제</button>
                            </td>
                        `}
                        </tr>
                    </tfoot>
                </table>
                <div class="replyGroupBtn-box" style="display:none">
                    <input class="replyGroup-input" value = "" maxlength="300" placeholder = "댓글을 입력하세요">
                    <button id= "rply" class="reg-gro-btn" onclick="reply_insert(${data.replyGroup})" value="${data.replyGroup}">답글쓰기✔</button>
                </div>`
                    : ``
                }

            ${data.replySequence != 1 && (data.replySequence == num2 || data.replyGroup == num1) ?
                    `<br>
                 <table class="reply-squTable">
                    <thead>
                        <th class="table-info-th"> ⤷ ${data.userNick} </th>
                        <th  style= “font-size: 0.8em;”>${formattedRegDate}</th>
                    </thead>
                        <tbody>
                            <td class = "SquenceContent">${data.replyContent}</td>
                        </tbody>
                    <tfoot>      
                        ${boardLikeObj.userIndex != null && principal.user.userIndex == data.userIndex ?
                        `
                            <tr>
                                <td>
                                    <button type="button" id="reply-sequence-update" data-value1="${data.replyIndex}"  data-value2="${data.boardIndex}" class="replySequenceUpdateBtn"  style="display:none;">수정</button>
                                    <button type="button" id="reply-sequence-delete" class="replySequenceDeleteBtn"  value="${data.replyIndex}">삭제</button>
                                </td>
                                `: `
                                <td style="display:none;">
                                     <button type="button" id="reply-sequence-update" value="${data.replyIndex}" class="replySequenceUpdateBtn">수정</button>
                                      <button type="button" id="reply-sequence-delete" class="replySequenceDeleteBtn" value="${data.replyIndex}" style="display:none;">삭제</button>
                                </td>
                            </tr>
                        `
                    }

                    </tfoot>
                </table>
                `
                    : ``
                }    
            `;

            if (data.replyGroup != num1) {
                num1 += 1;
                return num2 = 1;
            }

            if (data.replySequence != num2) {
                num2 += 1;
            }
        });

    }

    setBoardReplyGroupContent() {
        const replyInsert = document.querySelector(".reply-content");
        const principal = PrincipalApi.getInstance().getPrincipal();

        replyObj.boardIndex = boardObj.boardIndex;
        replyObj.userIndex = principal.user.userIndex;
        replyObj.replyContent = replyInsert.value;
    }

    setBoardReplySquenceContent() {
        const responseData = BoardSelectOneApi.getInstance().loadUpdateBoardReply();
        const replyUpdateBtns = document.querySelectorAll(".rely-update-btn");

        document.querySelectorAll(".rply-update-input").forEach(replyInput => {
            const replyContent = replyInput.value;

            replyObj.replyIndex = responseData.data.replyIndex;
            replyObj.replyContent = replyContent;


        });

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

    addClickEventDeleteBoardButton() {
        const deleteBtn = document.querySelector(".delete-btn");

        deleteBtn.onclick = () => {
            if (confirm("정말 삭제하시겠습니까?")) {

                const boardIndex = deleteBtn.value;
                const deleteSuccess = BoardSelectOneApi.getInstance().deleteBoard(boardIndex);

                if (deleteSuccess) {
                    location.href = "/board";
                }
            }
        }
    }


    addClickEventUpdateBoardButton() {
        const updateBtn = document.querySelector(".update-btn");

        updateBtn.addEventListener("click", function () {
            window.location.href = `http://localhost:8000/board/update?boardIndex=${boardObj.boardIndex}`;
        })

    }

    addClickEventLikeButton() {
        const likeBtn = document.getElementById('like-btn');
        const emoji = document.querySelector(".emoji");
        const principal = PrincipalApi.getInstance().getPrincipal();

        if (boardLikeObj.boardLike == 1) {

            likeBtn.style.color = '#ffffff';
            likeBtn.style.fontStyle = '16px';
            likeBtn.style.fontWeight = '600';
            likeBtn.style.filter = "grayscale(0%)";
            emoji.style.display = "block";

        } else {
            likeBtn.style.color = '#ffffff';
            likeBtn.style.fontStyle = '16px';
            likeBtn.style.fontWeight = '600';
            likeBtn.style.filter = "grayscale(100%)";
            emoji.style.display = "none";
        }

        likeBtn.addEventListener("click", function () {
            if (principal == null) {
                location.href = "/login";
            }
            if (boardLikeObj.boardLike == 1) {

                BoardSelectOneApi.getInstance().likeBadCancel(boardLikeObj);

                likeBtn.style.color = '#ffffff';
                likeBtn.style.fontStyle = '16px';
                likeBtn.style.fontWeight = '600';
                emoji.style.display = "none";
                likeBtn.style.filter = "grayscale(100%)";
                boardLikeObj.boardLike = 0;

            } else {
                BoardSelectOneApi.getInstance().likeBoard(boardLikeObj);

                likeBtn.style.color = '#ffffff';
                likeBtn.style.fontStyle = '16px';
                likeBtn.style.fontWeight = '600';
                likeBtn.style.filter = "grayscale(0%)";
                emoji.style.display = "block";

                boardLikeObj.boardLike++;
            }

        })
    }

    addClickEventReplyInsertButton() {
        const repInsertBtn = document.querySelector(".repInsert-btn");
        const repContent = document.querySelector(".reply-content");
        const principal = PrincipalApi.getInstance().getPrincipal();

        repInsertBtn.addEventListener("click", function () {
            if (principal == null) {
                location.href = "/login";
            } else {
                repContent.focus();
                BoardSelectOneService.getInstance().setBoardReplyGroupContent();
                const successFlag = BoardSelectOneApi.getInstance().insertBoardReplyGroup();

                if (successFlag) {
                    location.reload();
                }
            }
        })
    }

    addClickShowReplyInsertText() {
        const rgiBtn = document.querySelectorAll(".reply-group-insert");
        const rgbBox = document.querySelectorAll(".replyGroupBtn-box");

        rgiBtn.forEach((btn, index) => {
            btn.onclick = () => {
                if (rgbBox[index].style.display != "none") {
                    rgbBox[index].style.display = "none";
                } else {
                    rgbBox[index].style.display = "block";
                }
            }
        });
    }

    addClickEventReplyInputBtn() {
        const replyGroupBtns = document.querySelectorAll(".reg-gro-btn");
        const replyGroupInputs = document.querySelectorAll(".replyGroup-input");
        const principal = PrincipalApi.getInstance().getPrincipal();

        replyGroupBtns.forEach((btn, index) => {
            btn.addEventListener("click", function () {
                if (principal == null) {
                    location.href = "/login";
                } else {
                    replyObj.userIndex = principal.user.userIndex;
                    const replyGroup = btn.value;
                    const replyGroupInput = replyGroupInputs[index];

                    replyGroupInput.focus();

                    replyObj.boardIndex = boardObj.boardIndex;
                    replyObj.replyGroup = replyGroup;
                    replyObj.replyContent = replyGroupInput.value;

                    const successFlag = BoardSelectOneApi.getInstance().insertBoardReplySequ();

                    if (successFlag) {
                        location.reload();
                    }
                }
            });
        });
    }


    addClickEventReplyGroupDeleteBtn() {
        const deleteGroupBtns = document.querySelectorAll(".replyGroupDeleteBtn");

        deleteGroupBtns.forEach((deleteBtn) => {
            deleteBtn.addEventListener("click", function () {

                if (confirm("정말 삭제하시겠습니까?")) {

                    const replyIndex = deleteBtn.getAttribute('data-value1'); //deleteBtn.value;
                    const boardIndex = deleteBtn.getAttribute('data-value2');

                    replyObj.replyIndex = replyIndex;
                    replyObj.boardIndex = boardIndex;
                    const deleteSuccess = BoardSelectOneApi.getInstance().deleteBoardReply();
                    if (deleteSuccess) {
                        alert("삭제를 완료했습니다.");
                        location.reload();
                    }
                }
            });
        });


    }

    addClickEventReplySequenceDeleteBtn() {
        const deleteSequenceBtns = document.querySelectorAll(".replySequenceDeleteBtn");

        deleteSequenceBtns.forEach(deleteBtn => {
            deleteBtn.onclick = () => {


                if (confirm("정말 삭제하시겠습니까?")) {

                    replyObj.replyIndex = deleteBtn.value;
                    const deleteSuccess = BoardSelectOneApi.getInstance().deleteBoardReplySqu();
                    if (deleteSuccess) {
                        alert("삭제를 완료했습니다.");
                        location.reload();
                    } 
                }
            };
        });

    }

    addClickEventOpenLoadBoardReplyUpdate() {
        const openReplyUpdateBtns = document.querySelectorAll(".replyGroupUpdateBtn");
        const replyUpdateBoxes = document.querySelectorAll(".reply-update-box");

        openReplyUpdateBtns.forEach((openBtn, index) => {
            openBtn.addEventListener("click", function () {
                const replyUpdateBox = replyUpdateBoxes[index];


                if (replyUpdateBox.style.display !== "none") {
                    replyUpdateBox.style.display = "none";
                }
                else {
                    replyUpdateBox.style.display = "block";
                }

            })

        })

    }

    addClickEventReplyGroupUpdateBtn() {
        const replyUpdateBtns = document.querySelectorAll(".rply-update-btn");
        const replyUpdateInputs = document.querySelectorAll(".rply-update-input");

        replyUpdateBtns.forEach((btn, index) => {
            btn.addEventListener("click", function () {

                BoardSelectOneApi.getInstance().loadUpdateBoardReply();
                const replyIndex = btn.value; 

                const replyContent = replyUpdateInputs[index].parentElement.querySelector(".rply-update-input");


                replyObj.replyIndex = replyIndex;
                replyObj.replyContent = replyContent.value;


                const successFlag = BoardSelectOneApi.getInstance().updateBoardReply();

                if (successFlag) {
                    alert("수정이 완료되었습니다.");
                    location.reload();

                } else {
                    alert("수정이 실패되었습니다.");
                    location.reload();
                }
            })
        })
    }
}