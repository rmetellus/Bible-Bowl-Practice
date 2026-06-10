let selectedBookKey=null,selectedDifficulty=null,selectedMode=null,selectedStudyType='entire',selectedQuestions=[],selectedSetLabel='Entire Book';
let currentQuestions=[],currentIndex=0,score=0,triesLeft=0,missedQuestions=[],answered=false,timer=null,timeLeft=10,startTime=null,streak=0,bestStreak=0,selectedChoice=null;
let currentRoundMeta={}, tournamentMode=false, tournamentPoints=0, reviewQuestions=[];  let xp = Number(localStorage.getItem('bbpXP') || 0); let level = Number(localStorage.getItem('bbpLevel') || 1);

let screenHistory = [];

let bgMusic=null;
let audioStarted=false;

let selectedMusic =
  localStorage.getItem('bbpMusicTrack')
  || 'menu-theme.mp3';

const MUSIC_TRACKS = [
  'menu-theme.mp3',
  'Beje-Mwen-Se-Yon Wa-Damou.mp3',
  'Father-Can-You-Hear Me.mp3',
  'Gen-Yon-Jou-Kap-Vini.mp3',
  'Konfyem-nan-Dye.mp3',
  'Li-Konnen-m-la.mp3',
  'Sans-Jésus-mon-Ciel est-voilé.mp3'
];

let settings={
  music: localStorage.getItem('bbpMusic') !== 'false',
  quizMusic: localStorage.getItem('bbpQuizMusic') !== 'false',
  sound: localStorage.getItem('bbpSound') !== 'false',
  volume: Number(localStorage.getItem('bbpVolume') || 0.12)
};

const difficultySettings={veryEasy:{label:'Very Easy',tries:3,hints:true,exact:false,timer:false,multiple:true},easy:{label:'Easy',tries:3,hints:true,exact:false,timer:false,multiple:false},medium:{label:'Medium',tries:2,hints:false,exact:false,timer:false,multiple:false},hard:{label:'Hard',tries:1,hints:false,exact:true,timer:true,multiple:false}};

const ACHIEVEMENTS=[
  {id:'first_correct',name:'First Question Correct',desc:'Answer your first question correctly.'},
  {id:'streak_5',name:'Getting Warm',desc:'Get a 5-answer streak.'},
  {id:'streak_10',name:'Hot Streak',desc:'Get a 10-answer streak.'},
  {id:'streak_20',name:'Unstoppable',desc:'Get a 20-answer streak.'},

  {id:'level_5',name:'Rising Student',desc:'Reach Level 5.'},
  {id:'level_10',name:'Bible Scholar',desc:'Reach Level 10.'},
  {id:'level_20',name:'Elder Status',desc:'Reach Level 20.'},
  {id:'level_30',name:'Champion Rank',desc:'Reach Level 30.'},
  {id:'level_50',name:'Hall of Faith',desc:'Reach Level 50.'},

  {id:'perfect_round',name:'Perfect Round',desc:'Finish any round with 100%.'},
  {id:'perfect_5',name:'Perfectionist',desc:'Get 5 perfect rounds.'},
  {id:'hard_perfect',name:'Hard Mode Hero',desc:'Get a perfect round on Hard.'},

  {id:'answer_100',name:'100 Club',desc:'Answer 100 total questions.'},
  {id:'answer_500',name:'500 Club',desc:'Answer 500 total questions.'},
  {id:'answer_1000',name:'1000 Club',desc:'Answer 1,000 total questions.'},

  {id:'haggai_master',name:'Haggai Master',desc:'Score 100% on Haggai.'},
  {id:'acts_missionary',name:'Acts Missionary',desc:'Answer 100 Acts questions.'},
  {id:'isaiah_scholar',name:'Isaiah Scholar',desc:'Answer 250 Isaiah questions.'},
  {id:'proverbs_sage',name:'Proverbs Sage',desc:'Answer 150 Proverbs questions.'},
  {id:'samuel_kingdom',name:'Kingdom Historian',desc:'Answer 75 questions in 2 Samuel.'},

  {id:'tournament_player',name:'Tournament Player',desc:'Complete a tournament round.'},
  {id:'tournament_champion',name:'Tournament Champion',desc:'Score 80% or higher in Tournament Mode.'},

  {id:'champion',name:'Bible Bowl Champion',desc:'Complete at least one round in every book.'}
];

function $(id){return document.getElementById(id)}

function showScreen(id, addToHistory = true){

  const current =
    document.querySelector('.screen.active');

 if(current && addToHistory && current.id !== id){
  screenHistory.push(current.id);
}

  document
    .querySelectorAll('.screen')
    .forEach(s=>s.classList.remove('active'));

  $(id).classList.add('active');

  clearTimer();

  handleMusicForScreen(id);

}

function goBack(){

  if(screenHistory.length === 0){
    showScreen('mainMenu', false);
    return;
  }

  const previous =
    screenHistory.pop();

  showScreen(previous, false);

}

function init(){
  renderBookButtons();
  bestStreak=Number(localStorage.getItem('bbpBestStreak')||0);
  renderResumeNotice();
  renderLevelCard();
  initAudio();
}

function initAudio(){

  bgMusic = $('bgMusic');

  const musicSelect = $('musicSelect');

  if(musicSelect){
    musicSelect.value = selectedMusic;
  }

  if(bgMusic){
  const trackToPlay =
    selectedMusic === 'shuffle'
      ? getRandomMusicTrack()
      : selectedMusic;

  bgMusic.src = `audio/${trackToPlay}`;
  bgMusic.volume = settings.volume;

    updateLoopMode();
}

 if(bgMusic){

  bgMusic.addEventListener('ended',()=>{

    if(selectedMusic !== 'shuffle')
      return;

    const nextTrack =
      getRandomMusicTrack();

    bgMusic.src =
      `audio/${nextTrack}`;

    bgMusic.load();

    bgMusic.volume =
      settings.volume;

    bgMusic.play().catch(()=>{});

  });

}
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const volumeBox = $('volumeControlBox');
  const iosNote = $('iosVolumeNote');

  if(isIOS){
    if(volumeBox) volumeBox.style.display = "none";
    if(iosNote) iosNote.classList.remove("hidden");
  }

  updateSettingsButtons();

  const volumeSlider = $('volumeSlider');

  if(volumeSlider){

    volumeSlider.value = Math.round(settings.volume * 100);

    volumeSlider.addEventListener('input',()=>{

      settings.volume = Number(volumeSlider.value)/100;

      localStorage.setItem(
        'bbpVolume',
        settings.volume
      );

      if(bgMusic){
        bgMusic.volume = settings.volume;
      }

    });

  }

  document.addEventListener('click',()=>{

    if(!audioStarted){

      audioStarted = true;

      handleMusicForScreen(
        getActiveScreenId()
      );

    }

  },{once:true});

}

function updateSettingsButtons(){

  const musicBtn = $('musicToggleBtn');
  const soundBtn = $('soundToggleBtn');
  const quizBtn = $('quizMusicToggleBtn');

  if(musicBtn){
    musicBtn.textContent =
      settings.music
      ? '🎵 Music: ON'
      : '🎵 Music: OFF';
  }

  if(soundBtn){
    soundBtn.textContent =
      settings.sound
      ? '🔊 Sound FX: ON'
      : '🔇 Sound FX: OFF';
  }

  if(quizBtn){
    quizBtn.textContent =
      settings.quizMusic
      ? '🎮 Quiz Music: ON'
      : '🎮 Quiz Music: OFF';
  }

}

function toggleMusicSetting(){

  settings.music = !settings.music;

  localStorage.setItem(
    'bbpMusic',
    settings.music
  );

  updateSettingsButtons();

  handleMusicForScreen(
    getActiveScreenId()
  );

}

function updateLoopMode(){

  if(!bgMusic) return;

  bgMusic.loop =
    selectedMusic !== 'shuffle';

}

function toggleSoundSetting(){

  settings.sound = !settings.sound;

  localStorage.setItem(
    'bbpSound',
    settings.sound
  );

  updateSettingsButtons();

}

function toggleQuizMusicSetting(){

  settings.quizMusic = !settings.quizMusic;

  localStorage.setItem(
    'bbpQuizMusic',
    settings.quizMusic
  );

  updateSettingsButtons();

  handleMusicForScreen(
    getActiveScreenId()
  );

}

function changeMusicTrack(){

  const musicSelect = $('musicSelect');

  if(!musicSelect) return;

  selectedMusic = musicSelect.value;

  localStorage.setItem(
    'bbpMusicTrack',
    selectedMusic
  );

  updateLoopMode();

  if(bgMusic){

    const wasPlaying =
      !bgMusic.paused;

    const trackToPlay =
      selectedMusic === 'shuffle'
        ? getRandomMusicTrack()
        : selectedMusic;

    bgMusic.src =
      `audio/${trackToPlay}`;

    bgMusic.load();

    bgMusic.volume =
      settings.volume;

    if(
      wasPlaying &&
      settings.music
    ){
      bgMusic.play().catch(()=>{});
    }

  }

}

let lastTrack = '';

function getRandomMusicTrack(){

  let track;

  do{
    track = MUSIC_TRACKS[
      Math.floor(Math.random() * MUSIC_TRACKS.length)
    ];
  }while(
    MUSIC_TRACKS.length > 1 &&
    track === lastTrack
  );

  lastTrack = track;

  return track;

}

function getActiveScreenId(){
  const active=document.querySelector('.screen.active');
  return active?active.id:'mainMenu';
}

function handleMusicForScreen(screenId){
  if(!bgMusic || !audioStarted) return;

  const isQuizScreen=screenId==='gameScreen';
  const shouldPlay=settings.music && (!isQuizScreen || settings.quizMusic);

  if(shouldPlay){
    bgMusic.play().catch(()=>{});
  }else{
    bgMusic.pause();
  }
}

function showSettings(){
  showScreen('settingsScreen');
}

function playTone(freq,duration,type='sine',volume=0.22){
  if(!settings.sound) return;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext) return;

  const ctx=new AudioContext();
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();

  osc.type=type;
  osc.frequency.value=freq;
  gain.gain.value=volume;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+duration);
  osc.stop(ctx.currentTime+duration);
}

function playCorrectSound(){
  playTone(660,0.15,'sine',0.32);
  setTimeout(()=>playTone(880,0.20,'sine',0.28),120);
}

function playWrongSound(){
  playTone(180,0.25,'sawtooth',0.28);
}

function playAchievementSound(){
  playTone(523,0.12,'sine',0.08);
  setTimeout(()=>playTone(659,0.12,'sine',0.08),120);
  setTimeout(()=>playTone(784,0.18,'sine',0.08),240);
}

function playTickSound(){
  playTone(900,0.05,'square',0.04);
}

function renderResumeNotice(){   const saved=loadSavedRound();   const menu=$('mainMenu');   let old=$('resumeBtn');    if(old) old.remove();    if(saved&&saved.currentQuestions?.length){     const btn=document.createElement('button');     btn.id='resumeBtn';     btn.classList.add('resume-btn');     btn.textContent=`Continue ${saved.bookTitle} — ${saved.currentIndex+1}/${saved.currentQuestions.length}`;     btn.onclick=resumeRound;     menu.insertBefore(btn,menu.children[1]);   } }
function renderBookButtons(){const box=$('bookButtons');box.innerHTML='';Object.entries(BOOKS).forEach(([key,b])=>{const prog=getBookProgress(key);const btn=document.createElement('button');btn.innerHTML=`${b.title} (${b.questions.length})<br><small>${prog}</small>`;btn.onclick=()=>selectBook(key);box.appendChild(btn)})}
function getBookProgress(key){const stats=JSON.parse(localStorage.getItem('bbpStats')||'{}');const title=BOOKS[key].title;const s=stats[title];return s?`Best: ${s.best} | Accuracy: ${s.answered?Math.round(s.correct/s.answered*100):0}%`:'Not Started'}
function selectBook(key){selectedBookKey=key;const b=BOOKS[key];$('bookInfoTitle').textContent=b.title;$('bookInfoContent').innerHTML=`<h3>Summary</h3><p>${b.summary}</p><h3>Key Characters</h3><ul>${b.characters.map(x=>`<li>${x}</li>`).join('')}</ul><h3>Major Themes</h3><ol>${b.themes.map(x=>`<li>${x}</li>`).join('')}</ol><h3>Memory Verses</h3><p>${(b.memoryVerses||[]).map(v=>`<span class="pill">${v}</span>`).join('')}</p><p class="small">Questions loaded: ${b.questions.length}</p>`;showScreen('bookInfoScreen')}
function showStudyOptions(){const b=BOOKS[selectedBookKey];$('topicBtn').style.display=b.topics?'block':'none';showScreen('studyOptionsScreen')}
function chooseStudyType(type){selectedStudyType=type;const b=BOOKS[selectedBookKey];if(type==='entire'){selectedQuestions=[...b.questions];selectedSetLabel='Entire Book';showScreen('difficultyScreen');return}let html='';$('chapterTitle').textContent= type==='chapter'?'Choose Chapter': type==='range'?'Choose Chapter Range':'Choose Topic';if(type==='chapter'){html=`<label>Chapter</label><select id="chapterOne">${Array.from({length:b.chapters},(_,i)=>`<option value="${i+1}">${b.title} ${i+1}</option>`).join('')}</select>`}else if(type==='range'){html=`<label>Start Chapter</label><select id="chapterStart">${Array.from({length:b.chapters},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select><label>End Chapter</label><select id="chapterEnd">${Array.from({length:b.chapters},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select>`}else{html=`<label>Topic</label><select id="topicSelect">${Object.keys(b.topics||{}).map(t=>`<option value="${t}">${t}</option>`).join('')}</select>`}$('chapterInputs').innerHTML=html;showScreen('chapterScreen')}
function confirmStudySelection(){const b=BOOKS[selectedBookKey];if(selectedStudyType==='chapter'){const c=Number($('chapterOne').value);selectedQuestions=b.questions.filter(q=>q.chapter===c);selectedSetLabel=`Chapter ${c}`}else if(selectedStudyType==='range'){let s=Number($('chapterStart').value),e=Number($('chapterEnd').value);if(e<s)[s,e]=[e,s];selectedQuestions=b.questions.filter(q=>q.chapter>=s&&q.chapter<=e);selectedSetLabel=`Chapters ${s}-${e}`}else if(selectedStudyType==='topic'){const topic=$('topicSelect').value;const terms=b.topics[topic].map(x=>x.toLowerCase());selectedQuestions=b.questions.filter(q=>terms.some(t=>(q.question+' '+q.answer).toLowerCase().includes(t)));selectedSetLabel=`Topic: ${topic}`}showScreen('difficultyScreen')}
function selectDifficulty(d){selectedDifficulty=d;showScreen('modeScreen')}
function selectMode(m){selectedMode=m;const b=BOOKS[selectedBookKey]||{title:'Mixed'};$('readyBook').textContent=b.title;$('readySet').textContent=selectedSetLabel;$('readyDifficulty').textContent=difficultySettings[selectedDifficulty].label;$('readyMode').textContent=m==='random'?'Random':'Sequential';$('readyCount').textContent=selectedQuestions.length;showScreen('readyScreen')}
function startGame(custom=null){tournamentMode=false;currentQuestions=custom?[...custom]:[...selectedQuestions];if(!custom&&selectedMode==='random')shuffle(currentQuestions);currentIndex=0;score=0;tournamentPoints=0;missedQuestions=[];streak=0;startTime=Date.now();currentRoundMeta={bookKey:selectedBookKey,bookTitle:BOOKS[selectedBookKey]?.title||'Mixed',setLabel:selectedSetLabel,difficulty:selectedDifficulty,mode:selectedMode};saveRound();showScreen('gameScreen');loadQuestion()}

function updateStreakDisplay(){
  const el = $('streakText');

  if(!el) return;

  el.className = '';

  if(streak >= 20){
    el.textContent = `☄️ UNSTOPPABLE x${streak}`;
    el.classList.add('streak-unstoppable');
  }else if(streak >= 10){
    el.textContent = `🔥🔥 HOT STREAK x${streak}`;
    el.classList.add('streak-hot');
  }else if(streak >= 5){
    el.textContent = `🔥 STREAK x${streak}`;
    el.classList.add('streak-fire');
  }else{
    el.textContent = `Streak: ${streak}`;
    el.classList.add('streak-normal');
  }
}

function loadQuestion(){clearTimer();answered=false;selectedChoice=null;const s=difficultySettings[selectedDifficulty],q=currentQuestions[currentIndex];triesLeft=s.tries;$('questionProgress').textContent=`${currentIndex+1}/${currentQuestions.length}`;$('scoreText').textContent=tournamentMode?`Points: ${tournamentPoints}`:`Score: ${score}`;updateStreakDisplay();$('timerText').textContent=s.timer?'Time: 10':'';$('verseTag').textContent=q.verse;$('questionText').textContent=tournamentMode?`[${questionValue()} pts] ${q.question}`:q.question;$('triesText').textContent=`Tries Remaining: ${triesLeft}`;$('feedbackText').textContent='';$('feedbackText').className='';$('answerReveal').classList.add('hidden');$('submitBtn').classList.remove('hidden');$('nextBtn').classList.add('hidden');$('hintBtn').classList.toggle('hidden',!s.hints);$('answerInput').value='';$('answerInput').disabled=false;$('answerInput').style.display=s.multiple?'none':'block';$('multipleChoiceBox').classList.toggle('hidden',!s.multiple);if(s.multiple)renderChoices(q);else $('answerInput').focus();if(s.timer)startTimer();saveRound()}
function renderChoices(q){const box=$('multipleChoiceBox');let pool=(BOOKS[selectedBookKey]?.questions||Object.values(BOOKS).flatMap(b=>b.questions)).filter(x=>x.answer!==q.answer).map(x=>x.answer);shuffle(pool);const choices=[q.answer,...pool.slice(0,3)];shuffle(choices);box.innerHTML=choices.map(c=>`<button class="choice" onclick="chooseAnswer(this, ${JSON.stringify(c).replace(/"/g,'&quot;')})">${c}</button>`).join('')}
function chooseAnswer(btn,ans){selectedChoice=ans;document.querySelectorAll('.choice').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected')}
function submitAnswer(){if(answered)return;const s=difficultySettings[selectedDifficulty],q=currentQuestions[currentIndex];const ua=s.multiple?selectedChoice:$('answerInput').value.trim();if(!ua){$('feedbackText').textContent=s.multiple?'Choose an answer first.':'Type an answer first.';return}if(isCorrect(ua,q.answer)){playCorrectSound();score++; addXP(10); if(tournamentMode)tournamentPoints+=questionValue();streak++;bestStreak=Math.max(bestStreak,streak);localStorage.setItem('bbpBestStreak',bestStreak);unlock('first_correct');if(streak >= 5) unlock('streak_5'); if(streak >= 10) unlock('streak_10'); if(streak >= 20) unlock('streak_20');  if(streak===5 || streak===10 || streak===20){   playAchievementSound(); }$('feedbackText').textContent='✅ Correct!';$('feedbackText').className='correct';finishQuestion(true)}else{triesLeft--;streak=0;updateStreakDisplay();$('triesText').textContent=`Tries Remaining: ${triesLeft}`;if(triesLeft>0){$('feedbackText').textContent='❌ Not quite. Try again.';$('feedbackText').className='incorrect';playWrongSound()}else{$('feedbackText').textContent='❌ Incorrect.';$('feedbackText').className='incorrect';playWrongSound();missedQuestions.push(q);addToReviewBank(q);finishQuestion(false)}}}
function finishQuestion(){clearTimer();answered=true;const q=currentQuestions[currentIndex];$('answerInput').disabled=true;$('submitBtn').classList.add('hidden');$('hintBtn').classList.add('hidden');$('nextBtn').classList.remove('hidden');$('scoreText').textContent=tournamentMode?`Points: ${tournamentPoints}`:`Score: ${score}`;updateStreakDisplay();$('answerReveal').innerHTML=`<p><strong>Answer:</strong> ${q.answer}</p><p><strong>Verse:</strong> ${q.verse}</p>`;$('answerReveal').classList.remove('hidden');saveRound()}
function nextQuestion(){currentIndex++;currentIndex>=currentQuestions.length?showResults():loadQuestion()}
function showHint(){const q=currentQuestions[currentIndex];$('feedbackText').textContent=`Hint: ${q.hint||smartHint(q)}`;$('feedbackText').className=''}
function smartHint(q){const a=String(q.answer); if(a.length<=6)return `It is ${a.length} letters long.`; return `It starts with “${a[0]}” and has ${a.split(/\s+/).length} word(s).`}
function startTimer(){timeLeft=10;$('timerText').textContent=`Time: ${timeLeft}`;timer=setInterval(()=>{timeLeft--;$('timerText').textContent=`Time: ${timeLeft}`;if(timeLeft<=3&&timeLeft>0)playTickSound();if(timeLeft<=0){clearTimer();streak=0;missedQuestions.push(currentQuestions[currentIndex]);addToReviewBank(currentQuestions[currentIndex]);$('feedbackText').textContent='⏰ Time is up!';$('feedbackText').className='incorrect';playWrongSound();finishQuestion(false)}},1000)}
function clearTimer(){if(timer)clearInterval(timer);timer=null}
function showResults(){clearTimer();const total=currentQuestions.length,accuracy=total?Math.round(score/total*100):0,elapsed=Math.floor((Date.now()-startTime)/1000),min=Math.floor(elapsed/60),sec=elapsed%60;saveStats(total,score);updateAchievements(total,score,accuracy);clearSavedRound();let missed=missedQuestions.length?missedQuestions.map(q=>`<div class="answer-box"><p><strong>Question:</strong> ${q.question}</p><p><strong>Answer:</strong> ${q.answer}</p><p><strong>Verse:</strong> ${q.verse}</p></div>`).join(''):'<p>No missed questions. Great job!</p>';$('resultsContent').innerHTML=`<p><strong>Book:</strong> ${currentRoundMeta.bookTitle}</p><p><strong>Set:</strong> ${selectedSetLabel}</p><p><strong>Difficulty:</strong> ${difficultySettings[selectedDifficulty].label}</p><p><strong>Score:</strong> ${score}/${total}</p>${tournamentMode?`<p><strong>Tournament Points:</strong> ${tournamentPoints}</p>`:''}<p><strong>Accuracy:</strong> ${accuracy}%</p><p><strong>Time:</strong> ${min}m ${sec}s</p><p><strong>Best Streak:</strong> ${bestStreak}</p><h3>Missed Questions</h3>${missed}`;$('retryMissedBtn').classList.toggle('hidden',missedQuestions.length===0);showScreen('resultsScreen');renderResumeNotice()}
function retryMissed(){const missed=[...missedQuestions];selectedQuestions=missed;selectedSetLabel='Retry Missed Questions';startGame(missed)}
function restartSameSetup(){startGame()}
function confirmExit(){if(confirm('Exit this practice round? Your progress will be saved.')){saveRound();showScreen('mainMenu');renderResumeNotice()}}
function isCorrect(userAnswer, correctAnswer){

  const s = difficultySettings[selectedDifficulty];

  if(s.multiple){
    return userAnswer === correctAnswer;
  }

  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);

  if(!user || !correct) return false;

  if(s.exact){
    return user === correct;
  }

  if(user === correct) return true;

  if(
  selectedDifficulty === 'easy' &&
  partialPhraseMatch(user, correct)
){
  return true;
}

  const correctWords = getImportantWords(correct);
  const userWords = getImportantWords(user);

  const keywordScore = keywordMatchScore(
    userWords,
    correctWords
  );

  if(selectedDifficulty === 'easy'){

    if(keywordScore >= 0.45)
        return true;

}

  if(selectedDifficulty === 'medium'){

    if(keywordScore >= 0.65)
        return true;

}

  if(isListAnswer(correct)){
    const listScore = listMatchScore(user, correct);

    if(selectedDifficulty === 'easy'){
      return listScore >= 0.50;
    }

    if(selectedDifficulty === 'medium'){
      return listScore >= 0.70;
    }
  }

  const d = levenshtein(user, correct);
  const allowed = Math.max(2, Math.floor(correct.length * 0.25));

  return d <= allowed;

}

function normalize(t){

  return String(t)
    .toLowerCase()
    .replace(/&/g,'and')

    .replace(/\bfirst\b/g,'1st')
    .replace(/\bsecond\b/g,'2nd')
    .replace(/\bthird\b/g,'3rd')
    .replace(/\bfourth\b/g,'4th')
    .replace(/\bfifth\b/g,'5th')
    .replace(/\bsixth\b/g,'6th')
    .replace(/\bseventh\b/g,'7th')
    .replace(/\beighth\b/g,'8th')
    .replace(/\bninth\b/g,'9th')
    .replace(/\btenth\b/g,'10th')
    .replace(/\beleventh\b/g,'11th')
    .replace(/\btwelfth\b/g,'12th')

    .replace(/\bone\b/g,'1')
    .replace(/\btwo\b/g,'2')
    .replace(/\bthree\b/g,'3')
    .replace(/\bfour\b/g,'4')
    .replace(/\bfive\b/g,'5')
    .replace(/\bsix\b/g,'6')
    .replace(/\bseven\b/g,'7')
    .replace(/\beight\b/g,'8')
    .replace(/\bnine\b/g,'9')
    .replace(/\bten\b/g,'10')

    .replace(/\b1st day\b/g,'1st')
    .replace(/\b2nd year\b/g,'2nd')
    .replace(/\b3rd year\b/g,'3rd')

    .replace(/\bking\b/g,'')
    .replace(/\bthe\b/g,'')

    .replace(/[^a-z0-9\s,]/g,'')
    .replace(/\s+/g,' ')
    .trim();

}

function getImportantWords(text){

  const fillerWords = [
    'and','or','but','in','on','at','to','of','for','with',
    'a','an','as','is','it','was','were','be','by','from',
    'that','this','these','those','do','did','does','ye',
    'you','your','his','her','their','our','among'
  ];

  return text
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !fillerWords.includes(w));

}

function keywordMatchScore(userWords, correctWords){

  if(!correctWords.length) return 0;

  let matched = 0;

  correctWords.forEach(word => {
    if(userWords.includes(word)){
      matched++;
    }
  });

  return matched / correctWords.length;

}

function isListAnswer(text){
  return text.includes(',');
}

function listMatchScore(user, correct){

  const correctParts = correct
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

  if(!correctParts.length) return 0;

  let matched = 0;

  correctParts.forEach(part => {
    if(user.includes(part) || part.includes(user)){
      matched++;
    }
  });

  return matched / correctParts.length;

}

function partialPhraseMatch(user, correct){

  const userWords =
    getImportantWords(user);

  const correctWords =
    getImportantWords(correct);

  if(userWords.length < 3)
    return false;

  let matched = 0;

  userWords.forEach(word=>{

    if(correctWords.includes(word))
      matched++;

  });

  return matched / userWords.length >= 0.75;

}

function levenshtein(a,b){const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return dp[a.length][b.length]}
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function startTopMenu(){const box=$('topButtons');box.innerHTML='';Object.entries(BOOKS).forEach(([key,b])=>{const btn=document.createElement('button');btn.textContent=`${b.title} Top ${b.topQuestions.length}`;btn.onclick=()=>{selectedBookKey=key;selectedQuestions=[...b.topQuestions];selectedSetLabel=`Top ${b.topQuestions.length}`;showScreen('difficultyScreen')};box.appendChild(btn)});const grand=document.createElement('button');grand.textContent='Grand Championship 100';grand.onclick=()=>{selectedBookKey='acts';selectedQuestions=[];Object.values(BOOKS).forEach(b=>selectedQuestions.push(...b.topQuestions.slice(0,Math.ceil(100/Object.keys(BOOKS).length))));shuffle(selectedQuestions);selectedQuestions=selectedQuestions.slice(0,100);selectedSetLabel='Grand Championship 100';showScreen('difficultyScreen')};box.appendChild(grand);showScreen('topMenuScreen')}
function startMemoryMenu(){const box=$('memoryButtons');box.innerHTML='';Object.entries(BOOKS).forEach(([key,b])=>{const btn=document.createElement('button');btn.textContent=`${b.title} Memory Verses`;btn.onclick=()=>{selectedBookKey=key;let mem=b.memoryVerses||[];selectedQuestions=b.questions.filter(q=>mem.some(v=>q.verse.startsWith(v.split('-')[0])));if(!selectedQuestions.length)selectedQuestions=b.topQuestions.slice(0,20);selectedSetLabel='Memory Verse Mode';showScreen('difficultyScreen')};box.appendChild(btn)});showScreen('memoryMenuScreen')}
function saveStats(total,correct){const stats=JSON.parse(localStorage.getItem('bbpStats')||'{}');const key=currentRoundMeta.bookTitle||BOOKS[selectedBookKey]?.title||selectedBookKey;stats[key]=stats[key]||{played:0,answered:0,correct:0,best:0};stats[key].played++;stats[key].answered+=total;stats[key].correct+=correct;stats[key].best=Math.max(stats[key].best,correct);localStorage.setItem('bbpStats',JSON.stringify(stats))}
function renderStats(){

  const stats = JSON.parse(
    localStorage.getItem('bbpStats') || '{}'
  );

  let html = `
    <p><strong>Level:</strong> ${level}</p>
    <p><strong>Rank:</strong> ${getRank()}</p>
    <p><strong>XP:</strong> ${xp}</p>
    <p><strong>Best Streak:</strong> ${localStorage.getItem('bbpBestStreak') || 0}</p>
  `;

  if(!Object.keys(stats).length){

    html += '<p>No rounds played yet.</p>';

  }else{

    html += Object.entries(stats).map(([book,s]) => `
      <div class="answer-box">
        <p><strong>${book}</strong></p>
        <p>Rounds: ${s.played}</p>
        <p>Answered: ${s.answered}</p>
        <p>Accuracy: ${s.answered ? Math.round(s.correct / s.answered * 100) : 0}%</p>
        <p>Best Score: ${s.best}</p>
      </div>
    `).join('');

  }

  $('statsContent').innerHTML = html;

}
function resetStats(){

  if(confirm('Reset all saved stats and achievements?')){

    [
      'bbpStats',
      'bbpBestStreak',
      'bbpAchievements',
      'bbpReviewBank',
      'bbpSavedRound',
      'bbpPerfectRounds',
      'bbpXP',
      'bbpLevel'
    ].forEach(k => localStorage.removeItem(k));

    bestStreak = 0;
    xp = 0;
    level = 1;

    renderStats();
    renderResumeNotice();
    renderLevelCard();

  }

}
function saveRound(){if(!currentQuestions.length||answered&&currentIndex>=currentQuestions.length)return;localStorage.setItem('bbpSavedRound',JSON.stringify({selectedBookKey,selectedDifficulty,selectedMode,selectedSetLabel,currentQuestions,currentIndex,score,missedQuestions,streak,bestStreak,startTime,currentRoundMeta,tournamentMode,tournamentPoints,bookTitle:currentRoundMeta.bookTitle||BOOKS[selectedBookKey]?.title||'Mixed'}))}
function loadSavedRound(){try{return JSON.parse(localStorage.getItem('bbpSavedRound')||'null')}catch{return null}}
function clearSavedRound(){localStorage.removeItem('bbpSavedRound')}
function resumeRound(){const r=loadSavedRound();if(!r)return;selectedBookKey=r.selectedBookKey;selectedDifficulty=r.selectedDifficulty;selectedMode=r.selectedMode;selectedSetLabel=r.selectedSetLabel;currentQuestions=r.currentQuestions;currentIndex=r.currentIndex;score=r.score;missedQuestions=r.missedQuestions||[];streak=r.streak||0;bestStreak=r.bestStreak||bestStreak;startTime=r.startTime||Date.now();currentRoundMeta=r.currentRoundMeta||{};tournamentMode=!!r.tournamentMode;tournamentPoints=r.tournamentPoints||0;showScreen('gameScreen');loadQuestion()}
function addToReviewBank(q){let bank=JSON.parse(localStorage.getItem('bbpReviewBank')||'[]');const id=`${q.verse}|${q.question}`;const existing=bank.find(x=>x.id===id);if(existing){existing.missed++;existing.lastMissed=Date.now()}else bank.push({...q,id,missed:1,lastMissed:Date.now(),book:BOOKS[selectedBookKey]?.title||'Mixed'});bank=bank.sort((a,b)=>b.lastMissed-a.lastMissed).slice(0,250);localStorage.setItem('bbpReviewBank',JSON.stringify(bank))}
function startSmartReview(){let bank=JSON.parse(localStorage.getItem('bbpReviewBank')||'[]');reviewQuestions=bank.map(({id,missed,lastMissed,book,...q})=>q);$('reviewContent').innerHTML=bank.length?`<p>You have <strong>${bank.length}</strong> missed questions saved.</p><p>Smart Review quizzes your weakest questions first.</p>${bank.slice(0,8).map(q=>`<div class="answer-box"><strong>${q.book}</strong> — ${q.verse}<br>${q.question}</div>`).join('')}`:'<p>No missed questions yet. Play a round and miss some questions to build your review list.</p>';$('startReviewBtn').classList.toggle('hidden',bank.length===0);showScreen('smartReviewScreen')}
function beginSmartReview(){selectedBookKey='acts';selectedQuestions=reviewQuestions.slice(0,50);selectedSetLabel='Smart Review';selectedDifficulty='easy';showScreen('modeScreen')}
function clearReviewBank(){if(confirm('Clear all saved missed questions?')){localStorage.removeItem('bbpReviewBank');startSmartReview()}}
function startTournamentMenu(){const sel=$('tournamentSet');sel.innerHTML='';Object.entries(BOOKS).forEach(([key,b])=>sel.innerHTML+=`<option value="${key}">${b.title}</option>`);sel.innerHTML+=`<option value="grand">Grand Championship</option>`;showScreen('tournamentScreen')}
function beginTournament(){const set=$('tournamentSet').value;const count=Number($('tournamentCount').value);if(set==='grand'){selectedBookKey='acts';selectedQuestions=Object.values(BOOKS).flatMap(b=>b.topQuestions).slice(0);selectedSetLabel='Grand Championship Tournament'}else{selectedBookKey=set;selectedQuestions=[...(BOOKS[set].topQuestions?.length?BOOKS[set].topQuestions:BOOKS[set].questions)];selectedSetLabel=`${BOOKS[set].title} Tournament`}shuffle(selectedQuestions);selectedQuestions=selectedQuestions.slice(0,count);selectedDifficulty='medium';selectedMode='random';tournamentMode=true;currentQuestions=[...selectedQuestions];currentIndex=0;score=0;tournamentPoints=0;missedQuestions=[];streak=0;startTime=Date.now();currentRoundMeta={bookKey:selectedBookKey,bookTitle:set==='grand'?'Grand Championship':BOOKS[selectedBookKey].title,setLabel:selectedSetLabel,difficulty:selectedDifficulty,mode:selectedMode};unlock('tournament_player');saveRound();showScreen('gameScreen');loadQuestion()}
function questionValue(){return 10+Math.floor(currentIndex/5)*10}

function addXP(amount){

  xp += amount;

  const newLevel = Math.floor(xp / 100) + 1;

  if(newLevel > level){

    level = newLevel;

    localStorage.setItem('bbpLevel', level);

    showLevelUpPopup();

  }

  localStorage.setItem('bbpXP', xp);

  renderLevelCard();

  checkLevelAchievements();

}

function checkLevelAchievements(){

  if(level >= 5) unlock('level_5');
  if(level >= 10) unlock('level_10');
  if(level >= 20) unlock('level_20');
  if(level >= 30) unlock('level_30');
  if(level >= 50) unlock('level_50');

}

function getRank(){

  if(level >= 50) return '🏆 Hall of Faith';
  if(level >= 30) return '👑 Bible Bowl Champion';
  if(level >= 20) return '📜 Elder';
  if(level >= 10) return '🎓 Scholar';
  if(level >= 5) return '📖 Student';

  return '🌱 Beginner';

}

function renderLevelCard(){

  const rankEl = $('rankText');
  const levelEl = $('levelText');
  const xpEl = $('xpText');
  const fillEl = $('xpFill');

  if(!rankEl || !levelEl || !xpEl || !fillEl) return;

  const currentLevelStart = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const progressXP = xp - currentLevelStart;
  const neededXP = nextLevelXP - currentLevelStart;
  const percent = Math.min(100, Math.max(0, progressXP / neededXP * 100));

  rankEl.textContent = getRank();
  levelEl.textContent = `Level ${level}`;
  xpEl.textContent = `XP: ${progressXP} / ${neededXP}`;
  fillEl.style.width = `${percent}%`;

}


function showLevelUpPopup(){

  const popup = $('achievementPopup');

  if(!popup) return;

  $('achievementPopupName').textContent =
    `Level ${level}`;

  $('achievementPopupDesc').textContent =
    getRank();

  popup.classList.remove('hidden');

  setTimeout(()=>{
    popup.classList.add('hidden');
  },5000);

}

function unlock(id){
  const ach = JSON.parse(localStorage.getItem('bbpAchievements') || '{}');

  if(!ach[id]){
    ach[id] = Date.now();
    localStorage.setItem('bbpAchievements', JSON.stringify(ach));

    playAchievementSound();

    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if(achievement){
      showAchievementPopup(achievement);
    }
  }
}

function showAchievementPopup(achievement){
  const popup = $('achievementPopup');
  if(!popup) return;

  $('achievementPopupName').textContent = achievement.name;
  $('achievementPopupDesc').textContent = achievement.desc;

  popup.classList.remove('hidden');

  setTimeout(()=>{
    popup.classList.add('hidden');
  },4000);
}

function updateAchievements(total,correct,accuracy){

  if(accuracy === 100){

    addXP(100);

    unlock('perfect_round');

    let perfectRounds =
      Number(
        localStorage.getItem(
          'bbpPerfectRounds'
        ) || 0
      );

    perfectRounds++;

    localStorage.setItem(
      'bbpPerfectRounds',
      perfectRounds
    );

    if(perfectRounds >= 5){
      unlock('perfect_5');
    }

    if(selectedDifficulty === 'hard'){
      unlock('hard_perfect');
    }

    if(currentRoundMeta.bookTitle === 'Haggai'){
      unlock('haggai_master');
    }

  }

  if(tournamentMode){
    unlock('tournament_player');

    if(accuracy >= 80){
      unlock('tournament_champion');
    }
  }

  const stats = JSON.parse(
    localStorage.getItem('bbpStats') || '{}'
  );

  const totalAnswered =
    Object.values(stats).reduce(
      (sum,s) =>
        sum + (s.answered || 0),
      0
    );

  if(totalAnswered >= 100){
    unlock('answer_100');
  }

  if(totalAnswered >= 500){
    unlock('answer_500');
  }

  if(totalAnswered >= 1000){
    unlock('answer_1000');
  }

  if((stats['Acts']?.answered || 0) >= 100){
    unlock('acts_missionary');
  }

  if((stats['Isaiah']?.answered || 0) >= 250){
    unlock('isaiah_scholar');
  }

  if((stats['Proverbs']?.answered || 0) >= 150){
    unlock('proverbs_sage');
  }

  if((stats['2 Samuel']?.answered || 0) >= 75){
    unlock('samuel_kingdom');
  }

  const bookTitles =
    Object.values(BOOKS)
      .map(b => b.title);

  if(
    bookTitles.every(
      t => (stats[t]?.played || 0) > 0
    )
  ){
    unlock('champion');
  }

}

function showAchievements(){const unlocked=JSON.parse(localStorage.getItem('bbpAchievements')||'{}');$('achievementsContent').innerHTML=ACHIEVEMENTS.map(a=>`<div class="answer-box"><p><strong>${unlocked[a.id]?'🏆':'🔒'} ${a.name}</strong></p><p>${a.desc}</p>${unlocked[a.id]?`<p class="small">Unlocked: ${new Date(unlocked[a.id]).toLocaleDateString()}</p>`:''}</div>`).join('');showScreen('achievementsScreen')}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)
}

document.addEventListener("visibilitychange", () => {
  if (!bgMusic) return;

  if (document.hidden) {
    bgMusic.pause();
  } else {
    handleMusicForScreen(getActiveScreenId());
  }
});

window.addEventListener("pagehide", () => {
  if (bgMusic) bgMusic.pause();
});

window.addEventListener("blur", () => {
  if (bgMusic) bgMusic.pause();
});

document.addEventListener('keydown', function(e){

  if(e.key !== 'Enter') return;

  const activeScreen = document.querySelector('.screen.active');

  if(activeScreen && activeScreen.id === 'gameScreen'){

    e.preventDefault();

    if(!$('nextBtn').classList.contains('hidden')){
      nextQuestion();
      return;
    }

    if(!$('submitBtn').classList.contains('hidden')){
      submitAnswer();
      return;
    }

  }

});

window.onload=init;
