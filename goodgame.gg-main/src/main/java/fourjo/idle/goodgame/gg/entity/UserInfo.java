package fourjo.idle.goodgame.gg.entity;

import fourjo.idle.goodgame.gg.web.dto.record.league.LeagueEntryDto;
import fourjo.idle.goodgame.gg.web.dto.record.SummonerDto;
import lombok.Data;
import nonapi.io.github.classgraph.json.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "autocomplete_users")
public class UserInfo {

    @Id
    private String id;

    private String gameName;
    private String tagLine;
    private String puuid;

    private SummonerDto summonerDto;
    private List<LeagueEntryDto> leagueEntryDto;

    private List<String> matchDtoList;
    private List<MatchRecord> matchRecordsList;

    private long lastSearchedAt;

}
