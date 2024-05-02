package fourjo.idle.goodgame.gg.web.dto.mypage;

import lombok.Data;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Data
public class BoardForApiDTO {

    private int boardIndex;
    private String boardSubject;
    private int userIndex;
    private String boardContent;
    private LocalDateTime boardRegDate;
    private int boardVisit;
    private int boardGood;
    private int boardBad;
    private String boardUploadName;
    private BigInteger boardUploadSize;
    private String boardUploadLocation;

}
