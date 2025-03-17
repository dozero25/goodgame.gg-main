package fourjo.idle.goodgame.gg.web.dto.board;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardLikeDTO {

    private int boardLikeId;
    private int boardIndex;
    private int userIndex;
    private int boardLike;
    private int boardBad;
}
