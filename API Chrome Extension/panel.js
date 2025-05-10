const allowedUrls = ["apimf.icicipruamc.com", "https://analytics.google.com"]
let accordionCounter = 0;
document.getElementById('clearLogs').addEventListener('click', function () {
    const accordion = document.querySelector(".accordion");
    accordion.innerHTML = '';    

})

function initializeAccordion() {
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.removeEventListener("click", handleAccordionClick);
    header.addEventListener("click", handleAccordionClick);
  });
}

function handleAccordionClick() {
  const content = this.nextElementSibling;
  const isActive = content.classList.contains("active");
  document.querySelectorAll(".accordion-content").forEach((item) => {
    item.classList.remove("active");
  });
  if (!isActive) {
    content.classList.add("active");
  }
}

function shouldLog(url) { 
    let flag = !allowedUrls?.length
    allowedUrls.forEach(cUrl => {
        if (url.search(cUrl) > -1) {
            flag = true
        }
    })
    return flag

}

function addAccordion(request) {  
  const url = request.request.url;

  if(shouldLog(url)) {
    const host = request.request.headers.find(x => x.name === 'Host')?.value
    let requestBody = "No request body available";
    let responseBody = "No response body available";
    if (request.request.postData && request.request.postData.text && url) {
      try {
        requestBody = JSON.stringify(
          JSON.parse(request.request.postData.text),
          null,
          2
        );
      } catch (e) {
        requestBody = request.request.postData.text;
      }
    }
    request.getContent((content, encoding) => {
      try {
        responseBody = JSON.stringify(JSON.parse(content), null, 2);
      } catch (e) {
        responseBody = content || "No response body available";
      }
      const accordionHtml = `
                <div class="requestUrl">
                  <strong>URL:</strong> 
                  <pre>${request.request.url}</pre>
                </div>
                <div class="requestBody">
                  <strong>Request Body:</strong>
                  <pre>${requestBody}</pre>
                </div>
                <div class="responseBody">
                  <strong>Response Body:</strong>
                  <pre>${responseBody}</pre>
                </div>
          `;
      const accordion = document.querySelector(".accordion");
      const newItem = document.createElement("div");
      newItem.classList.add("accordion-item");
      newItem.innerHTML = `
              <div class="accordion-header">${request.request.url}</div>
              <div class="accordion-content">
                  ${accordionHtml}
              </div>
          `;
      accordion.appendChild(newItem);
      initializeAccordion();
    });
  }
  
}

chrome.devtools.network.onRequestFinished.addListener(addAccordion);
initializeAccordion();
