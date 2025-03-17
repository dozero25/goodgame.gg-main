package fourjo.idle.goodgame.gg.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserMst {
    private int userIndex;
    private String userId;
    private String userPw;
    private String userNick;
    private String userGender;
    private LocalDateTime userRegDate;
    private String userEmail;
    private int roleId;
    private String roleName;
}
