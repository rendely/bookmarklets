javascript: (() => {
  let url = window.location.href;

  function getTranscript(response) {
    let index = response.match('timedtext')['index'];
    let offset = response.match('simpleText')['index'];
    let transcript_url_base = response.substring(index, offset - 11);
    transcript_url_base = transcript_url_base.replaceAll("\\u0026", "&");
    transcript_url_base = transcript_url_base.replaceAll("lang=bs", "lang=en");
    transcript_url = 'https://www.youtube.com/api/' + transcript_url_base;
    console.log(transcript_url);
    window.open(transcript_url, '_blank');
  }
  fetch(url).then(response => response.text()).then(getTranscript).catch(err => console.log(err))
})();