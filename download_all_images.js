(function() {
  var images = [].slice.call(document.querySelectorAll('img'));
  try {
    images.forEach(function(img, i) {
	  if (img.width >= 200) setTimeout(() => downloadResource(img.src),i*500)
    })
  } catch (e) {
      alert("Download failed.");
      console.log('Download failed.', e);
  }
  
  function forceDownload(blob, filename) {
  var a = document.createElement('a');
  a.download = filename;
  a.href = blob;
  a.click();
}

function downloadResource(	url, filename) {
  if (!filename) filename = url.split('\\').pop().split('/').pop();
  fetch(url, {
      headers: new Headers({
        'Origin': location.origin
      }),
      mode: 'cors'
    })
    .then(response => response.blob())
    .then(blob => {
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch(e => console.error(e));
}

}).call(window);