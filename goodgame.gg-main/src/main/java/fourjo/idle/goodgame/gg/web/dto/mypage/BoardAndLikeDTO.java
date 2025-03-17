package fourjo.idle.goodgame.gg.web.dto.mypage;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BoardAndLikeDTO {

    private int boardIndex;
    private String boardSubject;
    private int userIndex;
    private String boardContent;
    private LocalDateTime boardRegDate;
    private int boardVisit;
    private int boardLike;

}
