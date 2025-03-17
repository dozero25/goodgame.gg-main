package fourjo.idle.goodgame.gg.web.dto.record.matches;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class InfoDto {

    private String endOfGameResult;
    // 게임픽창 시간
    private long gameCreation;
    // 게임 시간(초단위)
    private long gameDuration;
    // 게임 끝난 시간(유닉스)
    private long gameEndTimestamp;

    private long gameId;
    //게임 모드
    private String gameMode;
    //
    private String gameName;
    // 인게임 시작
    private long gameStartTimestamp;
    // 게임 타입
    private String gameType;

    private String gameVersion;
    // 맵 id(11 소환사의 협곡)
    private int mapId;

    private List<ParticipantDto> participants;

    private String platformId;

    private int queueId;

    private List<TeamDto> teams;

    private String tournamentCode;
}
