![p1](https://github.com/user-attachments/assets/fa2b9cd6-01c0-42b3-b236-3d78986dc6e6)

# goodgame.gg

롤 게임 전적 사이트

## 프로젝트 개요

- 프로젝트 종료 후 개인 학습 및 기능 추가
- 코드 개선 및 SQL 쿼리 개선으로 리팩토링 학습

## 기술 스택
- **Frontend** : JavaScript, HTML, CSS
- **Backend** : Java, Spring Boot
- **Authentication** : Spring Security, OAuth2 (Kakao, Naver 연동)
- **Database** : MySQL

## 프로젝트 코드 개선 및 기능 추가

### 전적검색 JS 코드 기능 개선
- 직접적으로 URL에 노출된 API_KEY는 보안의 위험성이 있기 때문에 YML에 추가 및 RiotApiKeyDto 변경
``` YML
  riot:
    api:
      key: {key}
      server-url: {sever-url}
      asia-url: {asia-url}
```
<br>

- 기존 코드의 조건이 길어지고 가독성이 떨어짐, 반복해서 사용할 경우 같은 조건을 여러번 사용해야하므로 중복 코드가 발생
- fixChampionName(), getWinTextColorHTML(), getTimeAgoString()로 분리하여 코드 재사용 가능 및 가독성 향상
``` JS
    // 챔피언 이름 정리 함수, 피들스틱 챔프의 이름이 cdn으로 보내진 값과 달라서 사용
    fixChampionName(name) {
          return name === "FiddleSticks" ? "Fiddlesticks" : name;
    }

    // 승/패 텍스트 색상 처리 함수
    getWinTextColorHTML(winStatus) {
          const color = winStatus === "WIN" ? "#0004ff" : "#f4584e";
          return `<font color=\"${color}\">${winStatus}</font>`;
    }

    // 게임 시간 계산 함수
    getTimeAgoString(startTimestamp) {
          const now = new Date();
          const gameStartTime = new Date(startTimestamp);
          const diffMs = now - gameStartTime;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
          if (diffDays >= 1) {
              return `${diffDays}일 전`;
          } else if (diffHours >= 1) {
              return `${diffHours}시간 전`;
          } else {
              return "방금 전";
          }
    }
```

<br>

- if(queueId == 420 || quqeId == 440 ...) 이런 코드는 길어지고, 나중에 모드가 추가되면 수정이 복잡해짐. 실제로 아레나가 추가되면서 더욱 복잡해졌음
- 객체로 정리하면서 모드가 추가되면 객체에 값만 추가하면 되는 형식으로 변경
``` JS
    queueNameMap = {
        420: "솔로랭크",
        490: "일반게임",
        440: "자유랭크",
        450: "무작위 총력전",
        1700: "아레나"
    };
```

<br>

- 함수 하나로 사용
- 일반게임, 솔로랭크, 자유랭크는 UI를 공유하기 때문에 하나로 묶고 무작위 총력전, 아레나는 UI가 다르기 때문에 다른 UI로 출력
```JS
    createMatchBoxHtml(matchData, participant, participantObj, queueId, participantsInfo, bestplayers, winTeam, loseTeam) {
        const queueName = this.queueNameMap[queueId] || "기타";
        const timeAgo = this.getTimeAgoString(matchData.info.gameStartTimestamp);
        const duration = new Date(matchData.info.gameDuration * 1000);

        const matchResultClass = participantObj.win == "WIN" ? "match-box win-color" : "match-box lose-color";

        const champName = this.fixChampionName(participant.championName);
        const kda = participant.deaths === 0
            ? (participant.kills + participant.assists)
            : ((participant.kills + participant.assists) / participant.deaths).toFixed(2);

        const rankGameQueues = ["일반게임", "솔로랭크", "자유랭크"];
        const aramQueues = ["무작위 총력전"];
        const arenaQueues = ["아레나"];
        const errorQueues = ["기타"];

        if (rankGameQueues.includes(queueName)) {
            return `
        <div class="${matchResultClass}">
        <div class="match-info-fir">
            <span class="info-text text-fir">${queueName}</span>
            <span class="info-text text-sec">${timeAgo}</span>
            <span class="info-text text-thi">${this.getWinTextColorHTML(participantObj.win)}</span>
            <span class="info-text text-four">${duration.getMinutes()}:${duration.getSeconds().toString().padStart(2, '0')}</span>
        </div>
        ...
        } else if (aramQueues.includes(queueName)) {
            return `
                <div class="${matchResultClass}">
                    <div class="match-info-fir">
                        <span class="info-text text-fir">${queueName}</span>
                        <span class="info-text text-sec">${timeAgo}</span>
                        <span class="info-text text-thi">${this.getWinTextColorHTML(participantObj.win)}</span>
                        <span class="info-text text-four">${duration.getMinutes()}:${duration.getSeconds().toString().padStart(2, '0')}</span>
                    </div>
        ...
       } else if (errorQueues.includes(queueName)) {
            return `
            <div class="match-box">불편을 끼쳐 드려 죄송합니다. 빠르게 조치하겠습니다.</div>
        `
        }
```

### Oauth2 추가
- yml에 naver, kakao 추가
``` xml
  security:
    oauth2:
      client:
        registration:
          naver:
            clientId: {clientId}
            clientSecret: {clientSecret}
            ...
            redirectUri: {redirectUri}
          kakao:
            clientId: {clientId}
            ...
            redirectUri: {redirectUri}

```

<br>

- Spring Security 기반 인증 구조에 OAuth2 소셜 로그인(Kakao, Naver) 기능을 통합
- 하드 코딩된 전체 메서드를 역할별로 나누고 중복 제거 -> 가독성 및 재사용성 상승
``` JAVA
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
        return "google"; // fallback or others
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
       퇴
    oauth2DeleteSection() {
        const userType = PrincipalApi.getInstance().getPrincipal().type;

        if (userType === "oauth2") {
            document.getElementById('check-user-pw-button').style.display = "none";
            document.getElementById('delete-button').disabled = false;

            document.getElementById('delete-button').onclick = () => {
                const width = 400;
                const height = 250;
        
                const screenX = window.screen.availWidth;
                const screenY = window.screen.availHeight;
        
                const left = (screenX - width) / 2;
                const top = (screenY - height) / 2;

                const confirmWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);

                const confirmContent = `
                        <html>
                            <head>
                                <style>
                                    body {
                                        font-family: 'Arial', sans-serif;
                                        text-align: center;
                                        background-color: #f8f9fa;
                                        padding: 30px;
                                    }

                                    h2 {
                                        color: #dc3545;
                                    }

                                    p {
                                        margin-top: 10px;
                                        color: #333;
                                    }

                                    #confirm-delete-btn {
                                        margin-top: 20px;
                                        padding: 10px 20px;
                                        background-color: #dc3545;
                                        color: white;
                                        border: none;
                                        border-radius: 5px;
                                        cursor: pointer;
                                    }

                                    #confirm-delete-btn:hover {
                                        background-color: #c82333;
                                    }
                                </style>
                                <title>회원 탈퇴 확인</title>
                            </head>
                            <body>
                                <h2>정말로 회원 탈퇴하시겠습니까?</h2>
                                <p>탈퇴를 원하지 않으면 이 창을 닫아주세요.</p>
                                <button id="confirm-delete-btn">탈퇴하기</button>

                                <script>
                                    window.onload = function() {
                                        document.getElementById('confirm-delete-btn').onclick = function() {
                                            window.opener.postMessage({ action: "confirmDelete" }, "*");
                                            window.close();
                                        };
                                    };
                                </script>
                            </body>
                        </html>
                `;

                confirmWindow.document.open();
                confirmWindow.document.write(confirmContent);
                confirmWindow.document.close();
            };

            window.addEventListener("message", (event) => {
                if (event.data.action === "confirmDelete") {
                    const successFlag = MyPageService.getInstance().deleteAll();
                    if (successFlag) {
                        alert("회원탈퇴 완료되었습니다.");
                        window.location.href = "/logout";
                    } else {
                        alert("회원탈퇴 실패하였습니다.");
                        location.reload();
                    }
                }
            });
        } else {
            ComponentEvent.getInstance().ClickEventPopupForCheckUserPw();
            ComponentEvent.getInstance().ClickEventDeleteButton();
        }
    }
```

### 챔피언 숙련도 추가

