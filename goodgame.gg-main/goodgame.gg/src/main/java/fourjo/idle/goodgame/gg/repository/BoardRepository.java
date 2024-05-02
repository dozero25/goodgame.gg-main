package fourjo.idle.goodgame.gg.repository;

import fourjo.idle.goodgame.gg.web.dto.board.BoardDTO;
import fourjo.idle.goodgame.gg.web.dto.board.BoardReplyDTO;
import fourjo.idle.goodgame.gg.web.dto.board.BoardSearchDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BoardRepository {

    public int boardInsert(BoardDTO dto);
    public int registerBoardImg(BoardDTO boardDTO);

    public int boardUpdateOKByBoardIndex(BoardDTO dto);
    public int boardFileUpdate(BoardDTO boardDTO);
    public BoardDTO loadUpdatePageByBoardIndex(int boardIndex);

    public int boardDeleteByBoardIndex(int boardIndex);

    public BoardDTO boardSelectOneByBoardIndex(int boardIndex);

    public List<BoardDTO> boardSearchAllBySubjectAndUserIndexAndContent(BoardSearchDTO dto);
    public int boardTotalCount(BoardSearchDTO dto) ;

    public int likeByBoardIndexAndUserIndex(int boardIndex, int userIndex);
    public int likeCountByBoardIndex(int boardIndex);
    public void likeAdd(int boardIndex, int userIndex);
    public void likeUpdate(int boardIndex);
    public void likeCancel(int boardIndex, int userIndex);

    public int boardViewCount(BoardDTO dto);

    public int boardReplyInsertByReplyGroup(BoardReplyDTO dto);
    public int boardReplyInsertByReplySequence(BoardReplyDTO dto);

    public BoardReplyDTO boardReplyUpdateSelectOneByReplyIndex(int replyIndex);
    public int boardReplyUpdateByReplyIndex(BoardReplyDTO dto);

    public int boardReplyDeleteByReplyIndex(int replyIndex);
    public int boardReplyDeleteByReplyIndexAndBoardIndex(int replyIndex, int boardIndex);

    public List<BoardReplyDTO> boardReplySelectAll(int boardIndex);


    public int boardReplyGroupCount(int boardIndex);
    public int boardReplySequenceCount(int boardIndex, int replyGroup);
}
