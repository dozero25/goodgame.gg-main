package fourjo.idle.goodgame.gg.security;

import fourjo.idle.goodgame.gg.entity.EmpMst;
import fourjo.idle.goodgame.gg.entity.UserMst;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@RequiredArgsConstructor
public class PrincipalDetails implements UserDetails {

    @Getter
    private final UserMst user;

    @Getter
    private final EmpMst emp;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        ArrayList<GrantedAuthority> authorities = new ArrayList<>();

        if(user != null){
            String roleName = user.getRoleName();

            GrantedAuthority role = new GrantedAuthority() {
                @Override
                public String getAuthority() {
                    return roleName;
                }
            };
            authorities.add(role);
        }
        else if (emp != null) {
            String roleName = emp.getRoleName();

            GrantedAuthority role = new GrantedAuthority() {
                @Override
                public String getAuthority() {
                    return roleName;
                }
            };
            authorities.add(role);
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        String pw = "";
        if (user != null) {
            pw = user.getUserPw();
        }
        else if(emp != null) {
            pw =  emp.getEmpPw();
        }
        return pw;
    }

    @Override
    public String getUsername() {
        String id = "";
        if (user != null) {
            id =  user.getUserId();
        }
        else if(emp != null) {
            id =  emp.getEmpId();
        }
        return id;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
