javascript: (() => {
  let pMetrics = {};
  allP = document.querySelectorAll("p");
  allP.forEach(p => {
    let style = window.getComputedStyle(p, null).getPropertyValue('font-size');
    let fontSize = parseFloat(style);
    if (fontSize in pMetrics) {
      pMetrics[fontSize]['totWords'] += p.innerText.length;
      pMetrics[fontSize]['numTags'] += 1;
      pMetrics[fontSize]['avgWords'] = pMetrics[fontSize]['totWords'] / pMetrics[fontSize]['numTags'];
    } else {
      pMetrics[fontSize] = {};
      pMetrics[fontSize]['totWords'] =  p.innerText.length;
      pMetrics[fontSize]['numTags'] = 1;
      pMetrics[fontSize]['avgWords'] = pMetrics[fontSize]['totWords'] / pMetrics[fontSize]['numTags'];
    }

  });
  console.log(pMetrics);
  let maxPAvgWords = 0;
  let pFontSizeFilter = 0;
  for (const fontSize in pMetrics) {
    if (pMetrics[fontSize]['avgWords'] > maxPAvgWords) {
      maxPAvgWords = pMetrics[fontSize]['avgWords'];
      pFontSizeFilter = parseFloat(fontSize);
    }
  }
  console.log(pFontSizeFilter);
  let allText = [];
  let allElements = document.body.querySelectorAll("p,h1,h2");
  allElements.forEach(el => {
    let style = window.getComputedStyle(el, null).getPropertyValue('font-size');
    let fontSize = parseFloat(style);
    console.log('font size', fontSize === pFontSizeFilter);

    if (el.nodeName === 'P' && 
        fontSize === pFontSizeFilter && 
        el.offsetParent !== null &&
        el.innerText.length > 20 &&
        ((el.previousElementSibling === null ? true : el.previousElementSibling.nodeName === 'P') ||
        (el.nextElementSibling === null ? true : el.nextElementSibling.nodeName === 'P'))
        ){
        allText.push(el.textContent);
      }
    else if (el.nodeName !== 'P' && el.innerText.length > 20){
      allText.push(el.textContent);
    }
  });
  console.log(allText);
  document.head.innerHTML = '';
  document.body.innerHTML = allText.join('</br></br>');
  document.body.style = 'margin: auto; width: 600px';
})();