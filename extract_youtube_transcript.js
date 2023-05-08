javascript: (async () => {
  const summaryDiv = document.createElement('div');
  summaryDiv.innerText = 'Loading ChatGPT Summary\n';

  function getTranscriptUrl() {
    const scripts = Array.from(document.querySelectorAll('script'));
    const filteredScript = scripts.filter(s => {
      if (s.innerHTML.match('timedtext')) return true
    });
    const encodedUrl = filteredScript[0].innerHTML.match(/https:\/\/www.youtube.com\/api\/timedtext[^"]*/)[0];
    const transcriptUrl = encodedUrl.replaceAll('\\u0026', '&');
    return transcriptUrl;
  }

  async function getTranscriptText(url) {
    const request = await fetch(url);
    const response = await request.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
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

  async function getSummary(transcript) {
    const tokenized = transcript.split(' ');
    const windowSize = 1200;
    const overlapSize = 50;
    let i = 0;
    let assistantMessage = { role: "assistant", content: "Send me the audio transcript of the Youtube video and I'll help you summarize it into chapters" };
    let summaries = [];

    async function getChatReplyMessage(userMessage, assistantMessage) {
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
      console.log('Tokens:', d['usage']['total_tokens']);
      console.log('returns', d.choices[0].message);
      return d.choices[0].message;
    }

    while (i < tokenized.length) {
      const userContent = tokenized.slice(i, i + windowSize).join(' ');
      const userMessage = { "role": "user", "content": userContent + '\nPlease summarize the above Youtube transcript in short bullets' };
      assistantMessage = await getChatReplyMessage(userMessage, assistantMessage);
      summaryDiv.innerText += assistantMessage.content;
      summaries.push(assistantMessage.content);
      i += windowSize - overlapSize;
    }
    const userMessage = { role: "user", content: `Summarize the below as chapter headings with summary bullets under each:\n ${summaries.join('\n')}` };
    assistantMessage = { role: "assistant", content: 'How can I help?' };
    const chapterSummary = await getChatReplyMessage(userMessage, assistantMessage);
    console.log('Final:', chapterSummary.content);
    summaryDiv.innerText = chapterSummary.content + '\n' + summaryDiv.innerText;
    return chapterSummary.content;
  }

  const title = document.querySelector("div#title.style-scope.ytd-watch-metadata");
  title.prepend(summaryDiv);
  let url = getTranscriptUrl();
  let transcript = await getTranscriptText(url);
  let summary = await getSummary(transcript);

})()