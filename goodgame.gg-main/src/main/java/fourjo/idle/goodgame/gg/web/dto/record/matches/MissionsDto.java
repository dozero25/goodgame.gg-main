package fourjo.idle.goodgame.gg.web.dto.record.matches;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MissionsDto {

    private int playerScore0;
    private int playerScore1;
    private int playerScore2;
    private int playerScore3;
    private int playerScore4;
    private int playerScore5;
    private int playerScore6;
    private int playerScore7;
    private int playerScore8;
    private int playerScore9;
    private int playerScore10;
    private int playerScore11;
}
