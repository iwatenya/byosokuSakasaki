const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const btn = document.getElementById('convertBtn');

input.addEventListener('input', () => {
    if (input.value.trim()) {
        btn.disabled = false;
        btn.classList.add("active");
    } else {
        btn.disabled = true;
        btn.classList.remove("active");
    }
});

function toKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) + 0x60)
    );
}

function convert(text) {
    // 改行・全角スペースの正規化
    let converted = text
      .replace(/　/g, ' ')  // 全角スペースを半角に
      .replace(/\r?\n/g, '\n');  // 改行コードを統一
  
    // ① 連続した小文字（っっっ→ッッッ）
    converted = converted.replace(/[っゃゅょぁぃぅぇぉゎゕゖ]{2,}/g, match => toKatakana(match));
  
    // ② 2文字だけの語（小文字含む） → 小文字だけカタカナに
    converted = converted.replace(/\b([ぁ-ん])([ゃゅょぁぃぅぇぉゎ])\b/g,
      (_, base, small) => base + toKatakana(small)
    );
  
    // ③ 3文字以上の語尾にある大＋小文字 → セットでカタカナに
    converted = converted.replace(/([ぁ-ん])([ゃゅょぁぃぅぇぉゎ])(?=[、。！？!?〜ー…・"”）)\]]|$|\n)/g,
      (_, base, small) => toKatakana(base + small)
    );
  
    // ④ 読点「、」の直前のひらがな → カタカナに
    converted = converted.replace(/([ぁ-ん])(?=、)/g, match => toKatakana(match));
  
    // ⑤ 記号（。！？…など）の直前のひらがな → カタカナに
    converted = converted.replace(/([ぁ-ん])(?=[。！？!?〜ー…・"”）)\]])/g, match => toKatakana(match));
  
    // ⑥ 文末がひらがな（改行含む） → カタカナに
    if (converted.match(/[ぁ-ん]($|\n)/)) {
      converted = converted.replace(/([ぁ-ん])($|\n)/g, (_, ch, nl) => toKatakana(ch) + nl);
    }
  
    return converted;
  }
  
  btn.addEventListener('click', () => {
    const result = convert(input.value);
    output.value = result;
  });