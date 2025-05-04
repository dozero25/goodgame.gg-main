![p1](https://github.com/user-attachments/assets/fa2b9cd6-01c0-42b3-b236-3d78986dc6e6)

# 프로젝트 개요

프로젝트 목적 
- 프로젝트 종료 후 개인 학습 및 기능 추가
- 코드 개선 및 SQL 쿼리 개선으로 리팩토링 학습


# 프로젝트 코드 개선 및 기능 추가

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
``` JAVA

```
