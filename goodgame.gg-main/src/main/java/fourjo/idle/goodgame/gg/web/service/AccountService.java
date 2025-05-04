package fourjo.idle.goodgame.gg.web.service;

import fourjo.idle.goodgame.gg.entity.UserMst;
import fourjo.idle.goodgame.gg.exception.CustomInputPasswordException;
import fourjo.idle.goodgame.gg.exception.CustomInputUserGenderException;
import fourjo.idle.goodgame.gg.exception.CustomSameNickNameException;
import fourjo.idle.goodgame.gg.exception.CustomSameUserIdException;
import fourjo.idle.goodgame.gg.repository.AccountRepository;
import fourjo.idle.goodgame.gg.security.PrincipalDetails;
import fourjo.idle.goodgame.gg.web.dto.account.EmpDto;
import fourjo.idle.goodgame.gg.web.dto.account.UserDto;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public UserMst registerUser(UserMst userMst) {
        nullValueCheck(userMst);
        duplicateUserId(userMst.getUserId());
        checkPassword(userMst.getUserPw());
        duplicateUserNick(userMst.getUserNick());
        inputUserGender(userMst.getUserGender());

        userMst.setUserPw(new BCryptPasswordEncoder().encode(userMst.getUserPw()));
        accountRepository.registerUser(userMst);
        accountRepository.saveUserRole(userMst.getUserId());
        return userMst;
    }

    public EmpDto registerEmp(EmpDto empDto) {
        duplicateUserId(empDto.getEmpId());
        checkPassword(empDto.getEmpPw());
        inputUserGender(empDto.getEmpGender());

        empDto.setEmpPw(new BCryptPasswordEncoder().encode(empDto.getEmpPw()));
        accountRepository.registerEmp(empDto);
        accountRepository.saveEmpRole(empDto.getEmpId());
        return empDto;
    }

    public void nullValueCheck(UserMst userMst) {
        String userId = userMst.getUserId().replaceAll(" ", "");
        String userPw = userMst.getUserPw().replaceAll(" ", "");
        String userNick = userMst.getUserNick().replaceAll(" ", "");
        String userEmail = userMst.getUserEmail().replaceAll(" ", "");

        Map<String, String> errorMap = new HashMap<>();
        if(userId.equals("") || userPw.equals("") || userNick.equals("") || userEmail.equals("")){
            errorMap.put("registerError", "빈값을 확인 해주세요.");
            throw new CustomSameUserIdException(errorMap);
        }
    }

    public void duplicateUserId(String userId) {
        String userResult = accountRepository.findUserByUserIdForError(userId);
        String empResult = accountRepository.findEmpByEmpIdForError(userId);

        Map<String, String> errorMap = new HashMap<>();
        if(userResult != null || empResult != null){
            errorMap.put("registerError", "이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.");
            throw new CustomSameUserIdException(errorMap);
        }
    }

    public void checkPassword(String userPw) {
        Pattern passPattern = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$");
        // 비밀번호는 최소 8글자에서 최대 20글자, 영문자 1개 이상, 숫자 1개 이상, 특수문자1개 이상으로 구성되어야 합니다.
        Matcher passMatcher = passPattern.matcher(userPw);

        Map<String, String> errorMap = new HashMap<>();
        if(!passMatcher.find()){
            errorMap.put("registerError", "비밀번호를 다시 설정해주세요.");
            throw new CustomInputPasswordException(errorMap);
        }
    }

    public void duplicateUserNick(String userNick){
        String result = accountRepository.findNickNameByNickNameForError(userNick);

        Map<String, String> errorMap = new HashMap<>();
        if(result != null){
            errorMap.put("registerError", "이미 존재하는 닉네임입니다.");
            throw new CustomSameNickNameException(errorMap);
        }
    }

    public void inputUserGender(String userGender){
        String gender = userGender;
        if(userGender == null){
            gender = "x";
        } else {
            gender = gender.toLowerCase();
        }
        Map<String, String> errorMap = new HashMap<>();

        if( (gender.equals("m") || gender.equals("w")) != true ){
            errorMap.put("registerError", "성별을 선택해주세요.");
            throw new CustomInputUserGenderException(errorMap);
        }
    }

    public Map<String, Object> extractUserOfOauth2Info(Object principal) {
        if (principal == null || principal.equals("anonymousUser")) {
            return null;
        }

        Map<String, Object> responseData = new HashMap<>();

        if (principal instanceof PrincipalDetails principalDetails) {
            responseData.put("type", "local");
            responseData.put("userIndex", accountRepository.findUserByUserIndex(principalDetails.getUsername()));
            responseData.put("username", principalDetails.getUsername());
            responseData.put("roles", principalDetails.getAuthorities());
        } else if (principal instanceof OAuth2User oauth2User) {

            Map<String, Object> attributes = oauth2User.getAttributes();
            String provider = "";

            responseData.put("type", "oauth2");

            if (attributes.containsKey("kakao_account")) {
                provider = "kakao";
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

                responseData.put("nickname", profile.getOrDefault("nickname", "unknown"));
                responseData.put("email", kakaoAccount.getOrDefault("email", "null"));
            } else if (attributes.containsKey("response")) {
                provider = "naver";
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");

                responseData.put("nickname", response.getOrDefault("nickname", "unknown"));
                responseData.put("email", response.getOrDefault("email", "null"));
            } else {
                responseData.put("nickname", oauth2User.getAttribute("nickname"));
                responseData.put("email", oauth2User.getAttribute("email"));
            }
            responseData.put("provider", provider);

            String oauth2Id = provider + "_" + responseData.get("email");
            String nickname = (String) responseData.get("nickname");
            String email = (String) responseData.get("email");

            boolean isValid = true;

            try {
                String result = accountRepository.findUserByUserIdForError(oauth2Id);

                Map<String, String> errorMap = new HashMap<>();
                if(result != null){
                    errorMap.put("registerError", "이미 존재하는 아이디입니다.");
                    throw new CustomSameNickNameException(errorMap);
                }

            } catch (CustomSameUserIdException c) {
                isValid = false;
            } catch (Exception e) {
                isValid = false;
            }

            if(isValid){
                UserMst userMst = new UserMst();

                userMst.setUserId(oauth2Id);
                userMst.setUserPw(new BCryptPasswordEncoder().encode(oauth2Id));
                userMst.setUserNick(nickname);
                userMst.setUserGender("m");
                userMst.setUserEmail(email);

                accountRepository.registerUser(userMst);
                accountRepository.saveUserRole(userMst.getUserId());
            }
            int userIndex = accountRepository.findUserByUserIndex(oauth2Id);
            responseData.put("userIndex", userIndex);

        }


        return responseData;
    }

}
