package fourjo.idle.goodgame.gg.web.dto.mypage;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReplyDTO {

    private int replyIndex;
    private int boardIndex;
    private int userIndex;
    private String replyContent;
    private int replyGroup;
    private int replySequence;
    private LocalDateTime replyRegDate;

}
