
const main = document.querySelector("#main");
const qna = document.querySelector("#qna");
const result = document.querySelector("#result");
const btn = document.querySelector(".btn btn-outline-danger mt-3");


const endPoint = 10;
const select = [0, 0, 0];


function calResult(){
  var result="";
result+=select[0];
result+="-";
result+=select[1];
result+="-";
result+=select[2];

  return result;
}

function setResult(){
  let point = calResult().split("-");
  let line=point[0];
  let concept=point[1];
  let aggresive=point[2];
  let num;
if(line==1)
{
 if(concept==1)
 {
   if(aggresive<=16)
   {
    num=0;
   }
   else if(aggresive<=24&&aggresive>16)
   {
    num=1;
   }
   else
   {
    num=2;
   }
 }
 else if(concept==2)
 {
  if(aggresive<=20)
  {
   num=3;
  }
  else if(aggresive>20)
  {
   num=4;
  }
 }
}
else if(line==2)
{
  if(concept==1)
  {
    if(aggresive<=16)
    {
     num=5;
    }
    else if(aggresive<=24&&aggresive>16)
    {
     num=6;
    }
    else
    {
     num=7;
    }
  }
  else if(concept==2)
  {
   if(aggresive<=20)
   {
    num=8;
   }
   else if(aggresive>20)
   {
    num=9;
   }
  }
}
else if(line==3)
{
  if(concept==1)
 {
   if(aggresive<=16)
   {
    num=10;
   }
   else if(aggresive<=24&&aggresive>16)
   {
    num=11;
   }
   else
   {
    num=12;
   }
 }
 else if(concept==2)
 {
  if(aggresive<=20)
  {
   num=13;
  }
  else if(aggresive>20)
  {
   num=14;
  }
 }
}
else if(line==4)
{
  if(aggresive<=16)
  {
   num=15;
  }
  else if(aggresive>16&&aggresive<=24)
  {
   num=16;
  }
  else
  {
    num=17;
  }
}
else if(line==5)
{
  if(concept==1)
 {
   if(aggresive<=20)
   {
    num=18;
   }
   else if(aggresive>20)
   {
    num=19;
   }
   
 }
 else if(concept==2)
 {
  if(aggresive<=16)
  {
   num=20;
  }
  else if(aggresive>16&&aggresive<=24)
  {
   num=21;
  }
  else
  {
    num=22;
  }
 }
}



  const resultName = document.querySelector('.resultname');
  resultName.innerHTML = infoList[num].name;

  //var resultImg = document.createElement('img');
  const imgDiv = document.getElementById('resultImg');
 
  imgDiv.innerHTML=infoList[num].img0;
  imgDiv.innerHTML+=infoList[num].img1;
  imgDiv.innerHTML+=infoList[num].img2;
  imgDiv.innerHTML+=infoList[num].img3;


  const resultDesc = document.querySelector('.resultDesc');
  resultDesc.innerHTML = infoList[num].desc;
}

function goResult(){
  qna.style.WebkitAnimation = "fadeOut 1s";
  qna.style.animation = "fadeOut 1s";
  setTimeout(() => {
    result.style.WebkitAnimation = "fadeIn 1s";
    result.style.animation = "fadeIn 1s";
    setTimeout(() => {
      qna.style.display = "none";
      result.style.display = "block"
    }, 450)})
    setResult();
}

function addAnswer(answerText, qIdx, idx){
  var a = document.querySelector('.answerBox');
  var answer = document.createElement('button');
  answer.classList.add('answerList');
  answer.classList.add('my-3');
  answer.classList.add('py-3');
  answer.classList.add('mx-auto');
  answer.classList.add('fadeIn');

  a.appendChild(answer);
  answer.innerHTML = answerText;

  answer.addEventListener("click", function(){
    var children = document.querySelectorAll('.answerList');
    for(let i = 0; i < children.length; i++){
      children[i].disabled = true;
      children[i].style.WebkitAnimation = "fadeOut 0.5s";
      children[i].style.animation = "fadeOut 0.5s";
    }
    setTimeout(() => {
      var target = qnaList[qIdx].a[idx].type;
      for(let i = 0; i < target.length; i++){
        select[target[i]] += 1;
      }

      for(let i = 0; i < children.length; i++){
        children[i].style.display = 'none';
      }
      goNext(++qIdx);
    },450)
  }, false);
}

function goNext(qIdx){
  if(qIdx === endPoint){
    goResult();
    return;
  }

  var q = document.querySelector('.qBox');
  q.innerHTML += '<br>';
  q.innerHTML += '<br>';
  q.innerHTML = qnaList[qIdx].q;
  q.innerHTML += '<br>';
  q.innerHTML += '<br>';
  q.innerHTML += '<br>';

  q.innerHTML+= qnaList[qIdx].i;
  for(let i in qnaList[qIdx].a){
    addAnswer(qnaList[qIdx].a[i].answer, qIdx, i);
  }
  var status = document.querySelector('.statusBar');
  status.style.width = (100/endPoint) * (qIdx+1) + '%';
}



function begin(){
  main.style.WebkitAnimation = "fadeOut 1s";
  main.style.animation = "fadeOut 1s";
  setTimeout(() => {
    qna.style.WebkitAnimation = "fadeIn 1s";
    qna.style.animation = "fadeIn 1s";
    setTimeout(() => {
      main.style.display = "none";
      qna.style.display = "block"
    }, 450)
    let qIdx = 0;
    goNext(qIdx);
  }, 450);
}
