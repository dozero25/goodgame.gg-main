package fourjo.idle.goodgame.gg.web.service;

import fourjo.idle.goodgame.gg.repository.MyPageRepository;
import fourjo.idle.goodgame.gg.web.dto.mypage.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyPageService {

    @Autowired
    private MyPageRepository myPageRepository;


    public int insertUserData(UserDTO userDTO) {

        return myPageRepository.insertUserData(userDTO);
    }

    public int deleteUserAllData(int userIndex) {

        return myPageRepository.deleteUserAllData(userIndex);
    }
    public String pwCheck(int userId) {

        return myPageRepository.pwCheck(userId);
    }

    public int updateMypageInfo(UserDTO userDTO) {

        return myPageRepository.updateMypageInfo(userDTO);
    }

    public List<BoardAndLikeDTO> searchMyBoardListByIndex(BoardSearchDTO boardSearchDTO) {

       boardSearchDTO.setIndex();
        return myPageRepository.searchMyBoardListByIndex(boardSearchDTO);
    }

    public List<ReplyDTO> searchMyReplyListByIndex(ReplySearchDTO replySearchDTO){

        replySearchDTO.setIndex();
        return myPageRepository.searchMyReplyListByIndex(replySearchDTO);
    }

    public UserDTO selectOneData(int userIndex){
        return myPageRepository.selectOneData(userIndex);
    }


    public int totalBoardCount(int userIndex){
        return myPageRepository.totalBoardCount(userIndex);
    }

    public int totalReplyCount(int userIndex){
        return myPageRepository.totalReplyCount(userIndex);
    }

    public int deleteBoardByUserIndexAndBoardIndex(int boardIndex, int userIndex){
        return myPageRepository.deleteBoardByUserIndexAndBoardIndex(boardIndex, userIndex);
    }

    public int deleteBoardReplyByUserIndexAndBoardIndexAndBoardGroup(int boardIndex, int userIndex, int replyGroup, int replySequence){
        return myPageRepository.deleteBoardReplyByUserIndexAndBoardIndexAndBoardGroup(boardIndex, userIndex,replyGroup,replySequence);
    }
}
