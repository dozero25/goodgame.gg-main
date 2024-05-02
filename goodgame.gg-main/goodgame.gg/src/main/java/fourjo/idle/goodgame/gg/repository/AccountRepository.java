package fourjo.idle.goodgame.gg.repository;

import fourjo.idle.goodgame.gg.entity.EmpMst;
import fourjo.idle.goodgame.gg.entity.UserMst;
import fourjo.idle.goodgame.gg.web.dto.account.EmpDto;
import fourjo.idle.goodgame.gg.web.dto.account.UserDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AccountRepository {

    public int registerUser(UserDto userDto);
    public int saveUserRole(String userId);

    public int registerEmp(EmpDto empDto);
    public int saveEmpRole(String empId);

    public String findUserByUserIdForError(String userId);
    public String findNickNameByNickNameForError(String userNick);
    public String findEmpByEmpIdForError(String empId);

    public UserMst findUserByUserId(String userId);
    public EmpMst findEmpByEmpId(String empId);

}
