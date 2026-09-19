async function testTranslate(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text;
  } catch (e) {
    console.error('Translation error:', e.message);
    return text;
  }
}

(async () => {
  const sampleText = "Uma série de esculturas e pinturas explorando a luz e a forma humana.";
  console.log('Original (PT):', sampleText);
  
  const en = await testTranslate(sampleText, 'en');
  console.log('Auto EN:', en);

  const ptPt = await testTranslate(sampleText, 'pt');
  console.log('Auto PT-PT:', ptPt);
})();
