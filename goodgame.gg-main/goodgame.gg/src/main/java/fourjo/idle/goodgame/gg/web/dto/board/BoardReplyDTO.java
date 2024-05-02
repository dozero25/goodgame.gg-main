package fourjo.idle.goodgame.gg.web.dto.board;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class BoardReplyDTO{

    private int replyIndex;
    private int boardIndex;
    private int userIndex;
    private String userId;
    private String replyContent;
    private int replyGroup;
    private int replySequence;
    private LocalDateTime replyRegDate;
    private String userNick;
}
