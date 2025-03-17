package fourjo.idle.goodgame.gg.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class EmpMst {
    private int empIndex;
    private String empId;
    private String empPw;
    private String empName;
    private String empRegNum;
    private String empEmail;
    private String empPhone;
    private String empGender;
    private int roleId;
    private String roleName;
}
