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
        if (principal == null || "anonymousUser".equals(principal)) {
            return null;
        }

        if (principal instanceof PrincipalDetails principalDetails) {
            return extractLocalUserInfo(principalDetails);
        } else if (principal instanceof OAuth2User oauth2User) {
            return extractOAuth2UserInfo(oauth2User);
        }

        return null;
    }

    private Map<String, Object> extractLocalUserInfo(PrincipalDetails principalDetails) {
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("type", "local");
        responseData.put("userIndex", accountRepository.findUserByUserIndex(principalDetails.getUsername()));
        responseData.put("username", principalDetails.getUsername());
        responseData.put("roles", principalDetails.getAuthorities());
        return responseData;
    }

    private Map<String, Object> extractOAuth2UserInfo(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String provider = detectProvider(attributes);

        Map<String, Object> userInfo = extractOAuthAttributes(attributes, provider);
        String nickname = (String) userInfo.get("nickname");
        String email = (String) userInfo.get("email");
        String oauth2Id = provider + "_" + email;

        registerUserIfNotExists(oauth2Id, nickname, email);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("type", "oauth2");
        responseData.put("provider", provider);
        responseData.put("nickname", nickname);
        responseData.put("email", email);
        responseData.put("userIndex", accountRepository.findUserByUserIndex(oauth2Id));

        return responseData;
    }

    private String detectProvider(Map<String, Object> attributes) {
        if (attributes.containsKey("kakao_account")) {
            return "kakao";
        } else if (attributes.containsKey("response")) {
            return "naver";
        } else {
            return "google";
        }
    }

    private Map<String, Object> extractOAuthAttributes(Map<String, Object> attributes, String provider) {
        Map<String, Object> userInfo = new HashMap<>();

        switch (provider) {
            case "kakao" -> {
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                userInfo.put("nickname", profile.getOrDefault("nickname", "unknown"));
                userInfo.put("email", kakaoAccount.getOrDefault("email", "null"));
            }
            case "naver" -> {
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                userInfo.put("nickname", response.getOrDefault("nickname", "unknown"));
                userInfo.put("email", response.getOrDefault("email", "null"));
            }
            default -> {
                userInfo.put("nickname", attributes.getOrDefault("nickname", "unknown"));
                userInfo.put("email", attributes.getOrDefault("email", "null"));
            }
        }

        return userInfo;
    }

    private void registerUserIfNotExists(String oauth2Id, String nickname, String email) {
        try {
            String result = accountRepository.findUserByUserIdForError(oauth2Id);

            if (result != null) {
                Map<String, String> errorMap = new HashMap<>();
                errorMap.put("registerError", "이미 존재하는 아이디입니다.");
                throw new CustomSameNickNameException(errorMap);
            }
        } catch (CustomSameUserIdException ignored) {
            return;
        } catch (Exception e) {
            return;
        }

        UserMst userMst = new UserMst();
        userMst.setUserId(oauth2Id);
        userMst.setUserPw(new BCryptPasswordEncoder().encode(oauth2Id));
        userMst.setUserNick(nickname);
        userMst.setUserGender("m");
        userMst.setUserEmail(email);

        accountRepository.registerUser(userMst);
        accountRepository.saveUserRole(userMst.getUserId());
    }


}
