package fourjo.idle.goodgame.gg.web.api;

import ch.qos.logback.core.boolex.EvaluationException;
import fourjo.idle.goodgame.gg.security.PrincipalDetails;
import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.dto.mypage.*;
import fourjo.idle.goodgame.gg.web.service.MyPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
@Tag(name = "mypage Api", description = "mypage Api 입니다.")
public class MyPageApi {

    @Autowired
    private MyPageService myPageService;

    @DeleteMapping(value = "/delete/{userIndex}")
    @Operation(summary="회원 탈퇴",description="회원탈퇴를 진행합니다.")
    public ResponseEntity<CMRespDto<?>> deleteUserAllData(@PathVariable("userIndex") int userIndex) {
        myPageService.deleteUserAllData(userIndex);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully deleted", true));
    }

    @GetMapping("/delete/pwCheck")
    @Operation(summary="비밀번호 확인",description="비밀번호가 일치하는지 검사를 합니다.")
    public ResponseEntity<CMRespDto<?>> pwCheck(UserDTO userDTO) throws EvaluationException {

        String memberPw = myPageService.pwCheck(userDTO.getUserIndex());

        boolean isPasswordMatch = BCrypt.checkpw(userDTO.getUserPw(), memberPw);

        String check;
        if (isPasswordMatch == true) {
            check = "인증이 완료되었습니다.";
        } else {
            check = "비밀번호가 일치하지 않습니다.";
        }

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", isPasswordMatch));
    }

    @PatchMapping("/update/{userIndex}")
    @Operation(summary="회원 수정",description="회원 정보를 수정합니다.")
    public ResponseEntity<CMRespDto<?>> updateMypageInfo(@PathVariable("userIndex") int userIndex, @RequestBody UserDTO userDTO) {
        userDTO.setUserIndex(userIndex);
        myPageService.updateMypageInfo(userDTO);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", userDTO));
    }

    @GetMapping("/searchList/board")
    @Operation(summary="게시물 확인",description="로그인한 회원의 작성한 게시물를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchMyBoardListByIndex(BoardSearchDTO boardSearchDTO, @AuthenticationPrincipal PrincipalDetails principalDetails) {
        List<BoardAndLikeDTO> boardDTO =  myPageService.searchMyBoardListByIndex(boardSearchDTO);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", boardDTO));
    }

    @GetMapping("/searchList/reply")
    @Operation(summary="댓글 확인",description="로그인한 회원의 작성한 댓글을 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchMyReplyListByIndex(ReplySearchDTO replySearchDTO, @AuthenticationPrincipal PrincipalDetails principalDetails) {
        List<ReplyDTO> replyDTO = myPageService.searchMyReplyListByIndex(replySearchDTO);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", replyDTO));
    }

    @GetMapping("/selectOne/{userIndex}")
    @Operation(summary="로그인 정보 출력",description="로그인한 회원의 정보를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> selectOneData(@PathVariable("userIndex") int userIndex ) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", myPageService.selectOneData(userIndex)));
    }

    @GetMapping("/getTotalBoardCount")
    public ResponseEntity<CMRespDto<?>> totalBoardCount(int userIndex, @AuthenticationPrincipal PrincipalDetails principalDetails) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", myPageService.totalBoardCount(userIndex)));

    }
    @GetMapping("/getTotalReplyCount")
    public ResponseEntity<CMRespDto<?>> totalReplyCount(int userIndex, @AuthenticationPrincipal PrincipalDetails principalDetails) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", myPageService.totalReplyCount(userIndex)));

    }

    @DeleteMapping("/delete/board/info/{boardIndex}")
    public ResponseEntity<CMRespDto<?>> deleteBoardByUserIndexAndBoardIndex(@PathVariable("boardIndex") int boardIndex, @AuthenticationPrincipal PrincipalDetails principalDetails) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", myPageService.deleteBoardByUserIndexAndBoardIndex(boardIndex, principalDetails.getUser().getUserIndex())));

    }

    @DeleteMapping("/delete/board/reply/info/{boardIndex}/{replyGroup}/{replySequence}")
    public ResponseEntity<CMRespDto<?>> deleteBoardReplyByUserIndexAndBoardIndexAndBoardGroup(@PathVariable("boardIndex") int boardIndex,@PathVariable("replyGroup") int replyGroup,@PathVariable("replySequence") int replySequence, @AuthenticationPrincipal PrincipalDetails principalDetails ) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", myPageService.deleteBoardReplyByUserIndexAndBoardIndexAndBoardGroup(boardIndex, principalDetails.getUser().getUserIndex(), replyGroup, replySequence)));

    }



}
