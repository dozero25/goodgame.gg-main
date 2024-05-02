package fourjo.idle.goodgame.gg.web.dto.account;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmpDto {
    private int empIndex;
    private String empId;
    private String empPw;
    private String empName;
    private LocalDateTime empRegNum;
    private String empEmail;
    private String empPhone;
    private String empGender;
}
