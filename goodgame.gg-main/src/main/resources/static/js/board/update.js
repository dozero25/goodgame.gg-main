window.onload = () => {
    HeaderService.getInstance().loadHeader();

    BoardUpdateService.getInstance().setBoardUpdateBoardIndex();
    BoardUpdateService.getInstance().getLoadBoard();

    ComponentEvent.getInstance().addClickEventUpdateButton();

}

const boardObj = {
    boardIndex: 0, 
    boardSubject: "", 
    userIndex: 0, 
    userId: "", 
    userNick:"",
    replyCount: 0, 
    boardContent: "", 
    boardVisit: 0, 
    boardRegDate: "", 
    boardLikeCount:0,
    boardUploadName: "",
    boardUploadSize: "",
    boardUploadLocation:""

}


class BoardUpdateApi{
    static #instance = null;
    static getInstance(){
        if(this.#instance == null) {
            this.#instance = new BoardUpdateApi();
        }
        return this.#instance;
    }



    updateSelectOneBoard(){

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


    updateBoard(){
        let successFlag = false;
        console.log(boardObj);

        $.ajax({
            async: false,
            type: "post",
            url: `http://localhost:8000/api/board/update`,
            contentType: "application/json",
            data: JSON.stringify(boardObj),
            dataType: "json",
            success: response => {
                successFlag = true;
            },
            error: error => {
                console.log(error);
                successFlag = false;
            }
        });
        return successFlag;

    }
    
    fileUpdateBoard(formData){
        let successFlag = false;

         $.ajax({
             async: false,
             type : 'POST',
             url: `http://localhost:8000/api/board/fileUpdate`,
             processData : false,
             contentType : false,
             data : formData,
             dataType:"json",
             success: response => {
                 successFlag = true;
             },
             error: error => {
                 console.log(error);
             }
 
         });
 
          return successFlag;
    }

    loadUpdateBoard(){
        let responseData = null;

        $.ajax({
            async: false,
            type: "get",
            url: `http://localhost:8000/api/board/update/${boardObj.boardIndex}`,
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
}

class BoardUpdateService{
    static #instance = null;
    static getInstance(){
        if(this.#instance == null) {
            this.#instance = new BoardUpdateService();
        }
        return this.#instance;
    }

    setBoardUpdateBoardIndex() {
        const URLSearch = new URLSearchParams(location.search);
        boardObj.boardIndex = URLSearch.get("boardIndex");

        const principal = PrincipalApi.getInstance().getPrincipal();
        
    }


    getLoadBoard(){    
        const responseData = BoardUpdateApi.getInstance().loadUpdateBoard();

        const updateDetail = document.querySelector(".update-detail");

            
            updateDetail.innerHTML = `

                <div class="title-detail">
                    <div>
                        <div class="update-title-box">
                            <div class="updateTitle">제목</div>
                        </div>
                        <input type="text" id="boardSubject" class="updateBoardSubject" autocomplete="off" value="${responseData.data.boardSubject}">
                    </div>
                </div>
                <div>
                    <div class ="updateUserNickAndContent">
                        <label class="updateUserNick">작성자</label>
                        <span>
                            <input type="text" class="userNickView" id="userNick" autocomplete="off" value="${responseData.data.userNick}" readonly>
                        </span>
                        <label class="updateRegDate">&nbsp;작성일&nbsp;</label>
                        <span>
                            <input type="datetime" id="boardRegDate" class="boardRegDateView" autocomplete="off" value="${responseData.data.boardRegDate}" readonly>
                        </span>
                    </div>
                </div>
                <div class="content-detail">
                    
                    <div>
                        <div  class="content-detail-box">
                            <div class="updateContent">내용</div>
                        </div>
                        <div>
                            <textarea class="updateBoardContent" id = "boardContent" cols="100" rows="30">${responseData.data.boardContent}</textarea>
                        </div>
                        <div>
                            <form id="uploadForm" method="post" enctype="multipart/form-data">
                            <input type="file" id="updateUploadFile"  class="updateUploadFile" value1="${responseData.data.boardUploadName}" value2="${responseData.data.boardIndex}" name="file">
                            </form>
                        </div>
                    </div>
                    <input type="hidden" class="boardUploadName">
                    <input type="hidden" class="boardUploadName">
                    <input type="hidden" class="boardUploadName">
                </div>

                <input type="hidden" class="boardUploadName">
                <input type="hidden" class="boardUploadName">
                <input type="hidden" class="boardUploadName">

                <div class = "update-btn">
                    <button type="submit" id = "update-complete" class="update-complete">수정완료</button>
                    <a href = "http://localhost:8000/board/selectOne?boardIndex=${responseData.data.boardIndex}">
                    <button type="button" class = "update-cancel"  value="${responseData.data.boardIndex}">수정취소</button>
                    </a>
                </div>
            `;
     

  
    }

    setUpdateBoardObjValues(){
        const principal = PrincipalApi.getInstance().getPrincipal();

        const responseData = BoardUpdateApi.getInstance().loadUpdateBoard();
  
        const formData = new FormData();
        const uploadFile = document.getElementById("updateUploadFile").files[0];

        let updateOK = 0;

        if(document.getElementById("boardSubject").value == "" || document.getElementById("boardContent").value == ""){
            updateOK = 1;
        }else{
            if(uploadFile == null){
                
                boardObj.userNick = document.getElementById("userNick").value;
                boardObj.boardSubject = document.getElementById("boardSubject").value;
                boardObj.boardRegDate = document.getElementById("boardRegDate").value;
                boardObj.boardContent = document.getElementById("boardContent").value;
                boardObj.boardIndex = responseData.data.boardIndex;
                BoardUpdateApi.getInstance().updateBoard() == true? updateOK = 0 : updateOK = 3;
    
            }else {
                let fileCheck = document.getElementById("updateUploadFile").value.split(".");

                let extension = ["png","img","jpg","jpeg","gif","bmp"];

                if(!extension.includes(fileCheck[fileCheck.length-1])){
                    updateOK=2;
                
                }else{

                    formData.append('file', uploadFile);
                    formData.append('userNick', principal.user.userNick);
                    formData.append('boardSubject',document.getElementById("boardSubject").value);
                    formData.append('boardRegDate', document.getElementById("boardRegDate").value);
                    formData.append('boardContent',document.getElementById("boardContent").value);
                    formData.append('boardIndex', responseData.data.boardIndex);
                    BoardUpdateApi.getInstance().fileUpdateBoard(formData) == true? updateOK = 0 : updateOK = 3;
             
                }
            }
        
        }
        
        return updateOK;
    }

}

class ComponentEvent{
    static #instance = null;
    static getInstance(){
        if(this.#instance == null) {
            this.#instance = new ComponentEvent();
        }
        return this.#instance;
    }

    addClickEventUpdateButton(){
        const updateButton = document.querySelector(".update-complete");

        updateButton.addEventListener("click", function () {

            let updateSuccess;
            updateSuccess = BoardUpdateService.getInstance().setUpdateBoardObjValues();
                if(updateSuccess == 0) {
                    alert("수정이 완료되었습니다.");
                    location.href=`http://localhost:8000/board/selectOne?boardIndex=${boardObj.boardIndex}` 
                } else if (updateSuccess ==1 ){
                    alert("제목과 내용은 공백일 수 없습니다.");
                    
                } else if (updateSuccess ==2 ){
                    alert("첨부파일 형식을 확인해주세요 \n (png, img, jpg, jpeg, gif, bmp)");
                   
                } else if (updateSuccess ==3){
                    alert("수정이 실패했습니다. 관리자에게 문의바랍니다.")
                }    
            
        })
        
    }        
  

}

