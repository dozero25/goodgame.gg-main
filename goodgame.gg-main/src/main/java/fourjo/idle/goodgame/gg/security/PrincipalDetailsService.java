package fourjo.idle.goodgame.gg.security;

import fourjo.idle.goodgame.gg.entity.EmpMst;
import fourjo.idle.goodgame.gg.entity.UserMst;
import fourjo.idle.goodgame.gg.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PrincipalDetailsService implements UserDetailsService {

    private final AccountRepository userRepository;

    @Override
    public UserDetails loadUserByUsername (String username) throws UsernameNotFoundException {

        UserMst user = userRepository.findUserByUserId(username);
        EmpMst emp = userRepository.findEmpByEmpId(username);

        if (user == null && emp == null) {
            throw new UsernameNotFoundException("회원정보를 확인할 수 없습니다.");
        }
        return new PrincipalDetails(user, emp);
    }
}
