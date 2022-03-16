function pasteLink() {
  // pastes link from the user clipboard
  const inputBox = document.getElementById("video-url");
  var text = navigator.clipboard
    .readText()
    .then((txt) => (inputBox.value = txt));
}

function validateUrl(url) {
  /* Checks if a video url is correct or not, and extracts the id from it */
  var regExpVideo =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

  var regExpShorts = /^.*(?:youtube\.com\/shorts\/)([^#\&\?]*).*/;

  var matchVideo = url.match(regExpVideo);
  var matchShorts = url.match(regExpShorts);

  if (matchVideo && matchVideo[1]) {
    console.log("Video Link Detected");
    return matchVideo[1];
  } else if (matchShorts && matchShorts[1]) {
    console.log("Shorts Link Detected")
    return matchShorts[1];
  }
  return null;
}

function createDiv(videoId) {
  // creates the video card for display

  var domObject = document.getElementById("dynamic-data");

  const sandbox = "allow-downloads allow-forms allow-scripts allow-same-origin";
  const html = `<div><iframe loading='lazy' sandbox='${sandbox}' style='width:800px;height:250px;border:0;overflow:hidden;' scrolling='no' src='https://loader.to/api/card/?url=https://www.youtube.com/watch?v=${videoId}'></iframe></div>`;

  domObject.innerHTML = html;
}

function work() {
  /* Called on the Button press in DOM */
  // https://www.youtube.com/watch?v=sCVcZCZErc0&list=PLFeDMILzRP2JXNqq5UA0nLmtAsnCcjMJI
  // https://www.youtube.com/watch?v=sCVcZCZErc0
  // https://youtu.be/sCVcZCZErc0
  // https://www.youtube.com/shorts/mOf0YsvpW5g
  // https://youtube.com/shorts/mOf0YsvpW5g?feature=share
  
  const url = document.getElementById("video-url").value;
  if (!url) return;

  videoId = validateUrl(url);
  console.log("Video ID: " + videoId);

  if (videoId === null) {
    alert("Incorrect URL");
    document.getElementById("video-url").value = "";
    document.getElementById("video-url").focus();
    return;
  }

  createDiv(videoId);
}
submit = () => work();
