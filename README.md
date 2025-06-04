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

### 리그 오브 레전드 챔피언 숙련도 검색 기능

- **목표** : 사용자가 원하는 LoL 챔피언의 숙련도 정보를 검색할 수 있는 기능 구현

- **기술 스택** :  
  - **Java** – 백엔드 연동 및 데이터 처리  
  - **JavaScript** – 객체지향 방식으로 프론트엔드 로직 구현  
  - **API 연동** – 외부 API를 통한 챔피언 숙련도 검색  
  - **HTML/CSS** – UI 구성  
  - **Git** – 버전 관리  

- **프로젝트 개요** :  
  LoL API를 활용해 챔피언 숙련도 데이터를 실시간으로 받아와, 사용자가 입력한 검색어에 따라 자동완성 및 조회 기능을 제공. 사용자는 원하는 챔피언 정보를 빠르게 확인할 수 있음.

- **기여 내용** :  
  - **자동완성 구현** : 챔피언 이름 입력 시 관련 챔피언 추천  
  - **UI 개선** : 검색 시작 시 리스트 자동 표시 및 클릭 선택 가능  
  - **API 연동** : 챔피언 숙련도 JSON 데이터를 받아와 파싱 및 표시  
  - **디버깅/최적화** : 비동기 처리 및 이벤트 충돌 해결, API 호출 최소화

- **기술적 도전 및 해결** :  
  - **무작위 출력 문제 해결** : JavaScript의 `then()` 처리로 출력 순서가 꼬이는 문제 발생 → `Promise.all()`을 사용해 모든 데이터를 수집 후 출력  
  - **API 최적화** : 중복 호출 방지 및 캐싱 적용으로 응답 속도 개선

- **결과** :  
  - 실시간 자동완성 검색과 숙련도 조회 기능을 제공  
  - 직관적인 UI/UX로 사용자 편의성 향상
 

#### 주요 구현 코드 예시 - 챔피언 무작위 출력 문제 해결
``` javascript
    async renderNextChampions() {
        const container = document.querySelector(".champion-container");
        const loadMoreBtn = document.getElementById("load-more-btn");

        // 다음에 랜더링할 챔피언 숙련도 데이터 슬라이싱
        const nextData = championMasteryData.slice(currentIndex, currentIndex + itemsPerPage);

        // 각 챔피언 ID에 해당하는 정보(이름, 아이콘 등)를 비동기로 조회
        const championInfos = await Promise.all(
            nextData.map(async (data) => {
                const champ = await this.getChampionNameById(data.championId);
                return { champ, data };
            })
        );

        // 가져온 챔피언 정보 HTML에 추가
        championInfos.forEach(({ champ, data }) => {
            container.innerHTML += `
            <div class="champion-card">
                <div class="champion-show-info">
                    <div class="champion-icon">
                        <img src="${window.BASE_URL}/img/champion/${champ.id}.png" alt="${champ.name}">
                    </div>
                    <div class="champion-info">
                        <div class="champion-name">${champ.name}</div>
                        <div class="champion-level">레벨 ${data.championLevel}</div>
                        <div class="champion-points">점수: ${data.championPoints.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
        });

        // 현재 인덱스 갱신
        currentIndex += itemsPerPage;

        // 모든 데이터를 다 불러온 경우 '더 보기' 버튼 숨기기
        if (currentIndex >= championMasteryData.length) {
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "block";
        }
    }
```
- **비동기 처리**
  - `async/await` : 비동기 코드를 동기처럼 작성할 수 있게 해줌. 가독성과 유지보수가 쉬움
  - `Promise.all()` : 여러 비동기 작업을 동시에 실행하고, 모두 끝난 후 결과를 한 번에 받아옴 -> 반복적인 API 호출 시 성능 향상에 효과적
 

#### 주요 구현 코드 예시 - 챔피언 정렬 및 검색
``` java
     public List<ChampionMasteryDto> filterChampionMasteryBySearchTerm(List<ChampionMasteryDto> masteryList, String searchTerm) {
        // 검색이 없으면 return 실행
        if (searchTerm == null || searchTerm.isEmpty()) {
            return masteryList;
        }

        try {
            // 검색이 들어오면 searchTerm을 int로 변환 후 stream을으로 같은 champId 출력
            int searchId = Integer.parseInt(searchTerm);
            return masteryList.stream()
                    .filter(mastery -> mastery.getChampionId() == searchId)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            return masteryList;
        }
    }

```

``` java
    public ResponseEntity<CMRespDto<?>> searchChampionMasteryByPuuid(@RequestParam(required = false) String sortBy, @RequestParam(required = false) String order, @RequestParam(required = false) String search){
        List<ChampionMasteryDto> championMasteryList = recordService.searchChampionMasteryByPuuid(summonerDto.getPuuid(), sortBy, order, search);

        // 검색이 존재하면 해당 filterChampionMasteryBySearchTerm() 실행
        if (search != null && !search.isEmpty()) {
            championMasteryList = recordService.filterChampionMasteryBySearchTerm(championMasteryList, search);
        }

        if(sortBy != null){
            // Comparator 사용해 정렬 실행
            Comparator<ChampionMasteryDto> comparator = null;

            // level과 points에 맞춰서 실행
            switch (sortBy) {
                case "level":
                    comparator = Comparator.comparing(ChampionMasteryDto::getChampionLevel);
                    break;
                case "points":
                    comparator = Comparator.comparing(ChampionMasteryDto::getChampionPoints);
                    break;
            }

            // order의 값이 desc, asc인지 확인 후 맞게 정렬
            if(comparator != null){
                if(order.equals("desc")){
                    comparator = comparator.reversed();
                }
                championMasteryList.sort(comparator);
            }
        }
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", championMasteryList));
    }
```
- **챔피언 이름으로 하지 않은 이유**
  - 챔피언 정보에서 챔피언의 이름을 저장하지 않고 ChampId로 저장, 이름은 JSON 형태로 CDN에 있음
  - JS에서 CDN의 값 중 검색한 이름의 챔피언을 찾아 해당 ChampId를 java로 전송


#### 주요 구현 코드 예시 - CDN에서 챔피언 정보 가져오기
``` javascript
        // ChampName으로 챔피언 ID 검색
        async getChampionIdByName(champName) {
            const response = await fetch(`${window.BASE_URL}/data/ko_KR/champion.json`);
            const data = await response.json();
            const champions = data.data;
    
            for (const champKey in champions) {
                if (champions[champKey].name.toLowerCase() === champName.toLowerCase()) {
                    return champions[champKey].key; // 챔피언 이름에 맞는 ID 저장
                }
            }

        return null; // 챔피언 이름이 일치하지 않으면 null 반환
    }

        // ChampId로 챔피언 정보 가져오기
        async getChampionNameById(championId) {
            const response = await fetch(`${window.BASE_URL}/data/ko_KR/champion.json`);
            const data = await response.json();
            const champions = data.data;
    
            for (const champName in champions) {
                if (champions[champName].key === String(championId)) {
                    return champions[champName]; // 챔피언 정보 반
                }
            }

        return null; // 챔피언 id 일치하지 않으면 null 반환
    }
```

#### 챔피언 숙련도 검색 및 UI 동작 시연

**챔피언 정렬**
https://github.com/user-attachments/assets/dc859b60-f5f8-46b0-bba0-271e77f7841a

**챔피언 검색**
https://github.com/user-attachments/assets/a74c4126-7e6d-4200-bf89-8ba6150b818c


</br>

### 유저 검색 자동완성 기능

- **목표**
  - 사용자가 이전에 검색한 소환사명을 저장해 자동완성 기능을 제공함으로써, 반복 입력의 불편을 줄이고 사용자 경험(UX)을 개선하는 것을 목표.
  - 실제 사용자 데이터를 기반으로 검색 기능을 점진적으로 고도화할 수 있는 구조를 설계

- **기술 스택**:  
  - **Java** – 백엔드 연동 및 데이터 처리  
  - **JavaScript** – 객체지향 방식으로 프론트엔드 로직 구현  
  - **Riot API** – 소환사 정보 조회를 위한 외부 API 연동
  - **HTML/CSS** – 검색 UI 및 자동완성 레이아웃 구성
  - **Git** – 버전 관리
  - **MongoDB** - 자동완성용 유저 데이터 저장 및 조회

- **프로젝트 개요** :  
  사용자가 소환사명을 검색할 때 자동완성 기능을 제공하며, 해당 검색 기록을 MongoDB에 저장함으로써 검색 시점 기준의 실사용 데이터를 누적할 수 있는 기능을 구현. 프론트엔드에서는 검색창 입력에 따라 추천 리스트가 동적으로 출력되며, 서버는 이를 위해 최근 검색된 유저 정보를 정렬하여 데이터 제공

- **기여 내용**:  
  - **자동완성 구현** : 입력값 기준으로 MongoDB에서 gameName이 일치하는 데이터를 검색하여 리스트 출력
  - **검색 기록 저장 기능 개발** : Riot API 호출 후 gameName + tagLine을 MongoDB에 저장
  - **UI 개선** : 자동완성 리스트를 검색창 하단에 자연스럽게 표시하고 클릭 선택 가능하도록 구현
  - **중복 방지 로직 구현** : 이미 존재하는 유저 정보가 있을 경우 lastSearchedAt만 업데이트되도록 처리

- **기술적 도전 및 해결** :  
  - **URL 인코딩 문제** : 사용자명이 `"Hide on bush#KR1"`과 같이 띄어쓰기 및 특수문자(#)를 포함할 경우 URL 인코딩 문제 발생 →  `JavaScript`에서 `#`을 `~`으로 변경하고, 서버 측에서 다시 `~`을 분리하여 처리함. 또한 `encodeURIComponent`로 인코딩을 명확히 함.
  - **중복 데이터 저장** : MongoDB에 중복된 gameName + tagLine 조합이 계속 저장됨 → `db.userInfo.createIndex({ gameName: 1, tagLine: 1 }, { unique: true })`를 통해 복합 유니크 인덱스를 생성하고, Java에서는 `Optional<UserInfo>`로 존재 여부를 확인 후 저장하도록 수정

- **결과** :
  - 최근 검색된 10개 소환사명을 자동완성 형태로 출력 가능
  - 사용자 입력 기반으로 MongoDB에 점진적으로 데이터 축적
  - Riot API와의 연동을 안정적으로 처리하며 사용자 경험을 향상시킴

#### 주요 구현코드 예시 - 유저 DB 저장
``` java
    // 사용자가 입력한 gameName과 tagLine으로 자동완성용 유저 정보를 MongoDB에 저장 또는 업데이트하는 메서드
    public void saveOrUpdateAutoCompleteUser(String gameName, String tagLine){
        // 이미 해당 gameName + tagLine 조합이 MongoDB에 저장되어 있는지 확인
        Optional<UserInfo> searchUsers = riotInfoRepository.findUserByGameNameAndTagLine(gameName, tagLine);

        // DB에 존재하지 않는 경우 (신규 유저)
        if (searchUsers.isEmpty()) {
            AccountDto dto = this.searchSummonerInfoByGameNameAndTagLine(gameName.replaceAll(" ", "%20"), tagLine.replaceAll(" ", "%20"));

            // API에서 유저 정보가 정상적으로 응답되었을 경우에만 저장
            if (dto != null) {
                UserInfo user = new UserInfo();
                user.setGameName(gameName);
                user.setTagLine(tagLine);
                user.setPuuid(dto.getPuuid());
                user.setLastSearchedAt(System.currentTimeMillis());
                riotInfoRepository.save(user);
            } else {
                // API에서 정보를 가져오지 못했을 경우 로그 출력
                System.out.println("유저 정보 없음");
            }

        } else {
            // 이미 존재하는 유저일 경우
            UserInfo user = searchUsers.get();

            // Riot API로부터 최신 puuid 정보 받아서 갱신 (예: 닉네임 변경으로 인한 정보 일치 여부)
            AccountDto dto = this.searchSummonerInfoByGameNameAndTagLine(gameName.replaceAll(" ", "%20"), tagLine.replaceAll(" ", "%20"));
            if (dto != null){
                user.setPuuid(dto.getPuuid());
            }
            user.setLastSearchedAt(System.currentTimeMillis());
            riotInfoRepository.save(user);
        }
    }
```

</br>

#### 자동검색 시연
![palygame3](https://github.com/user-attachments/assets/ded8702c-fe80-43f9-ab5f-6e54d7da6319)


