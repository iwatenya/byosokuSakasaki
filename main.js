const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const convertBtn = document.getElementById('convertBtn');

const modeSwitch = document.getElementById('modeSwitch');
const longModeBtn = document.getElementById('longModeBtn');
const shortModeBtn = document.getElementById('shortModeBtn');
const longModeArea = document.getElementById('longModeArea');
const shortModeArea = document.getElementById('shortModeArea');
const batchConvertBtn = document.getElementById('batchConvertBtn');
const shortInputsOutputs = document.getElementById('shortInputsOutputs');

const shortInputs = [];
const shortOutputs = [];

// 2. 10組の短文入力＆出力欄生成
for(let i=0; i<10; i++){
  const container = document.createElement('div');
  container.style.display = 'flex';

  const inputElem = document.createElement('input');
  inputElem.type = 'text';
  inputElem.placeholder = `変換前 ${i+1}`;
  container.appendChild(inputElem);
  shortInputs.push(inputElem);

  const outputElem = document.createElement('textarea');
  outputElem.rows = 1;
  outputElem.placeholder = `変換結果 ${i+1}`;
  container.appendChild(outputElem);
  shortOutputs.push(outputElem);

  shortInputsOutputs.appendChild(container);
}

// 3. 長文モードのボタン活性制御
input.addEventListener('input', () => {
  convertBtn.disabled = !input.value.trim();
  if(!convertBtn.disabled){
    convertBtn.classList.add('active');
  } else {
    convertBtn.classList.remove('active');
  }
});

// 4. 短文モードのまとめて変換ボタン活性制御
function checkBatchBtn(){
  const hasValue = shortInputs.some(i => i.value.trim() !== '');
  batchConvertBtn.disabled = !hasValue;
  if(!batchConvertBtn.disabled){
    batchConvertBtn.classList.add('active');
  } else {
    batchConvertBtn.classList.remove('active');
  }
}
shortInputs.forEach(i => {
  i.addEventListener('input', checkBatchBtn);
});
checkBatchBtn();

// 5. ひらがな→カタカナ変換関数（変更なし）
function toKatakana(str) {
  return str.replace(/[\u3041-\u3096]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// 6. 変換関数（元の仕様に準拠）
function convert(text) {
  let converted = text
      .replace(/　/g, ' ')
      .replace(/\r?\n/g, '\n');

  // ② 2文字だけの語 → 小文字のみカタカナ
  converted = converted.replace(/\b([ぁ-ん])([ゃゅょぁぃぅぇぉゎ])\b/g,
      (_, base, small) => base + toKatakana(small)
  );

  // ③ 3文字以上語尾の大+小文字 → セットでカタカナ
  converted = converted.replace(/([ぁ-ん])([ゃゅょぁぃぅぇぉゎ])(?=[、。！？!?〜…・"”）)\]♪★～ 　]|$|\n)/g,
      (_, base, small) => toKatakana(base + small)
  );

  // ④ 読点「、」の直前 → カタカナに（伸ばし棒「ー」は除外）
  converted = converted.replace(/(?<!ー)([ぁ-ん])(?=、)/g, match => toKatakana(match));

  // ⑤ 記号直前（。！？…〜など）のひらがな → カタカナ（伸ばし棒「ー」は除外）
  converted = converted.replace(/(?<!ー)([ぁ-ん])(?=[。！？!?〜…・"”）)\]♪★～、 　])/g, match => toKatakana(match));

  // ⑥ 文末（改行含む）のひらがな → カタカナ（伸ばし棒「ー」は除外）
  converted = converted.replace(/(?<!ー)([ぁ-ん])($|\n)/g, (_, ch, nl) => toKatakana(ch) + nl);

  // ⑦ 伸ばし棒「ー」・波ダッシュ「〜」直前のひらがなはカタカナ化（文末・記号・空白直前のみ）
  // ただし、その後に文字が続く場合はカタカナ化しない
  converted = converted.replace(/([ぁ-ん])(?=[ー〜](?:[。、。！？!?〜…・"”）)\]♪★～ 　]|$|\n))/g, (match, ch, offset, str) => {
      const nextChar = str[offset + 2] || '';
      if (nextChar && nextChar.match(/[ぁ-ん]/)) return match;
      return toKatakana(ch);
  });

  return converted;
}

// 7. 長文モードの変換処理
convertBtn.addEventListener('click', () => {
  output.value = convert(input.value);
});

// 8. 短文モードのまとめて変換処理
batchConvertBtn.addEventListener('click', () => {
  shortInputs.forEach((inp, i) => {
    if(inp.value.trim() === ''){
      shortOutputs[i].value = '';
    } else {
      shortOutputs[i].value = convert(inp.value);
    }
  });
});

// 9. モード切替処理
function switchToLong(){
  longModeArea.style.display = 'block';
  shortModeArea.style.display = 'none';
  longModeBtn.classList.add('active');
  shortModeBtn.classList.remove('active');
  // クリア
  output.value = '';
  input.value = '';
  convertBtn.disabled = true;
}

function switchToShort(){
  longModeArea.style.display = 'none';
  shortModeArea.style.display = 'block';
  longModeBtn.classList.remove('active');
  shortModeBtn.classList.add('active');
  // クリア
  shortInputs.forEach(i => i.value = '');
  shortOutputs.forEach(o => o.value = '');
  batchConvertBtn.disabled = true;
}

longModeBtn.addEventListener('click', switchToLong);
shortModeBtn.addEventListener('click', switchToShort);

// 初期は長文モード表示
switchToLong();
