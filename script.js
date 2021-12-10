const videoCapacity = 10;
var nextPageToken = undefined;
var currentStartIndex = 1;
var fetchedData = [];
var nextPageAvailable = false;
var playlistId = "";
var fileFormat = "";
var currentPage = 0;
var pages = [];
var numberOfPagesPossible = 1;

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

// function updateStopIndex() {
//   /* Edits the stop index input box when start index input is given */
//   try {
//     if (document.getElementById("start-index").value === "0") {
//       document.getElementById("start-index").value = "1";
//     }
//     const start = parseInt(document.getElementById("start-index").value);
//     document.getElementById("stop-index").value = String(
//       start + videoCapacity - 1
//     );
//   } catch (e) {
//     console.log(e);
//   }
// }

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

function showNextButton(state) {
  // toggles visibility state of the next button
  const btn = document.getElementById("next-button");
  if (state) {
    btn.style.visibility = "visible";
  } else {
    btn.style.visibility = "hidden";
  }
}

function createRequestUrl(parts, playlistId, api, pageToken = undefined) {
  // generates the request url based on passed parameters
  const partsParameter = `&part=${parts.join("%2C")}`;
  const playlistIdParameter = `&playlistId=${playlistId}`;
  const keyParameter = `&key=${api}`;
  var tokenParameter = "";

  if (pageToken !== undefined) tokenParameter = pageToken;

  const requestUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?maxResults=50${partsParameter}${playlistIdParameter}${keyParameter}${tokenParameter}`;

  return requestUrl;
}

async function fetchData(requestUrl) {
  /* Fetchs the playlist data from YouTube API v3 and returns a json object */
  var data = await fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  console.log("API FETCHED!");
  return data;
}

function filterData(data) {
  // takes out only required fields from the fetched youtube data

  const videoId = data.contentDetails.videoId;
  const videoIndex = data.snippet.position;
  const thumbnail = data.snippet.thumbnails.medium.url;
  const publishedAt = new Date(data.snippet.publishedAt);
  const title = data.snippet.title;
  const publishDate =
    `${("0" + publishedAt.getDate()).slice(-2)}-` +
    `${("0" + publishedAt.getMonth()).slice(-2)}-` +
    `${publishedAt.getFullYear()}`;

  var videoData = {};
  videoData["id"] = videoId;
  videoData["index"] = videoIndex;
  videoData["thumbnail"] = thumbnail;
  videoData["date"] = publishDate;
  videoData["title"] = title;

  return videoData;
}

function createGroups(array, groupSize) {
  /* Splits the array into smaller groups */
  var new_array = [];
  for (var i = 0; i < array.length; i += groupSize) {
    new_array.push(array.slice(i, i + groupSize));
  }

  return new_array;
}

function processResponse(data) {
  /* 
  Extracts useful results from the fetched data and returns a json object
  Called when new data is fetched
  */
  const items = data.items;

  const totalResults = parseInt(data.pageInfo.totalResults);
  const resultsPerPage = parseInt(data.pageInfo.resultsPerPage);

  let dataSegment = [];
  for (let i of items) {
    var item = filterData(i);
    dataSegment.push(item);
  }

  pages = createGroups(dataSegment, videoCapacity);
  console.log(pages);
}

function createDivs(data) {
  // creates the video card for display

  var domObject = document.getElementById("dynamic-data");
  const sandbox = "allow-downloads allow-forms allow-scripts allow-same-origin";

  for (let i of data) {
    const button = `<div><iframe loading='lazy' sandbox='${sandbox}' style='width:230px;height:60px;border:0;overflow:hidden;' scrolling='no' src='https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${i.id}&f=${fileFormat}&color=64c896'></iframe></div>`;

    const titleLink = `<a href='https://www.youtube.com/watch?v=${i.id}' target='_blank'>${i.title}</a>`;
    const img = `<div><img src=${i.thumbnail}></img></div>`;
    const date = `<div>${i.date}</div>`;
    const html = `<div class='download-item'>${titleLink}${img}${date}${button}</div>`;

    const content = domObject.innerHTML;
    domObject.innerHTML = content + html;
  }
}

function initiateProcess(pageToken = undefined) {
  // called when playlist id and file format are confirmed
  // called on new data fetch request

  const api = "AIzaSyCbXdXTzINCD6H6HMejdNvXJkp5zkeg-Jc";
  const parts = ["snippet", "contentDetails"];

  document.getElementById("dynamic-data").innerHTML = "";
  showLoaderAnimation(true);

  const request = createRequestUrl(parts, playlistId, api, pageToken);

  data = fetchData(request)
    .then((data) => {
      fetchedData = data;
      nextPageToken = data.nextPageToken;
      showNextButton(true);
      processResponse(data);
    })
    .then((data) => showLoaderAnimation(false));
}

function nextButtonPressed() {
  currentPage++;

  if (currentPage>pages.length){
    console.log("page:", currentPage);
    console.log("pages:", pages.length);
    alert("last page!");
    return
  }

  document.getElementById("dynamic-data").innerHTML = "";
  createDivs(pages[currentPage-1]);

  
}

function work() {
  /* Called on the Button press in DOM */
  // https://www.youtube.com/watch?v=sCVcZCZErc0&list=PLFeDMILzRP2JXNqq5UA0nLmtAsnCcjMJI //15video
  // https://www.youtube.com/playlist?list=PLFeDMILzRP2Jii4SAQNcuMd-M7Bw0Hgan //3video
  // https://www.youtube.com/playlist?list=PL_A4M5IAkMaexM2nxZt512ESPt83EshJq //99videos

  showNextButton(false);
  const url = document.getElementById("playlist-url").value;
  if (!url) return;

  fileFormat = document.getElementById("download-type").value;

  playlistId = validateUrl(url);

  if (playlistId === null) {
    alert("Incorrect URL");
    document.getElementById("playlist-url").value = "";
    document.getElementById("playlist-url").focus();
    return;
  }

  initiateProcess();
}
submit = () => work();
