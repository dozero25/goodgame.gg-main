window.onload = () => {
    HeaderService.getInstance().loadHeader();

    ComponentEvent.getInstance().addClickEventInsertButton();
    ComponentEvent.getInstance().addClickEventInsertCancelButton()

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
    boardLikeCount: "",
    boardRegDate: "",
    boardUploadName: "",
    boardUploadSize: "",
    boardUploadLocation: "",
}

class BoardInsertApi {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new BoardInsertApi();
        }
        return this.#instance;
    }


    insertBoard() {
        let successFlag = false;
        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/insert`,
            contentType: "application/json",
            data: JSON.stringify(boardObj),
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


    fileInsertBoard(formData) {
        let successFlag = false;

        $.ajax({
            async: false,
            type: 'POST',
            url: `http://localhost:8000/api/board/fileInsert`,
            processData: false,
            contentType: false,
            data: formData,
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
}

class BoardInsertService {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new BoardInsertService();
        }
        return this.#instance;
    }

    setBoardObjValues() {
        const principal = PrincipalApi.getInstance().getPrincipal();

        const formData = new FormData();
        const uploadFile = document.getElementById("uploadFile").files[0];

        let insertOK = 0;
        if (document.getElementById("subject").value == "" || document.getElementById("content").value == "") {
            insertOK = 1;

        } else {
            if (uploadFile == null) {
                boardObj.userIndex = principal.user.userIndex;
                boardObj.boardSubject = document.getElementById("subject").value;
                boardObj.boardContent = document.getElementById("content").value;
                BoardInsertApi.getInstance().insertBoard() == true ? insertOK = 0 : insertOK = 3;
            } else {
                let fileCheck = document.getElementById("uploadFile").value.split(".");

                let extension = ["png", "img", "jpg", "jpeg", "gif", "bmp"];

                if (!extension.includes(fileCheck[fileCheck.length - 1])) {
                    insertOK = 2;
                } else {
                    formData.append('file', uploadFile);
                    formData.append('userIndex', principal.user.userIndex);
                    formData.append('boardSubject', document.getElementById("subject").value);
                    formData.append('boardContent', document.getElementById("content").value);

                    BoardInsertApi.getInstance().fileInsertBoard(formData) == true ? insertOK = 0 : insertOK = 3;
                }
            }
        }
        return insertOK;
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

    addClickEventInsertButton() {

        const insertButton = document.querySelector(".insert-complete");

        insertButton.onclick = () => {

            let insertSuccess;
            insertSuccess = BoardInsertService.getInstance().setBoardObjValues();

            if (insertSuccess == 0) {
                alert("등록이 완료되었습니다.");
                location.href = "http://localhost:8000/board";
            } else if (insertSuccess == 1) {
                alert("제목과 내용은 공백일 수 없습니다.");

            } else if (insertSuccess == 2) {
                alert("첨부파일 형식을 확인해주세요 \n (png, img, jpg, jpeg, gif, bmp)");

            } else if (insertSuccess == 3) {
                alert("등록이 실패했습니다. 관리자에게 문의바랍니다.")
            }
        }
    }
    addClickEventInsertCancelButton() {

        const insertCancelButton = document.querySelector(".insert-cancel");

        insertCancelButton.addEventListener('click', function () {
            window.location.href = 'http://localhost:8000/board';
        });
    }
}