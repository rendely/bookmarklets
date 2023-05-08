javascript: (async () => {
const summaryDiv = document.createElement('div');
summaryDiv.innerText = 'Loading ChatGPT Summary';

function getTranscriptUrl(){
  const scripts = Array.from(document.querySelectorAll('script'));
  const filteredScript = scripts.filter(s=>{
    if (s.innerHTML.match('timedtext')) return true});
  const encodedUrl = filteredScript[0].innerHTML.match(/https:\/\/www.youtube.com\/api\/timedtext[^"]*/)[0];
  const transcriptUrl = encodedUrl.replaceAll('\\u0026','&');  
  return transcriptUrl;
}

async function getTranscriptText(url){
  const request = await fetch(url);
  const response = await request.text(); 
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response,"text/xml");
  const frags = Array.from(xmlDoc.querySelectorAll('text'));
  const fixedFrags = frags.map(f => fixEncoding(f.innerHTML));
  const transcriptText = fixedFrags.join(' ');
  return transcriptText;

  function fixEncoding(text) {
    return text.replace(/&amp;#(\d+);/g, (match, dec) => {
      return String.fromCharCode(dec);
    });
  }
}

async function getSummary(transcript){
  const tokenized = transcript.split(' ');
  const windowSize = 1200;
  const overlapSize = 50;
  let i = 0;
  let assistantMessage = {role: "assistant", content: "Send me the audio transcript of the Youtube video and I'll help you summarize it into chapters"};

  async function getChatReplyMessage(userMessage,assistantMessage){
  const body = {
    "model": "gpt-3.5-turbo",
    "messages": [assistantMessage, userMessage]
  };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": 'Bearer <GOES HERE>'
      },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    console.log('Tokens:',d['usage']['total_tokens']);
    return d.choices[0].message;
  }

  while (i < tokenized.length){
    const userContent = tokenized.slice(i,i+windowSize).join(' ');
    const userMessage = { "role": "user", "content": userContent + '\n Summarize the above Youtube transcript in Chapters' };
    console.log(userContent);
    assistantMessage = await getChatReplyMessage(userMessage, assistantMessage);
    summaryDiv.innerText = assistantMessage.content;
    console.log(assistantMessage);
    i += windowSize - overlapSize;
  }
  console.log('Final:',assistantMessage.content);
  return assistantMessage.content;
}


const title = document.querySelector("div#title.style-scope.ytd-watch-metadata");
title.prepend(summaryDiv);
let url = getTranscriptUrl();
let transcript = await getTranscriptText(url);
let summary = await getSummary(transcript);


})()