// Fix fake headlines below article: https://thehill.com/homenews/space/3980948-nasa-found-a-novel-way-to-keep-voyager-2-spacecraft-going/
// Fix weird DOM like https://www.phonearena.com/news/google-pixel-fold-all-specs-features-dimensions-tidbits-leaked_id147242
// Fix support for list elements not being extracted https://musebycl.io/2-minutes/2-minutes-patrick-holly-ecd-upwork 
javascript: (() => {
  const chatPrompt = 'Please write a very concise, 3 bullet point highlights of the text above.';
  const auth = 'Bearer <GOES HERE>';
  let pMetrics = {};
  allP = document.querySelectorAll("p");
  allP.forEach(p => {
    if (p.clientHeight > 0) {
      let style = window.getComputedStyle(p, null).getPropertyValue('font-size');
      let fontSize = parseFloat(style);
      console.log(fontSize, p);
      if (fontSize in pMetrics) {
        pMetrics[fontSize]['totWords'] += p.innerText.length;
        pMetrics[fontSize]['numTags'] += 1;
        pMetrics[fontSize]['avgWords'] = pMetrics[fontSize]['totWords'] / pMetrics[fontSize]['numTags'];
      } else {
        pMetrics[fontSize] = {};
        pMetrics[fontSize]['totWords'] = p.innerText.length;
        pMetrics[fontSize]['numTags'] = 1;
        pMetrics[fontSize]['avgWords'] = pMetrics[fontSize]['totWords'] / pMetrics[fontSize]['numTags'];
      }
    }
  });
  console.log(pMetrics);
  let maxScore = 0;
  let pFontSizeFilter = 0;
  for (const fontSize in pMetrics) {
    const thisScore = pMetrics[fontSize]['avgWords'] * pMetrics[fontSize]['totWords'];
    if (thisScore > maxScore) {
      maxScore = thisScore;
      pFontSizeFilter = parseFloat(fontSize);
    }
  }
  console.log(pFontSizeFilter);
  let allText = [];
  let allElements = Array.from(document.body.querySelectorAll("p,h1,h2"));
  let visibleElements = allElements.filter(e => e.clientHeight > 0);
  visibleElements.forEach(el => {
    let style = window.getComputedStyle(el, null).getPropertyValue('font-size');
    let fontSize = parseFloat(style);
    if (el.nodeName === 'P' &&
      fontSize === pFontSizeFilter &&
      el.offsetParent !== null &&
      el.textContent.length > 20 &&
      ((el.previousElementSibling === null ? true : el.previousElementSibling.nodeName.match('P|H')) ||
        (el.nextElementSibling === null ? true : el.nextElementSibling.nodeName.match('P|H')))
    ) {
      allText.push(el.textContent);
    }
    else if (el.nodeName !== 'P' && el.textContent.length > 20) {
      allText.push(el.textContent);
    }
  });
  console.log(allText);
  document.head.innerHTML = '';
  document.body.innerHTML = '<h2>Original article:</h2><p>' + allText.join('</p><p>') + '</p>';
  document.body.style = 'margin: auto; font-family: "Google Sans"; max-width: 700px; line-height:1.6; font-size:16px; background:#f2f2f2;';

  const url = 'https://api.openai.com/v1/chat/completions';

  body = {
    "model": "gpt-3.5-turbo",
    "messages": [{ "role": "user", "content": `${allText.join('\n').slice(0, 10000)}\n${chatPrompt}` }]
  };

  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = 'Loading summary...</br></br>';
  document.body.prepend(summaryDiv);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": auth
    },
    body: JSON.stringify(body)
  })
    .then(r => r.json())
    .then(d => addResponse(d));

  function addResponse(data) {
    console.log(data);
    const message = data['choices'][0]['message']['content'];
    summaryDiv.innerHTML = '<h2>Summary:</h2><p>' + message.replaceAll('- ', '</p><p>- ') + '</p>';
  }
})();