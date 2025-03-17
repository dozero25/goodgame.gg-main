package fourjo.idle.goodgame.gg.web.dto.board;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardDTO {

    private int boardIndex;
    private String boardSubject;
    private int userIndex;
    private String boardContent;
    private LocalDateTime boardRegDate;
    private int boardVisit;
    private String boardUploadName;
    private Long boardUploadSize;
    private String boardUploadLocation;
    private int replyCount;
    private String userNick;
    private MultipartFile file;
    private int boardLikeCount;




}
