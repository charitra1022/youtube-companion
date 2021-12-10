const videoCapacity = 10;

/*
m4a
aac
flac
opus
ogg
wav
webm
360
480
720
1080
4k
8k
*/

function updateStopIndex() {
  /* Edits the stop index input box when start index input is given */
  try {
    const start = parseInt(document.getElementById("start-index").value);
    document.getElementById("stop-index").value = String(start + 4);
  } catch (e) {
    console.log(e);
  }
}

function validateUrl(url) {
  /* Checks if a playlist url is correct or not, and extracts the id from it */
  var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2]) {
    return match[2];
  }
  return null;
}

function showLoaderAnimation(state) {
  // toggles the loader spinner animation
  const div = document.getElementById("loader-spinner");
  if (state) {
    div.style.visibility = "visible";
  } else {
    div.style.visibility = "hidden";
  }
}

async function fetchData(requestUrl) {
  /* Fetchs the playlist data from YouTube API v3 and returns a json object */
  var data = await fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return data;
}

function processResponse(data, stopIndex) {
  /* Extracts useful results from the fetched data and returns a json object */
  const pageInfo = data.pageInfo;
  const items = data.items;
  const totalResults = parseInt(pageInfo.totalResults);
  const startIndex = stopIndex - offset + 1;

  // if(totalResults <= offset){
    
  // }

  console.log(
    "Total results:",
    totalResults,
    " Per page:",
    pageInfo.resultsPerPage
  );

  var processedData = [];

  for (let i of items) {
    const videoId = i.contentDetails.videoId;
    const videoIndex = i.snippet.position;
    const thumbnail = i.snippet.thumbnails.medium.url;
    const publishedAt = new Date(i.snippet.publishedAt);
    const title = i.snippet.title;
    const publishDate =
      `${("0" + publishedAt.getDate()).slice(-2)}-` +
      `${("0" + publishedAt.getMonth()).slice(-2)}-` +
      `${publishedAt.getFullYear()}`;

    // console.log("Video ID: ", videoId);
    // console.log("Position: ", videoIndex);
    // console.log("Thumbnail: ", thumbnail);
    // console.log("Published At: ", publishDate);
    // console.log("Title: ", title);
    // console.log("\n");

    var videoData = {};
    videoData["id"] = videoId;
    videoData["index"] = videoIndex;
    videoData["thumbnail"] = thumbnail;
    videoData["date"] = publishDate;
    videoData["title"] = title;

    processedData.push(videoData);
  }
  return processedData;
}

function createDivs(data, fileFormat) {
  var data1 = [
    {
      id: "T2lW4Kz7UG0",
      index: 0,
      thumbnail: "https://i.ytimg.com/vi/T2lW4Kz7UG0/mqdefault.jpg",
      date: "12-05-2021",
      title:
        "New UI of Google PlayStore as of June 2021. View and Update Apps on your Android Phone. #shorts",
    },
    {
      id: "b3-YgV2nJo0",
      index: 1,
      thumbnail: "https://i.ytimg.com/vi/b3-YgV2nJo0/mqdefault.jpg",
      date: "12-05-2021",
      title:
        'Remove the annoying "Windows Update Status Icon" from the Taskbar in Windows 10!! #shorts',
    },
    {
      id: "5hqE6xMRdlQ",
      index: 2,
      thumbnail: "https://i.ytimg.com/vi/5hqE6xMRdlQ/mqdefault.jpg",
      date: "09-10-2021",
      title:
        "How to Check BIOS Mode on a Windows Computer? Legacy or UEFI? #shorts",
    },
  ];

  //data = data1;

  console.log("inside div creator");

  var domObject = document.getElementById("dynamic-data");

  for (let i of data) {
    const sandbox =
      "allow-downloads allow-forms allow-scripts allow-same-origin";
    const button = `<div><iframe sandbox='${sandbox}' style='width:230px;height:60px;border:0;overflow:hidden;' scrolling='no' src='https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${i.id}&f=${fileFormat}&color=64c896'></iframe></div>`;

    const titleLink = `<a href='https://www.youtube.com/watch?v=${i.id}' target='_blank'>${i.title}</a>`;
    const img = `<div><img src=${i.thumbnail}></img></div>`;
    const date = `<div>${i.date}</div>`;
    const html = `<div class='download-item'>${titleLink}${img}${date}${button}</div>`;

    const content = domObject.innerHTML;
    domObject.innerHTML = content + html;
  }
  console.log(data);
}

function work() {
  /* Called on the Button press in DOM */
  // https://www.youtube.com/watch?v=sCVcZCZErc0&list=PLFeDMILzRP2JXNqq5UA0nLmtAsnCcjMJI //15video
  // https://www.youtube.com/playlist?list=PLFeDMILzRP2Jii4SAQNcuMd-M7Bw0Hgan //3video
  // https://www.youtube.com/playlist?list=PL_A4M5IAkMaexM2nxZt512ESPt83EshJq //99videos

  const url = document.getElementById("playlist-url").value;
  if (!url) return;

  const startValue = document.getElementById("start-index").value;
  if (!startValue) return;

  const startIndex = parseInt(startValue);
  const fileFormat = document.getElementById("download-type").value;

  const stopIndex = startIndex + videoCapacity - 1;

  var playlistId = validateUrl(url);

  if (playlistId === null) {
    alert("Incorrect URL");
    document.getElementById("playlist-url").value = "";
    document.getElementById("playlist-url").focus();
    return;
  }

  const api = "AIzaSyCbXdXTzINCD6H6HMejdNvXJkp5zkeg-Jc";
  const parts = ["snippet", "contentDetails"];
  const request = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${parts.join(
    "%2C"
  )}&maxResults=50&playlistId=${playlistId}&key=${api}`;

  document.getElementById("dynamic-data").innerHTML = "";
  var data = [];
  showLoaderAnimation(true);
  data = fetchData(request)
    .then((data) => processResponse(data, stop))
    .then((data) => {
      showLoaderAnimation(false);
      createDivs(data, fileFormat);
    });

  //createDivs(data);
}
submit = () => work();
