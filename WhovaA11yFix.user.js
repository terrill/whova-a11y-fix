// ==UserScript==
// @name         Whova Accessibility Fix
// @namespace    https://github.com/terrill/whova-a11y-fix
// @version      1.9
// @updateURL    https://raw.githubusercontent.com/terrill/whova-a11y-fix/main/user.js
// @downloadURL  https://raw.githubusercontent.com/terrill/whova-a11y-fix/main/user.js
// @description  Fixes accessibility issues in Whova's web app
// @author       Terrill Thompson <tft@uw.edu>
// @match        https://whova.com/portal/webapp/*
// ==/UserScript==

// Global vars
var a11ySearching = false; // will change to true temporarily when a user types in a search field
var a11yDebug = false; // set to true to write messages to the console; otherwise false
var a11yFixingPage = false; // stop gap to prevent script from handling mutations that result from a11y fixes

(function() {

  // document load may already be complete before this userscript is executed
  if (document.readyState == 'complete') {
    // this might be a lie. Better give page a moment to fully load.
    setTimeout(function() {
      init();
    }, 2000);
  }
  else {
    // Wait until page has loaded
    window.addEventListener('load',function() {
      // Content continues to be added after load is fired
      // Better wait a moment.
      setTimeout(function() {
        init();
      }, 2000);
    });
  }
})();

function init() {

  // Whova changes pages/views without a new page load
  // To determine when the page/view has changed significantly, we need to:
  // Set a mutationObserver to watch for changes. If they occur:
  //   1. Check the URL (a change in URL = a new page)
  //   2. Check for specific mutations using nodeName and classList

  var i, thisPage, prevPage, searching, mutationObserver, observerOptions, companyName;

  // Fix the current page
  thisPage = getPage();
  fixPage(thisPage,'all');
  prevPage = thisPage;

  // Use a MutationObserver to watch for changes
  mutationObserver = new MutationObserver(function(mutations) {

    if (a11yFixingPage) {
      return;
    }
    if (a11yDebug) {
      console.log('New mutations observed: ' + mutations.length);
    }
    thisPage = getPage();
    if (thisPage !== prevPage) {
      // the URL has changed. This is a new page.
      fixPage(thisPage,'all');
      prevPage = thisPage;
    }
    else {
      // Check all same-page mutations
      // i.e., this is not a new page, but something has changed
      for (i=0; i< mutations.length; i++) {

        if (a11yDebug) {
          // This generates a LOT of content!
          // Uncomment if needed to inspect mutations
          // console.log('Mutation ' + i + ': ',mutations[i].target);
        }

        if (mutations[i].target.classList.contains('page-content') || mutations[i].target.classList.contains('home-content')) {
          // this is a significant change to the main content area
          fixPage(thisPage,'main');
        }
        else if (mutations[i].target.classList.contains('modal-open')) {
          // A modal dialog has popped up
          fixModalDialog(thisPage);
        }
        else if (thisPage === 'Agenda') {
          if (mutations[i].target.classList.contains('sessions') || mutations[i].target.classList.contains('no-sessions')) {
            // The list of sessions has been updated
            fixPage(thisPage,'main');
            showSearchCount(thisPage);
          }
          else if (mutations[i].target.classList.contains('page-content-inner')) {
            // the entire agenda page has changed (not the result of a search or filter)
            fixPage(thisPage,'main');
          }
        }
        else if (thisPage === 'Attendees') {
          if (mutations[i].target.classList.contains('page-content-padding')) {
            fixPage(thisPage,'main');
            if (a11ySearching) {
              showSearchCount(thisPage);
              a11ySearching = false;
            }
          }
        }
        else if (thisPage === 'CommunityBoard') {
          if (mutations[i].target.classList.contains('simplebar-content')) {
            // the list of topics has changed
            fixPage(thisPage,'main');
            if (a11ySearching) {
              showSearchCount(thisPage);
              a11ySearching = false;
            }
          }
          else if (mutations[i].target.classList.contains('messages-text')) {
            // user has clicked on a new topic
            fixPage(thisPage,'main');
            // TODO: Consider moving focus to top of the content column?
          }
        }
        else if (thisPage === 'Sponsors') {
          // sponsor-details-header is used interchangeably as a class and id. Frustrating!
          if (mutations[i].target.classList.contains('sponsor-details-header') || mutations[i].target.id == 'sponsor-details-header') {
            // the user has clicked a sponsor
            companyName = document.getElementById('sponsor-details-name').textContent;
            fixPage(thisPage,'main');
            announceViewChange(thisPage,companyName);
          }
        }
        else if (thisPage === 'Exhibitors') {
          // exhibitor-details-header is used interchangeably as a class and id. Frustrating!
          if (mutations[i].target.classList.contains('exhibitor-details-header') || mutations[i].target.id == 'exhibitor-details-header') {
            // the user has clicked an exhibitor
            companyName = document.getElementById('exhibitor-details-name').textContent;
            fixPage(thisPage,'main');
            announceViewChange(thisPage,companyName);
          }
        }
        else if (thisPage === 'Messages') {
          if (mutations[i].target.classList.contains('thread-messages')) {
            // this mutation occurs both when the page first loads
            // and when the user clicks on a message
            fixPage(thisPage,'main');
          }
        }
        else if (thisPage === 'SessionQA') {
          if (mutations[i].target.classList.contains('program-list')) {
            // this mutation occurs when the page first loads
            // If the user clicks on a session (or clicks back)
            // the new page is captured with the 'page-content' mutation
            fixPage(thisPage,'main');
          }
        }
        else if (thisPage === 'VideoGallery') {
          if (mutations[i].target.classList.contains('video-list')) {
            fixPage(thisPage,'main');
            if (a11ySearching) {
              showSearchCount(thisPage);
              a11ySearching = false;
            }
          }
          else if (mutations[i].target.classList.contains('video-gallery')) {
            fixPage(thisPage,'main');
          }
        }
        else if (thisPage === 'Documents') {
          if (mutations[i].target.classList.contains('documents-list')) {
            fixPage(thisPage,'main');
            if (a11ySearching) {
              showSearchCount(thisPage);
              a11ySearching = false;
            }
          }
          else if (mutations[i].target.classList.contains('page-content-padding')) {
            fixPage(thisPage,'main');
          }
        }
        else if (thisPage === 'Polls') {
          if (mutations[i].target.classList.contains('page-content-inner')) {
            fixPage(thisPage,'main');
            if (a11ySearching) {
              showSearchCount(thisPage);
              a11ySearching = false;
            }
          }
        }
        else if (thisPage === 'Speakers') {
          if (mutations[i].target.classList.contains('speakers-page')) {
            fixPage(thisPage,'main');
            if (a11ySearching) {
              showSearchCount(thisPage);
              a11ySearching = false;
            }
          }
        }
        break;
      }
    }
  });
  observerOptions = {
    childList: true,
    attributes: false,
    characterData: false,
    subtree: true
  };
  mutationObserver.observe(document, observerOptions);
}

function getPage() {

    // get the current page from the URL
    // Whova URLs should match this pattern: https://whova.com/portal/webapp/[conference_name]/[page_name]

    var thisPath, pathParts, thisPage;
    thisPage = 'Home';

    thisPath = window.location.pathname;
    pathParts = thisPath.split('/');
    if (pathParts[1] === 'portal' && pathParts[2] === 'webapp') {
      // this path conforms to the expected pattern
      if (pathParts[4] !== '') {
        // standardize on upper case first letter
        if (pathParts[4] === 'exhibitors') {
          thisPage = 'Exhibitors';
        }
        else if (pathParts[4] === 'sponsors') {
          thisPage = 'Sponsors';
        }
        else {
          thisPage = pathParts[4];
        }
      }
    }
    return thisPage;
}

function fixPage(thisPage,scope) {

  // scope is either:
  // 'all' - fix everything
  // 'main' - fix the main content only

  if (a11yDebug) {
    console.log('fixing accessibility on the ' + thisPage + ' page');
  }
  a11yFixingPage = true;

  // Wait a bit for the page to fully load
  // Sometimes this function is called while child nodes are still populating
  setTimeout(function() {
    if (scope === 'all') {
      fixTitle(thisPage);
      fixLandmarks(thisPage);
      addStyle();
      addAlert();
      addEventListeners(thisPage);
    }
    fixImages(thisPage,scope);
    fixHeadings(thisPage,scope);
    fixOther(thisPage,scope);
  }, 2000);

  // Wait a bit (again) while mutations fire as a result of the accessibility fixes
  // Otherwise, the mutations will call this function again
  setTimeout(function() {
    a11yFixingPage = false;
  }, 2000);
}

function fixTitle(thisPage) {

  // All pages have the same title
  // Prepend thisPage to the conference title so each page title is unique
  var currentTitle, newTitle;
  currentTitle = document.getElementsByTagName('title')[0].textContent;

  if (thisPage == 'CommunityBoard') {
    newTitle = 'Community | ' + currentTitle;
  }
  else if (thisPage == 'SessionQA') {
    newTitle = 'Session Q&A | ' + currentTitle;
  }
  else if (thisPage == 'VideoGallery') {
    newTitle = 'Video Gallery | ' + currentTitle;
  }
  else {
    newTitle = thisPage + ' | ' + currentTitle;
  }
  document.getElementsByTagName('title')[0].textContent = newTitle;
}

function fixLandmarks(thisPage,scope) {

  // All content on the page is wrapped in <main>, which is incorrect usage
  // Add role="presentation" to override main, so screen readers will ignore it
  // Use id ('app') to retrieve main; otherwise this function will override our replacement main element
  // if called a second time on the same page

  var main, headerTop, headerBottom, headerParent, header, nav, newMain;

  main = document.getElementById('app');
  if (main) {
    main.setAttribute('role', 'presentation');
  }

  // Add correct ARIA landmark roles

  // The banner is comprised of two sections, and there is no wrapper that contains them both
  // To include both, a new parent needs to be inserted that contains both sections
  headerTop = document.getElementsByClassName('whova-header');
  if (headerTop.length > 0) {
    headerBottom = document.getElementsByClassName('event-name-header');
    headerParent = headerTop[0].parentNode;
    header = document.createElement('header');
    header.setAttribute('role', 'banner');
    header.append(headerTop[0]);
    if (headerBottom.length > 0) {
      header.append(headerBottom[0]);
    }
    headerParent.prepend(header);
  }

  nav = document.getElementsByClassName('sidenav');
  if (nav.length > 0) {
    nav[0].setAttribute('role', 'navigation');
    nav[0].setAttribute('aria-label','Main');
  }

  newMain = document.getElementsByClassName('page-content');
  if (newMain.length > 0) {
    newMain[0].setAttribute('role', 'main');
  }
}

function addStyle() {

  var navListItems, i, css, styles;

  // First, add a class to all anchors in the nav menu
  navListItems = document.getElementsByClassName('side-link-main');
  for (i=0; i < navListItems.length; i++) {
    navListItems[i].parentNode.classList.add('a11y-nav-link');
  }

  // Next, inject a style section with custom CSS

  css = document.createElement('style');

  // Stylize the new h1
  styles = 'h1 { font-size:2em;margin:1em 1em 0 }' + "\n";

  // Make select newly designated level-2 headings more visually prominent
  styles += '.agenda-sessions [aria-level="2"],' + "\n";
  styles += '.attendees-page [aria-level="2"],' + "\n";
  styles += '.speakers-page [aria-level="2"],' + "\n";
  styles += '.documents-header[aria-level="2"]' + "\n";
  styles += '{ font-size:2em !important;font-weight:bold !important }' + "\n";

  // Make select newly designated level-3 headings more visually prominent
  styles += '.exhibitor-list [aria-level="3"],' + "\n";
  styles += '.sponsor-list [aria-level="3"]' + "\n";
  styles += '{ font-size:1.75em;font-weight:bold;height:2em;background-color:#333 }' + "\n";

  // Stylize the new h2 at the top of the left and far right columns on some pages
  styles += '.cb-page h2, #exhibitors-layout-col-0 h2, #sponsors-layout-col-0 h2, .threadlist-root h2, .chat-header ' + "\n";
  styles += '{ font-size:1.5em;font-weight:normal;margin:0;padding:1em 1em 0.2em;border-bottom:1px solid #CCCCCC }' + "\n";

  styles += '.cb-page .add-search { margin:1em 0 }' + "\n";

  // Stylize the topic title at the top of the right column on some pages
  styles += '.cb-page [aria-level="2"] { font-size:1.5em !important;font-weight:normal !important }' + "\n";

  // Stylize the all-purpose live region that appears at the top of main
  styles += '#a11y-alert { font-size:1.5em;font-weight:bold;background-color:#FFFFCC;border:2px solid #340449;padding:0.75em;margin:0.25em 0.25em 1em;display:none }' + "\n";

  // Add visible focus indicator to banner and main (see below for nav)
  styles += '[role="banner"] a:focus, [role="main"] a:focus, [role="main"] button:focus, [role="button"]:focus {' + "\n";
  styles += '  border: 3px solid #94BFF9 !important;' + "\n";
  styles += '  border-radius: 3px;' + "\n";
  styles += '  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 3px rgba(102, 175, 233, 0.6);' + "\n";
  styles += '  outline: 0 none' + "\n";
  styles += '} ' + "\n";

  // The above focus indicator causes problems within the nav menu
  // Override with this alternative
  styles += 'div.sidenav .side-link-main:hover, div.sidenav a.a11y-nav-link:focus li {' + "\n";
  styles += '  border: none !important;' + "\n";
  styles += '  box-shadow: none !important;' + "\n";
  styles += '  background-color: black !important;' + "\n";
  styles += '  color: white !important;' + "\n";
  styles += '} ' + "\n";

  // Append styles, allowing for browser differences
  if (css.styleSheet) {
    css.styleSheet.cssText = styles;
  }
  else {
    css.appendChild(document.createTextNode(styles));
  }

  // Append to the head
  document.getElementsByTagName("head")[0].appendChild(css);

}

function addAlert() {

  // add an empty live region for writing status messages
  // Position it at the top of the main content
  var alertDiv;

  if (!document.getElementById('a11y-alert')) {
    alertDiv = document.createElement('div');
    alertDiv.setAttribute('aria-live','polite');
    alertDiv.setAttribute('aria-atomic','true');
    alertDiv.setAttribute('id','a11y-alert');
    if (document.getElementsByClassName('page-content').length) {
      document.getElementsByClassName('page-content')[0].prepend(alertDiv);
    }
    else if (document.getElementById('app')) {
      document.getElementById('app').prepend(alertDiv);
    }
  }
}

function fixImages(thisPage) {

  var images, i;

  // Add alt to known informative images
  images = document.getElementsByTagName('img');
  for (i = 0; i < images.length; i++) {
    if (images[i].getAttribute('alt') == null) {

      if (images[i].classList.contains('whova-logo')) {
        images[i].setAttribute('alt','Whova');
      }
      else if (thisPage === 'Home') {
        if (images[i].classList.contains('event-banner-web')) {
          images[i].setAttribute('alt','Accessing Higher Ground Accessible Media, Web & Technology Conference. Presented by AHEAD in collaboration with ATHEN');
        }
      }
      else if (thisPage === 'Attendees' || thisPage === 'Speakers') {
        // Add alt to view icons (for switching between Grid View & List View)
        if (images[i].classList.contains('view-icon')) {
          // There are two images with this class; need to consult src attribute
          if (images[i].getAttribute('src') == '/static/app_frontend/webapp/selected-grid.png') {
            images[i].setAttribute('alt','Grid View');
          }
          else if (images[i].getAttribute('src') == '/static/app_frontend/webapp/list.png') {
            images[i].setAttribute('alt','List View');
          }
        }
        else if (images[i].classList.contains('arrow')) {
          // Add alt to arrow icons in pagination feature at bottom of the page
          // There are two images with this class; need to consult src attribute
          if (images[i].getAttribute('src') == '/static/app_frontend/webapp/previous.png') {
            images[i].setAttribute('alt','Previous Attendees Page');
          }
          else if (images[i].getAttribute('src') == '/static/app_frontend/webapp/next.png') {
            images[i].setAttribute('alt','Next Attendees Page');
          }
        }
        else {
          // All other images are believed to be decorative
          images[i].setAttribute('alt','');
        }
      }
      else {
        // All other images are believed to be decorative
        images[i].setAttribute('alt','');
      }
    }
  }
}

function fixHeadings(thisPage,scope) {

  var eventName, eventH2, main, i, h1, h2, h3, h2s, h3s, h4s, textContent, personLinks, personLinkParent, leftColumn;

  // The event name is an h2, but shouldn't be a heading at all
  if (scope == 'all') {
    // should only need to do this once
    if (document.getElementsByClassName('event-name-info').length > 0) {
      eventName = document.getElementsByClassName('event-name-info')[0];
      eventH2 = eventName.querySelectorAll('h2');
      if (eventH2.length > 0) {
        eventH2[0].setAttribute('role','presentation');
      }
    }
  }

  // Add a visible H1 heading to main (if it hasn't already been done)
  if (document.getElementsByTagName('h1').length === 0) {
    main = document.getElementsByClassName('page-content');
    if (main.length > 0) {
      h1 = document.createElement('h1');
      if (thisPage == 'CommunityBoard') {
        h1.textContent = 'Community';
      }
      else if (thisPage == 'SessionQA') {
        h1.textContent = 'Session Q&A';
      }
      else if (thisPage == 'VideoGallery') {
        h1.textContent = 'Video Gallery';
      }
      else if (thisPage == 'WhovaGuides') {
        h1.textContent = 'Whova Guides';
      }
      else {
        h1.textContent = thisPage;
      }
      main[0].prepend(h1);
    }
  }

  // Page-specific enhancements

  if (thisPage == 'Agenda') {

    // Convert times to h2 headings
    h2s = document.getElementsByClassName('start-timestamp-header');
    for (i=0; i < h2s.length; i++) {
      h2s[i].setAttribute('role','heading');
      h2s[i].setAttribute('aria-level','2');
    }

    // Convert session titles to h3 headings
    h3s = document.getElementsByClassName('icon-title');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }
  }
  else if (thisPage == 'Attendees') {
    // Convert letters of the alphabet to h2 headings
    h2s = document.getElementsByClassName('last-initial-header');
    for (i=0; i < h2s.length; i++) {
      h2s[i].setAttribute('role','heading');
      h2s[i].setAttribute('aria-level','2');
    }

    // Attendee names are currently links
    // Wrap each of these links in an h3
    personLinks = document.getElementsByClassName('attendee-name');
    for (i=0; i < personLinks.length; i++) {
      personLinkParent = personLinks[i].parentNode;
      h3 = document.createElement('h3');
      h3.appendChild(personLinks[i]);
      personLinkParent.prepend(h3);
    }
  }
  else if (thisPage == 'CommunityBoard') {

    // Add an h2 heading "List of Topics" at the top of the left column
    // if it doesn't already exist
    leftColumn = document.getElementsByClassName('left-container');
    if (leftColumn.length > 0) {
      if (!(leftColumn[0].querySelectorAll('h2').length)) {
        h2 = document.createElement('h2');
        h2.textContent = 'List of Topics';
        leftColumn[0].prepend(h2);
      }
    }

    // Make the existing big bold text at the top of the right column an h2
    // and preface it with "Selected Topic: "
    h2 = document.getElementsByClassName('topic-title');
    if (h2.length > 0) {
      h2[0].textContent = 'Selected Topic: ' + h2.textContent;
      h2[0].setAttribute('role','heading');
      h2[0].setAttribute('aria-level','2');
    }

    // Convert each topic in list to h3 heading
    h3s = document.getElementsByClassName('title');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }
  }
  else if (thisPage == 'Sponsors') {

    // Add an h2 heading "List of Sponors" at the top of the left column
    // if it doesn't already exist
    leftColumn = document.getElementById('sponsors-layout-col-0');
    if (leftColumn) {
      if (!(leftColumn.querySelectorAll('h2').length)) {
        h2 = document.createElement('h2');
        h2.textContent = 'List of Sponsors';
        leftColumn.prepend(h2);
      }
    }

    // Convert letters of the alphabet to h3 headings
    h3s = document.getElementsByClassName('company-list-item-header');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }

    // Convert exhibitor names to h4 headings
    h4s = document.getElementsByClassName('sponsor-name');
    for (i=0; i < h4s.length; i++) {
      h4s[i].setAttribute('role','heading');
      h4s[i].setAttribute('aria-level','4');
    }

    // Convert main heading (exhibitor name) to h2 heading
    // and preface it with "Selected Sponsor: "
    h2 = document.getElementById('sponsor-details-name');
    if (h2) {
      h2.textContent = 'Selected Sponsor: ' + h2.textContent;
      h2.setAttribute('role','heading');
      h2.setAttribute('aria-level','2');
    }

    // Convert heading "Chat" to h2 heading
    h2 = document.getElementsByClassName('chat-header');
    if (h2.length > 0) {
      h2[0].setAttribute('role','heading');
      h2[0].setAttribute('aria-level','2');
    }
  }
  else if (thisPage == 'Exhibitors') {

    // Add an h2 heading "List of Exhibitors" at the top of the left column
    // if it doesn't already exist
    leftColumn = document.getElementById('exhibitors-layout-col-0');
    if (leftColumn) {
      if (!(leftColumn.querySelectorAll('h2').length)) {
        h2 = document.createElement('h2');
        h2.textContent = 'List of Exhibitors';
        leftColumn.prepend(h2);
      }
    }

    // Convert letters of the alphabet to h3 headings
    h3s = document.getElementsByClassName('company-list-item-header');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }

    // Convert exhibitor names to h4 headings
    h4s = document.getElementsByClassName('exhibitor-name');
    for (i=0; i < h4s.length; i++) {
      h4s[i].setAttribute('role','heading');
      h4s[i].setAttribute('aria-level','4');
    }

    // Convert main heading (exhibitor name) to h2 heading
    // and preface it with "Selected Exhibitor: "
    h2 = document.getElementById('exhibitor-details-name');
    if (h2) {
      h2.textContent = 'Selected Exhibitor: ' + h2.textContent;
      h2.setAttribute('role','heading');
      h2.setAttribute('aria-level','2');
    }

    // Convert heading "Chat" to h2 heading
    h2 = document.getElementsByClassName('chat-header');
    if (h2.length > 0) {
      h2[0].setAttribute('role','heading');
      h2[0].setAttribute('aria-level','2');
    }
  }
  else if (thisPage == 'Messages') {

    // Add an h2 heading "List of Messages" at the top of the left column
    // if it doesn't already exist
    leftColumn = document.getElementsByClassName('threadlist-root');
    if (leftColumn.length > 0) {
      if (!(leftColumn[0].querySelectorAll('h2').length)) {
        h2 = document.createElement('h2');
        h2.textContent = 'List of Messages';
        leftColumn[0].prepend(h2);
      }
    }

    // Convert sender names to h3 headings
    h3s = document.getElementsByClassName('threadlist-name');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }

    // Convert main heading (sender name) to h2 heading
    // and preface it with "Selected Message: "
    h2 = document.getElementById('thread-recv-name');
    if (h2) {
      h2.textContent = 'Selected Message: ' + h2.textContent;
      h2.setAttribute('role','heading');
      h2.setAttribute('aria-level','2');
    }
  }
  else if (thisPage == 'SessionQA') {

    // Convert section headings to h2
    h2s = document.getElementsByClassName('text-sm');
    for (i=0; i < h2s.length; i++) {
      h2s[i].setAttribute('role','heading');
      h2s[i].setAttribute('aria-level','2');
    }

    // Convert session names to h3 headings
    h3s = document.getElementsByClassName('sname');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }
  }
  else if (thisPage == 'VideoGallery') {

    // Fix things
  }
  else if (thisPage == 'Documents') {

    // Convert section headings to h2
    h2s = document.getElementsByClassName('documents-header');
    for (i=0; i < h2s.length; i++) {
      h2s[i].setAttribute('role','heading');
      h2s[i].setAttribute('aria-level','2');
    }
  }
  else if (thisPage == 'Polls') {

    // Fix things
  }
  else if (thisPage == 'Speakers') {

    // Convert letters of the alphabet to h2 headings
    h2s = document.getElementsByClassName('last-initial-header');
    for (i=0; i < h2s.length; i++) {
      h2s[i].setAttribute('role','heading');
      h2s[i].setAttribute('aria-level','2');
    }
    // Convert speaker names to h3 headings
    h3s = document.getElementsByClassName('speaker-name');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }
  }
  else if (thisPage == 'Surveys') {

    // Fix things
  }
}

function fixModalDialog(thisPage) {

  // Whova has lots of different dialogs,
  // some more accessible than others

  var dialog, dialogId, title, titleId, closeButton;


  if (thisPage == 'Attendees' || thisPage == 'Speakers') {

    // Both pages use the same dialog, which already has some accessibility
    // The outer container has role="dialog"
    // An inner container has role="document"
    // The dialog is a child of body
    // & all other page content has aria-hidden="true" when the dialog is open

    // The dialog has a visible heading
    // Add an id to that heading, then reference it with aria-labelledby on the outer container
    dialog = document.getElementsByClassName('modal');
    if (dialog.length > 0) {
      // the dialog has a unique id - resuse that for the heading id
      dialogId = dialog[0].getAttribute('id');
      title = document.getElementsByClassName('modal-title');
      if (title.length) {
        titleId = dialogId + '-title';
        title[0].setAttribute('id',titleId);
        // Title is also an h4 heading; should be h1 since modal is now the entire document
        title[0].setAttribute('role','heading');
        title[0].setAttribute('aria-level','1');
        dialog[0].setAttribute('aria-labelledby',titleId);
      }
      // Place focus on the first focusable element (the close button)
      closeButton = document.getElementsByClassName('close');
      if (closeButton.length === 1) {
        closeButton[0].focus();
      }
    }
  }
  else if (thisPage == 'VideoGallery') {
    // TODO: Fix the dialog that pops up when users click a video
    // It has some accessibility (similar to Attendees), but is different
  }
  else if (thisPage === 'CommunityBoard') {
    // TODO: Fix the dialog that pops up with "Add a topic or social group"
  }
  else if (thisPage === 'Agenda') {
    // TODO: Fix the dialog that pops up when user clicks the "Add to my agenda" button
  }

  // TODO: Add support for Escape key to close dialogs

  // TODO: Fix keyboard focus. User can tab between dialog buttons,
  // but focus can leave the dialog.
  // Also, elements within the dialog that should be included in the tab order (e.g., links)
  // are not focusable.

}

function fixOther(thisPage,scope) {

  var i, j, k, chat, docsLists, docsItems, docsPreviews;

  if (thisPage == 'Agenda') {

    // The navigation buttons at the top of the agenda are just divs
    // Make the buttons, and add them to the tab order
    var fullAgendaButton = document.getElementById('agenda-type-full-btn');
    makeButton(fullAgendaButton,thisPage);

    var myAgendaButton = document.getElementById('agenda-type-personal-btn');
    makeButton(myAgendaButton,thisPage);

    var rehearsalButton = document.getElementById('agenda-type-rehearsal-btn');
    makeButton(rehearsalButton,thisPage);

    var dayButtons = document.getElementsByClassName('agenda-date-tab');
    for (i=0; i < dayButtons.length; i++) {
      makeButton(dayButtons[i],thisPage);
    }
    // NOTE: Choosing not to expose the arrow buttons
    // They provide no advantage for screen reader users or keyboard users
    /*
    var leftArrow = document.getElementById('tab-arrow-left');
    if (leftArrow) {
      leftArrow.setAttribute('role','button');
      leftArrow.setAttribute('tabindex','0');
      leftArrow.setAttribute('aria-label','Previous date');
    }
    var rightArrow = document.getElementById('tab-arrow-right');
    if (rightArrow) {
      rightArrow.setAttribute('role','button');
      rightArrow.setAttribute('tabindex','0');
      rightArrow.setAttribute('aria-label','Next date');
    }
    */
  }


  else if (thisPage == 'Exhibitors') {

    // TODO: The list of Exhibitors is comprised of entirely of unfocusable divs.
    // The entire div is clickable, and loads that exhibitor's content in the adjacent panel

    // TODO: Make the chat an ARIA live region
    //  Add aria-live="polite" and aria-atomic="false" to the chat region
    chat = document.getElementsByClassName('chat');
    if (chat.length > 0) {
      chat[0].setAttribute('aria-live','polite');
      chat[0].setAttribute('aria-atomic','false');
    }
  }
  else if (thisPage == 'SessionQA') {

    // "View questions" links behave like links, but look like buttons
    // They're coded as buttons inside of links
    // TODO: Add role="presentation" to the button? Setup a screen reader test first to see what works

  }
  else if (thisPage == 'Documents') {

    // Change the list of documents into an actual list
    docsLists = document.getElementsByClassName('documents-list');
    if (docsLists.length > 0) {
      docsItems = document.getElementsByClassName('document-item');
      if (docsItems.length > 0) {
        for (i=0; i < docsLists.length; i++) {
          docsLists[i].setAttribute('role','list');
        }
        for (j=0; j < docsItems.length; j++) {
          docsItems[j].setAttribute('role','listitem');
        }
      }
    }

    // Hide all document previews from screen reader users
    docsPreviews = document.getElementsByClassName('document-preview');
    if (docsPreviews.length) {
      for (k=0; k < docsPreviews.length; k++) {
        docsPreviews[k].setAttribute('aria-hidden','true');
      }
    }
  }
}

function makeButton(el,thisPage) {

  // make an accessible interactive button out of element el
  if (el) {
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    if (el.classList.contains('active')) {
      // this is the selected button within its group
      // add ARIA to communicate that to screen reader users
      el.setAttribute('aria-current','page');
    }
    el.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 || event.keyCode == 32) { // Enter or space
        event.preventDefault();
        // Emulate a mouse click on the element. Whova will do the rest.
        el.click();
        // Agenda will refresh; need to fix the page again
        fixPage(thisPage,'main');
        showSearchCount(thisPage);
      }
    });
  }
}

function addEventListeners(thisPage) {

  var searchFields, k;

  // Add an event listener to all search fields
  searchFields = document.getElementsByClassName('form-control');
  for (k=0; k < searchFields.length; k++) {
    searchFields[k].addEventListener('keydown', function() {
      a11ySearching = true;
    });
  }
}

function showSearchCount(thisPage) {

  // Called after the page has been updated
  // due to the user typing a character in the search field
  // or selecting a filter (e.g., in the Agenda)
  // Count the relevant results, and display a message in the alertDiv

  // NOTE: The search feature is buggy in Whova. Example:
  // Start with 99 sessions.
  // Type a letter, narrow the results to 30 sessions.
  // Type a second letter, the results goes back to 99.
  // With each subsequent letter, the results narrow as expected
  // So, the second letter seems to be the problem

  var results, msg, alertDiv;

  alertDiv = document.getElementById('a11y-alert');
  if (alertDiv) {

    setTimeout(function() {
      if (thisPage == 'Agenda') {
        results = document.getElementsByClassName('session');
        msg = 'Showing ' + results.length + ' sessions';
      }
      else if (thisPage == 'Attendees') {
        results = document.getElementsByClassName('attendee-content');
        msg = 'Showing ' + results.length + ' attendees';
      }
      else if (thisPage == 'CommunityBoard') {
        results = document.getElementsByClassName('single-topic');
        msg = 'Showing ' + results.length + ' topics';
      }
      else if (thisPage == 'Exhibitors') {
        results = document.getElementsByClassName('exhibitor-list-item');
        msg = 'Showing ' + results.length + ' exhibitors';
      }
      else if (thisPage == 'Messages') {
        results = document.getElementsByClassName('threadlist-container');
        msg = 'Showing ' + results.length + ' messages';
      }
      else if (thisPage == 'SessionQA') {
        results = document.getElementsByClassName('one-session-qa-program');
        msg = 'Showing ' + results.length + ' sessions';
      }
      else if (thisPage == 'Videos') {
        results = document.getElementsByClassName('video-info');
        msg = 'Showing ' + results.length + ' videos';
      }
      else if (thisPage == 'Documents') {
        results = document.getElementsByClassName('document-item');
        msg = 'Showing ' + results.length + ' documents';
      }
      else if (thisPage == 'Polls') {
        results = document.getElementsByClassName('polls-item');
        msg = 'Showing ' + results.length + ' polls';
      }
      else if (thisPage == 'Speakers') {
        results = document.getElementsByClassName('speaker-content');
        msg = 'Showing ' + results.length + ' speakers';
      }
      alertDiv.textContent = msg;
      alertDiv.style.display = 'block';
    },1000);
  }
}

function announceViewChange(thisPage,label) {

  // called when select mutations are observed,
  // indicating that user has clicked on an item that initiates a page view
  // populates live region with a message so user receives feedback about their action
  // label is a name/label that identifies the new content that has loaded
  var msg, alertDiv;

  alertDiv = document.getElementById('a11y-alert');
  if (alertDiv) {

    if (thisPage == 'Sponsors' || thisPage == 'Exhibitors') {
      if (typeof label !== 'undefined') {
        if (label.substr(0,8) === 'Selected') {
          // A preface has already been added to the label
          // Remove that from the message
          label.slice(label.lastIndexOf(':') + 2);
        }
        msg = 'Now showing ' + label + '. ';
        msg += 'The new content is marked with a level 2 heading.';
        alertDiv.textContent = msg;
        alertDiv.style.display = 'block';
      }
    }
  }
}

