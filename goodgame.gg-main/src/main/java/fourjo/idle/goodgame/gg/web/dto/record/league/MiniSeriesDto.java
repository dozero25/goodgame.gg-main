package fourjo.idle.goodgame.gg.web.dto.record.league;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MiniSeriesDto {
    private int losses;
    private String progress;
    private int target;
    private int wins;
}
