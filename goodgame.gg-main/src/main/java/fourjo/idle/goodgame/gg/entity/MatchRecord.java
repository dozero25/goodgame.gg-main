package fourjo.idle.goodgame.gg.entity;

import fourjo.idle.goodgame.gg.web.dto.record.matches.MatchDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchRecord {
    private String matchId;
    private MatchDto matchDto;
}
