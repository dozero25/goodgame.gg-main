package fourjo.idle.goodgame.gg.repository;

import fourjo.idle.goodgame.gg.web.dto.mypage.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MyPageRepository {

    public int insertUserData(UserDTO userDTO);

    public int deleteUserAllData(int userIndex);
    public String pwCheck(int userIndex);

    public int updateMypageInfo(UserDTO userDTO);

    public List<BoardAndLikeDTO> searchMyBoardListByIndex(BoardSearchDTO boardSearchDTO);

    public List<ReplyDTO> searchMyReplyListByIndex(ReplySearchDTO replySearchDTO);

    public UserDTO selectOneData(int userIndex);

    public int totalBoardCount(int userIndex);

    public int totalReplyCount(int userIndex);

    public int deleteBoardByUserIndexAndBoardIndex(int boardIndex, int userIndex);

    public int deleteBoardReplyByUserIndexAndBoardIndexAndBoardGroup(int boardIndex, int userIndex, int replyGroup, int replySequence);

}
