const videoCapacity = 10; //number of videos per page
var nextPageToken = undefined; //holds the net page token in YouTube API pagination system
var playlistId = ""; //holds the YouTube playlist ID
var fileFormat = ""; // holds the download file type
var currentPage = 1; // current page in the YouTube API pagination system
var numberOfPagesPossible = 1; // number of pages in YouTube API pagination system

var currentPageSegment = 0; //current subdivision of a page in view
var pages = []; // holds all the subdivisions of a page, usually in groups of 10

/*
file type parameters for Loader.to API
[ m4a aac flac opus ogg wav webm 360 480 720 1080 4k 8k ]
*/

function pasteLink(){
  // pastes link from the user clipboard
  const inputBox = document.getElementById("playlist-url");
  var text = navigator.clipboard.readText().then(txt=>inputBox.value=txt);
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

function showNextButton(state) {
  // toggles visibility state of the next button
  const btn = document.getElementsByClassName("next-button");
  if (state) {
    for(let i=0; i<btn.length; i++)
      btn[i].style.visibility = "visible";
  } else {
    for(let i=0; i<btn.length; i++)
      btn[i].style.visibility = "hidden";
  }
}

function createRequestUrl(parts, playlistId, api, pageToken = undefined) {
  // generates the request url based on passed parameters
  const partsParameter = `&part=${parts.join("%2C")}`;
  const playlistIdParameter = `&playlistId=${playlistId}`;
  const keyParameter = `&key=${api}`;
  var tokenParameter = "";

  if (pageToken !== undefined) tokenParameter = `&pageToken=${pageToken}`;

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
  const owner = data.snippet.channelTitle;
  const channelId = data.snippet.channelId;
  const videoIndex = data.snippet.position;
  const thumbnail = data.snippet.thumbnails.medium.url;
  const publishedAt = new Date(data.snippet.publishedAt);
  const title = data.snippet.title;
  const publishDate =
    `${("0" + publishedAt.getDate()).slice(-2)}-` +
    `${("0" + (publishedAt.getMonth()+1)).slice(-2)}-` +
    `${publishedAt.getFullYear()}`;



  var videoData = {};
  videoData["id"] = videoId;
  videoData["index"] = videoIndex;
  videoData["thumbnail"] = thumbnail;
  videoData["date"] = publishDate;
  videoData["title"] = title;
  videoData["owner"] = owner;
  videoData["channelId"] = channelId;

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

  let dataSegment = [];
  for (let i of items) {
    var item = filterData(i);
    dataSegment.push(item);
  }

  pages = createGroups(dataSegment, videoCapacity);
  numberOfPagesPossible = parseInt(Math.ceil(totalResults / 50));
}

function createDivs(data) {
  // creates the video card for display

  var domObject = document.getElementById("dynamic-data");
  const sandbox = "allow-downloads allow-forms allow-scripts allow-same-origin";

  for (let i of data) {
    const button = `<div><iframe loading='lazy' sandbox='${sandbox}' style='width:230px;height:60px;border:0;overflow:hidden;' scrolling='no' src='https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${i.id}&f=${fileFormat}&color=64c896'></iframe></div>`;

    var title = i.title;
    if (title.length > 60) {
      title = title.substring(0, 56) + " ...";
    }

    const titleLink = `<h6 class='card-title'><a href='https://www.youtube.com/watch?v=${i.id}' target='_blank'>${title}</a></h6>`;
    const img = `<img class='card-img-top' src=${i.thumbnail}></img>`;
    const date = `Uploaded On: ${i.date}`;
    const uploader = `Uploaded By: <a target='_blank' href='https://www.youtube.com/channel/${i.channelId}'>${i.owner}</a> `;
    const details = `<p class='card-text'>${date}<br/>${uploader}</p>`;

    const html = `<div class='card download-item col' style='width: 22.5rem;'>
                    ${img}
                    <div class='card-body'>
                      ${titleLink}
                      ${details}
                      ${button}
                    </div>
                  </div>`;

    //const html = `<div class='download-item'>${titleLink}${img}${date}${button}</div>`;

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

  fetchData(request)
    .then((data) => {
      nextPageToken = data.nextPageToken;
      showNextButton(true);
      processResponse(data);
    })
    .then((data) => {
      nextButtonPressed();
      showLoaderAnimation(false);
    });
}

function nextButtonPressed() {
  currentPageSegment++;

  if (currentPageSegment > pages.length) {
    if (nextPageToken === undefined) {
      alert("No more videos available!");
    } else {
      currentPageSegment = 0;
      initiateProcess(nextPageToken);
      // alert("new fetch request abondoned!");
    }
    console.log("next page:", nextPageToken);
    return;
  }

  document.getElementById("dynamic-data").innerHTML = "";
  createDivs(pages[currentPageSegment - 1]);
}

function reset() {
  // resets all the values and states
  nextPageToken = undefined;
  playlistId = "";
  fileFormat = "";
  currentPageSegment = 0;
  pages = [];
  numberOfPagesPossible = 1;
  currentPage = 1;
  showNextButton(false);
}

function work() {
  /* Called on the Button press in DOM */
  // https://www.youtube.com/watch?v=sCVcZCZErc0&list=PLFeDMILzRP2JXNqq5UA0nLmtAsnCcjMJI //15video
  // https://www.youtube.com/playlist?list=PLFeDMILzRP2Jii4SAQNcuMd-M7Bw0Hgan //3video
  // https://www.youtube.com/playlist?list=PL_A4M5IAkMaexM2nxZt512ESPt83EshJq //99videos

  reset();
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
