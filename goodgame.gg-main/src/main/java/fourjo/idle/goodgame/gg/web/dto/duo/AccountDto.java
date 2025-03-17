package fourjo.idle.goodgame.gg.web.dto.duo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountDto {

    private String puuid;
    private String gameName;
    private String tagLine;



}
