

const qnaList = [
  {
    q: '당신이 가장 플레이 하고 싶은 라인은?',
    i: '<img src="/static/images/lolbti/1.png" width=750px height=500px></img>',
    a: [
      { answer: ' 때로는 든든하게... 때로는 화끈하게! 라인전은 고독한 싸움이다.. 내가 무너지면 팀도 진다', type: [0] },
      { answer: ' 사람들과 하는 라인전보다 이곳 저곳 누비며 영향력을 끼치고 싶다...어차피 강타 싸움 지면 팀 잘못이니까...', type: [0,0] },
      { answer: ' 사람의 핵심은 허리! 협곡의 중심은 미드!  라인전은 라인전대로 즐기고 영향력도 끼치고 시다.', type: [0,0,0] },
      { answer: ' 요리 피하고 조리 피하고! 활잡이들의 로망 카이팅...! 핵심 스킬들 흘려주면서 쉴틈 없이 화살을 퍼붓는다...!', type: [0,0,0,0] },
      { answer: ' 도구론은 옛말! 시야 장악,이니시,아군보호,아군강화 모두 가능한 만능 서포터!', type: [0,0,0,0,0] }
    ]
  },
  {
    q: '당신의 취향은?',
    i: '<img src="/static/images/lolbti/2.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 상대 스킬 피하면서 안맞고 때리는게 재미있지!', type: [1,1] },
      { answer: ' 무슨 소리! 싸움은 서로 부딫치며 하는 거다!', type: [1] }
     
    ]
  },
  {
    q: 'RPG를 막 시작한 당신! <br><br><br>가장 선호하는 직업은?',
    i: '<img src="/static/images/lolbti/3.png"  width=750px height=500px></img>',
    a: [
      { answer: '모두를 치유하겠어요! 팀원들의 회복과 강화를 담당하는 사제', type: [2] },
      { answer: '내 뒤로 숨으라고! 팀원들에게 오는 공격을 자신에게 돌리고 버티는 전사', type: [2,2] },
      { answer: '넓은 범위의 광역 공격이나 한명에게 막대한 데미지를 주는 마법사', type: [2,2,2] },
      { answer: '보이지 않는 곳에서 뒤로 급습하여 적을 처치하는 암살자', type: [2,2,2,2] }
    ]
  },
  {
    q: ' 픽창에서 팀원 하나가 원하지 않은 라인에 걸린듯 하다... <br><br><br>갑자기 나에게 바꿔달라고 하는데...? 당신의 선택은?',
    i: '<img src="/static/images/lolbti/4.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 무의미한 싸움은 하지 않는다... 그냥 내가 닷지한다.', type: [2] },
      { answer: ' 정말 잘하는 놈인지 확인해 봐야겠는걸? 닉네임을 검색해보고 진짜 잘하면 바꿔준다', type: [2,2] },
      { answer: ' 그래 저렇게 바꿔달라고 하는거 보면 진짜 잘하는 놈일거다... 내가 양보한다', type: [2,2,2] },
      { answer: ' 아니?!? 라인 꼬인 애가 닷지를 해야지 절대 양보 못해...! 오히려 상대방의 닷지를 유도한다', type: [2,2,2,2] }
    ]
  },
  {
    q: ' 라인전 도중 상대 정글이 와서 다이브 위험에 처했다... <br><br><br>당신의 선택은?',
    i: '<img src="/static/images/lolbti/5.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 아... 난 무조건 죽은거 같다... 나중을 생각해 최대한 아끼면서 죽음을 받아들인다', type: [2] },
      { answer: ' 이렇게 아무것도 안하고 죽으면 한 소리 들을 거 같은데...? 분위기 조성을 위해 도움 핑을 마구 찍는다', type: [2,2] },
      { answer: ' 우리 팀 보니 내가 캐리해야만 한다... 슈퍼플레이와 트롤은 한끗차... 모든 걸 투자하여 싸움에 임한다', type: [2,2,2] },
      { answer: ' 와 이걸 안 온다고...? 죽는건 난 모르겠고 정글에게 키보드 배틀을 신청하며 무수한 핑을 찍는다', type: [2,2,2,2] }
    ]
  },
  {
    q: ' 드디어 새로운 챔피언의 등장...!<br><br><br> 당신의 선택은?',
    i: '<img src="/static/images/lolbti/6.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 난 이제 새로운 챔피언 나오면 귀찮아... 유튜브에 누군가 정리해주면 그 때 해봐야지', type: [2] },
      { answer: ' 그래도 새로운 챔피언 나왔으니 연습 모드에서 테스트나 해볼까? 아이템도 이것저것 사보고', type: [2,2] },
      { answer: ' 랭크를 돌리기는 좀 그렇고...? 분석에서 라인도 대충 정해졌으니 일반게임에서 해볼까', type: [2,2,2] },
      { answer: ' 와 이걸 바로 안써봐? 새로 나오면 무조건 OP야 랭크 게임 박살 내러 간다!', type: [2,2,2,2] }
    ]
  },

  {
    q: ' 나를 죽인 상대방.... 근데 채팅으로 시비를 걸어오는데...?<br><br><br> 당신의 반응은?',
    i: '<img src="/static/images/lolbti/7.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 아 저거 왜 저래....? 죽은 건 어쩔 수 없으니 상대방 차단 후에 다시 게임이 집중한다', type: [2] },
      { answer: ' 이거이거 우리팀에서 내가 범인으로 몰리겠는걸? 아예 다 차단해버리자.. 팀을 포함한 모두 차단 한 후 게임한다', type: [2,2] },
      { answer: ' 아 한번 잡았다고 채팅 치는거 열받네...? 바로 키보드 전쟁 선포한다', type: [2,2,2] },
      { answer: ' 우리 정글은 뭐하냐...? 한번 와 줬으면 유리하게 이끌어가는건데? 우리 팀 정글한테 키보드 전쟁을 선포한다', type: [2,2,2,2] }
    ]
  },
  {
    q: ' 당신이 라인전을 하다가 상대방에게 한 대 맞았다...! <br><br><br>당신의 반응은?',
    i: '<img src="/static/images/lolbti/8.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 아 이건 안 맞었어야 하는데.... 내가 실수 했다... 하며 다시 게임에 차분하게 집중한다', type: [2] },
      { answer: ' 넌 있다가 보자... 있다가 무조건 잡고 복수한다. 우리팀 정글에게 도움을 요청한다', type: [2,2] },
      { answer: ' 어...? 내가 손해 보는건 모르겠고 나 한대 맞았으니 너도 무조건 한대 맞아야만 해! 똑같이 때리고 라인전 이어간다', type: [2,2,2] },
      { answer: ' 너가 먼저 친거다...? 열받네..? 바로 모든 걸 건 한판 승부를 신청한다', type: [2,2,2,2] }
    ]
  },
  {
    q: ' 긴장되는 4용 타이밍 용 둥지 앞 한타 상황... <br><br><br> 당신이 이니시를 담당해야만 하는데...? <br><br><br>당신의 선택은?',
    i: '<img src="/static/images/lolbti/9.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 긴장감에 손을 떨고 이마에는 식은땀이 한방울... 긴장되어 우물쭈물하다 팀원들의 핑에 할 수 없이 들어간다!', type: [2] },
      { answer: ' 자 열기 전에 채팅으로 긴장감을 풀어보자. 각각의 역할을 설명해주고 핑을 찍고 들어간다', type: [2,2] },
      { answer: ' 나 이 장면 봤어. 롤드컵에서 봤어. 내가 안보는 시야로 돌아갈게 기다려.<br> 슈퍼플레이에 심취하여 상대방의 시야 밖에서 움직인다', type: [2,2,2] },
      { answer: ' 자 내가 길을 열테니 들어와라. 소통 없이 각 보이면 바로 들이 받아 버린다!', type: [2,2,2,2] }
    ]
  },
  {
    q: ' 일단 한타 대승...!<br><br> 이대로 가면 경기를 끝낼 수 있을 거 같은데...? <br><br><br>갑자기 팀원들이 바론으로 향한다면? 당신의 선택은?',
    i: '<img src="/static/images/lolbti/10.png"  width=750px height=500px></img>',
    a: [
      { answer: ' 이게 맞는거 아닌가...? 중간 그 애매한 어딘가에서 갈팡질팡 하다가 시간 낭비해버리고 귀환한다', type: [2] },
      { answer: ' 혼자 무리하다가 짤리면 범인으로 몰린다... 그냥 바론 같이 잡고 다음에 끝내면 되지 뭐.. 같이 바론을 잡으러 간다', type: [2,2] },
      { answer: ' 바론은 너네끼리도 먹을 수 있잖아..? 나는 좀 더 이득이라도 봐야겠어.. 우직하게 타워를 친다', type: [2,2,2] },
      { answer: ' 와 얘내 게임 볼 줄 모르네...? 이걸 안와? 끝나는데? 게임 볼 줄도 모르는데 어떻게 여기 있냐며 딜을 퍼 붓는다', type: [2,2,2,2] }
    ]
  }
]

const infoList = [
  { name: '당신은 착취형 탑 탱커 입니다!',
  img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Skarner_0.jpg" ></img>',
  img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Malphite_0.jpg" ></img>',
  img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/DrMundo_0.jpg"></img>',
  img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Shen_0.jpg" ></img>',
    
 
    desc: '당신에게는 든든하게 상대의 공격을 버티며 팀 선두에 앞장 서는 챔피언이 어울립니다<br><br> 초반에 조금 아플 수 있으나 시간이 지나면 지날수록 강력해지는 챔피언들입니다<br><br> 초반에 강한 챔피언들을 조심하세요...!'
  },
  {
    name: ' 당신은 정복자형 탑 전사 입니다! ',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Darius_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sett_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Renekton_0.jpg" ></img>',
   
    desc: '당신에게는 끊임없이 회복하며 전투를 이어가는 챔피언이 어울립니다<br><br>끈질기게 살면서 전장에 남아 영향력을 끼치는 챔피언들입니다<br><br> 초반에는 회복량이 크지 않으니 이에 주의하세요...!'
    },
  {
   
    name: '당신은 감전형 탑 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Mordekaiser_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Gragas_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Rumble_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Gwen_0.jpg" ></img>',
    desc: '당신에게는 한 번에 큰 데미지를 넣는 근접 마법사 챔피언이 어울립니다<br><br>전장에서 상대에게 폭발적인 데미지를 넣어 이탈시킬 수 있는 챔피언들입니다<br><br> 아이템이 갖춰지기 전까지 약할 수 있으니 천천히 플레이해보세요...!'
  },
  {
    name: '당신은 유성형 탑 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Teemo_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Kennen_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Vladimir_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Heimerdinger_0.jpg" ></img>',
   
    desc: '당신에게는 조금씩 상대방의 피를 깎아 유리한 상황을 만드는 챔피언이 어울립니다<br><br> 천천히 이득을 불려가면서 유리하게 라인전을 이끌어 나갈 수 있는 챔피언들입니다<br><br> 한 번 죽는게 치명적일 수 있으니 상대 정글의 위치를 수시로 파악하세요...!'
  },
  {
    name: '당신은 집중공격형 탑 원거리 딜러 입니다! ',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Kayle_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Vayne_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Akshan_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Quinn_0.jpg" ></img>',
   
   
    desc: '당신에게는 상대방의 스킬을 피하며 공격하는 챔피언이 어울립니다<br><br> 한대 한대 아프게 때릴 수 있는 대신 받는 데미지도 치명적인 챔피언들입니다<br><br> 한 대 더 때리기 보단 한 대 덜 맞는게 중요합니다...!'
  },
  {
    name: '당신은 여진형 정글 탱커 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sejuani_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Rammus_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Zac_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Poppy_0.jpg" ></img>',
    
 
    desc: '당신에게는 상대방의 공격을 버티며 영향력을 끼치는 챔피언이 어울립니다<br><br>안정적인 탱킹으로 팀에 밸런스를 가져다 주는 챔피언들입니다<br><br>초반에 상대 정글이 많이 괴롭힐 수 있으니 멘탈 잡고 플레이 하는게 중요합니다...!'
  },
  {
    name: '당신은 정복자형 정글 전사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Viego_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/LeeSin_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/JarvanIV_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Vi_0.jpg" ></img>',
    
    desc: '당신에게는 꾸준한 회복력과 준수한 공격력으로 상대를 제압하는 챔피언이 어울립니다<br><br> 때로는 상대방의 공격을 흡수하기도 하고 때로는 상대방을 제압하기도 하는 만능 챔피언들입니다<br><br>탱커처럼 단단하진 않으니 너무 막 맞지 마세요...!'
  },
  {
    name: '당신은 포식자형 정글 암살자 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Khazix_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Rengar_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Shaco_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Nocturne_0.jpg" ></img>',
    
    desc: '당신에게는 상대방이 눈치 채지 못하게 암살하는 챔피언이 어울립니다<br><br> 강력한 단일 공격으로 상대방을 한번에 제압하는 챔피언들입니다<br><br> 처음부터 진입하지 말고 팀원들이 기회를 만들어 줄때 까지 기다려보세요...!'
  },
  {
    name: '당신은 치명적 속도형 정글 원거리 딜러 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Kindred_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/MasterYi_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Kayn_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Belveth_0.jpg" ></img>',
    
    desc: '당신에게는 초반에는 약하지만 후반에 막대한 캐리력을 갖는 챔피언이 어울립니다<br><br> 말리지 않고 꾸준히 성장하면 후반에 막대한 힘을 보여주는 챔피언들입니다<br><br> 초반에 활약하기 어려우므로 성장에 중점을 두고 활약해보세요...!'
  },
  {
   
    name: '당신은 어둠의 수확형 정글 원거리 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Nidalee_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Taliyah_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Elise_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Karthus_0.jpg" ></img>',
    desc: '당신에게는 원거리에서 마법을 사용하여 적을 공격하여 큰 데미지를 주는 챔피언이 어울립니다 <br><br> 평타 보다는 큰 스킬 데미지를 가진 챔피언들입니다<br><br> 스킬이 빗나가면 데미지가 줄어들기 때문에 신중하게 사용하세요...! '
  },
  {
    name: '당신은 난입형 미드 근거리 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Fizz_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Kassadin_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ekko_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sylas_0.jpg" ></img>',

    desc: '당신에게는 순식간에 거리를 좁혀 큰 마법데미지를 주는 챔피언이 어울립니다<br><br> 원거리가 많은 미드 라인 특성상 초반 견제에는 힘들지만 후반에는 강력한 데미지를 가진 챔피언들입니다<br><br> 초반에는 cs를 포기하더라도 피관리에 집중해보세요...! '
  },
  {
    
    name: '당신은 기민한 발놀림형 미드 근거리 전사입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Yasuo_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Yone_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Irelia_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Pantheon_0.jpg" ></img>',
    desc: '당신에게는 빠른 평타 속도를 활용해 적을 섬멸하는 챔피언이 어울립니다<br><br> 원거리가 많은 미드 라인 특성상 초반 견제에는 힘들지만 후반에 활약할 수 있는 챔피언들입니다<br><br> 초반에는 cs를 포기하더라도 피관리에 집중해보세요...! '
  },
  {
  
    name: '당신은 감전형 미드 근거리 암살자 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Talon_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Zed_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Katarina_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Akali_0.jpg" ></img>',
    desc: '당신에게는 빠른 속도로 접근하여 적을 순식간에 처리하는 챔피언이 어울립니다<br><br> 대채로 방어력이 높지 않은 상대들이 많을수록 활약하기 쉬운 챔피언들입니다<br><br> 상대편에 탱커가 없다면 활약할 수 있는 환경이 잘 만들어집니다...!'
  },
  {
    name: '당신은 유성형 미드 원거리 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Hwei_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Azir_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Vex_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ahri_0.jpg" ></img>',
    
  
    desc: '당신에게는 먼 거리에서 상대방에게 견제를 할 수 있는 챔피언이 어울립니다<br><br> 긴 사거리에서 날리는 스킬들로 대치 상황에서 활약할 수 있는 챔피언들입니다<br><br> 대치 상황에서 상대방에게 더 많은 스킬을 맞추도록 신중하게 사용해보세요...!'
    },
  {
    name: '당신은 선제공격형 미드 원거리 딜러 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Corki_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Jayce_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Tristana_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Akshan_0.jpg" ></img>',
 
    desc: '당신에게는 팀에 모자란 AD 데미지를 충족시켜 줄 수 있는 챔피언이 어울립니다<br><br> 빠른 공격속도나 큰 AD 데미지를 상대방에게 주어 팀의 밸런스를 맞춰주는 챔피언들입니다<br><br> 팀에 AD 데미지가 부족하다면 충분히 고려해볼 수 있습니다...!'
   },
  {
    name: '당신은 치명적 속도형 원딜 평타 딜러 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aphelios_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Caitlyn_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Jinx_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sivir_0.jpg" ></img>',
 
   
    desc: '당신에게는 높은 공격속도와 치명타 확률을 활용하는 챔피언이 어울립니다<br><br> 빠른 공격속도와 치명타 확률로 후반으로 갈 수록 엄청난 데미지를 뽐내는 챔피언들입니다<br><br> 초반에는 공격속도와 치명타 확률이 낮아 엄청난 딜을 기대하긴 어렵습니다...!'
  },
  {
    name: '당신은 유성형 원딜 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ziggs_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Veigar_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Swain_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Cassiopeia_0.jpg" ></img>',
   
    desc: '당신에게는 혼자서는 성장하기 어렵지만 서포터와 함께 하면 더욱 강력해지는 챔피언이 어울립니다<br><br> 서포터의 도움으로 힘든 초반을 넘기면 후반으로 갈 수록 강력해지는 챔피언들입니다<br><br> 계속 강조하듯 초반이 어렵기 때문에 싸움을 피하면서 성장하세요....!'
    },
  {
  
    name: '당신은 선제공격형 원딜 스킬 딜러 입니다!',
  
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Lucian_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/MissFortune_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ezreal_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Smolder_0.jpg" ></img>',
 
   
    desc: '당신에게는 평타 딜보다는 스킬 딜이 강력하여 적응하기 쉬운 챔피언이 어울립니다<br><br> 스킬 데미지가 높고 대부분 좋은 이동기를 가지고 있어 한타 때 포지셔닝도 쉬운 챔피언들입니다<br><br> 이동기를 남발하면 상대방에게 표적이 될 수 있으니 조심하세요...!'
    },
  {
    name: '당신은 수호자형 서포터 근거리 탱커 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Rell_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Braum_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Leona_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Alistar_0.jpg" ></img>',
 
    desc: '당신에게는 아군을 수호하는데 중점을 둔 챔피언이 어울립니다<br><br> 강력한 CC기로 상대방을 공략하거나 아군 딜러를 달려드는 적으로 부터 보호할 수 있는 챔피언들입니다<br><br> 상황에 따라 아군이 딜을 하기 쉽게 만들어보세요...!'  },
  {
    
    name: '당신은 빙결강화형 서포터 근거리 그랩류 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Pyke_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Blitzcrank_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Thresh_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Nautilus_0.jpg" ></img>',
   
    desc: '당신에게는 상대방을 제압할 수 있는 강력한 스킬을 가진 챔피언이 어울립니다<br><br> 먼 거리에서도 상대방을 순식간에 제압할 수 있게 만드는 챔피언들입니다<br><br> 그랩 한번 빠지면 치명적이므로 신중하게 사용해보세요...!'  },
  {
    name: '당신은 콩콩이형 서포터 원거리 힐러입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Nami_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Soraka_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Lulu_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sona_0.jpg" ></img>',
 
    desc: '당신에게는 아군을 치유하고 강력한 부가 효과를 부여하는 챔피언이 어울립니다<br><br> 아군을 회복하고 강화하는 다양한 챔피언들입니다<br><br> 회복을 담당하는 만큼 상대방으로부터 최우선순위로 정해질 수 있으므로 조심하세요...!'  },
  {
    name: '당신은 칼날비형 서포터 원거리 평타 딜러입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Senna_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ashe_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Caitlyn_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Varus_0.jpg" ></img>',

    desc: '당신에게는 빠른 공격속도를 바탕으로 라인전을 강하게 이끌어가는 챔피언이 어울립니다<br><br> 아군 원딜과 함께 평타로 유리하게 라인전을 이끌어가는 챔피언들입니다.<br><br> 피 관리가 안되면 상대 정글의 먹잇감이 되므로 조심하세요...!' } ,
   {
    name: '당신은 유성형 서포터 원거리 마법사 입니다!',
    img0:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Zyra_0.jpg" ></img>',
    img1:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Xerath_0.jpg" ></img>',
    img2:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Brand_0.jpg"></img>',
    img3:'<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Lux_0.jpg" ></img>',

    
    desc: '당신에게는 강력한 스킬딜과 긴 사거리를 통해 상대의 체력을 깎으면서 라인전을 이끌어가는 챔피언이 어울립니다<br><br><<br> 보다 우월한 사거리로 견제가 가능하며, 데미지 또한 수준급으로 나오는 챔피언들입니다<br> 견제 하다보면 자연스럽게 라인이 밀리는데 상대 정글의 갱을 조심하세요...!' }
]
