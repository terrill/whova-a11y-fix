// ==UserScript==
// @name         Whova Accessibility Fix
// @namespace    https://github.com/terrill/whova-a11y-fix
// @version      1.0
// @homepage     https://terrillthompson.com
// @updateURL    https://raw.githubusercontent.com/terrill/whova-a11y-fix/main/whova.js
// @downloadURL  https://raw.githubusercontent.com/terrill/whova-a11y-fix/main/whova.js
// @description  Fixes accessibility issues in Whova's web app
// @author       Terrill Thompson <tft@uw.edu>
// @match        https://whova.com/portal/webapp/*
// ==/UserScript==

(function() {

    var i, thisPage, prevPage, mutationObserver, observerOptions;

    // NOTE: Fixes are not preserved as the user navigates from page to page in Whova
    // Therefore, fixes need to be implemented EVERY TIME a new page loads

    // Whova changes pages/views without a new page load
    // To determine when the page/view has changed significantly, we need to:
    // 1. Set a mutationObserver to watch for changes. If they occur:
    //   a) Check the URL (a change in URL = a new page)
    //   b) Check for specific mutations (e.g., an open dialog)

    // Wait until page has loaded before doing anything
    window.addEventListener('load',function() {

        // Fix the current page
        thisPage = getPage();
        fixPage(thisPage);
        prevPage = thisPage;

        // Use a MutationObserver to watch for changes to the page
        mutationObserver = new MutationObserver(function(mutations) {
          // mutations were observed
          thisPage = getPage();

          if (thisPage !== prevPage) {
            // the URL has changed. This is a new page.
            fixPage(thisPage);
            prevPage = thisPage;
          }
          else {
            // Check all same-page mutations
            // i.e., this is not a new page, but something has changed
            for (i=0; i< mutations.length; i++) {
              // Uncomment the following line to see all mutations
              // console.log('Mutation ' + i + ': ',mutations[i].target);

              if (mutations[i].target.className == 'modal-open') {
                // A modal dialog has popped up
                fixModalDialog();
              }
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
    });

})();

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
        thisPage = pathParts[4];
      }
    }
    return thisPage;
}

function fixPage(thisPage) {

  // wait briefly to give new page content time to fully load
  var waitTime = 1000;
  setTimeout(function() {

    fixTitle(thisPage);
    addStyle();
    fixImages(thisPage);
    fixLandmarks(thisPage);
    fixHeadings(thisPage);
    addAlert();
    fixOther(thisPage);
    addEventListeners(thisPage);

  }, waitTime);
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

function addStyle() {

  // inject a style section with custom CSS

  var css, styles;

  css = document.createElement('style');

  // Stylize the new h1
  styles = 'h1 { font-size:2em;margin:1em 1em 0 }' + "\n";

  // Make select newly designated level-2 headings more visually prominent
  styles += '.agenda-sessions [aria-level="2"],' + "\n";
  styles += '.attendees-page [aria-level="2"],' + "\n";
  styles += '.speakers-page [aria-level="2"]' + "\n";
  styles += '{ font-size:2em !important;font-weight:bold !important }' + "\n";

  // Stylize the new h2 at the top of the left and far right columns on some pages
  styles += '.cb-page h2, #exhibitors-layout-col-0 h2, .threadlist-root h2, .chat-header ' + "\n";
  styles += '{ font-size:1.5em;font-weight:normal;margin:0;padding:1em 1em 0.2em;border-bottom:1px solid #CCCCCC }' + "\n";

  styles += '.cb-page .add-search { margin:1em 0 }' + "\n";

  // Stylize the topic title at the top of the right column on some pages
  styles += '.cb-page [aria-level="2"] { font-size:1.5em !important;font-weight:normal !important }' + "\n";

  // Stylize the all-purpose live region that appears at the top of main
  styles += '#a11y-alert { font-size:1.5em;font-weight:bold;background-color:#FFFFCC;border:2px solid #340449;padding:0.75em;margin:0.25em 0.25em 1em;display:none }' + "\n";

  // Add visible focus indicator
  styles += 'a:focus, button:focus, [role="button"]:focus {' + "\n";
  styles += '  border: 3px solid #94BFF9 !important;' + "\n";
  styles += '  border-radius: 3px;' + "\n";
  styles += '  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 3px rgba(102, 175, 233, 0.6);' + "\n";
  styles += '  outline: 0 none' + "\n";
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
    if (document.getElementsByClassName('page-content')) {
      document.getElementsByClassName('page-content')[0].prepend(alertDiv);
    }
    else {
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

      // Images in Whova are reliably identifiable by their class
      if (images[i].getAttribute('class') == 'whova-logo') {
        images[i].setAttribute('alt','Whova');
      }
      else if (thisPage == 'Attendees' || thisPage == 'Speakers') {
        // Add alt to view icons (for switching between Grid View & List View)
        if (images[i].getAttribute('class') == 'view-icon') {
          // There are two images with this class; need to consult src attribute
          if (images[i].getAttribute('src') == '/static/app_frontend/webapp/selected-grid.png') {
            images[i].setAttribute('alt','Grid View');
          }
          else if (images[i].getAttribute('src') == '/static/app_frontend/webapp/list.png') {
            images[i].setAttribute('alt','List View');
          }
        }
        else if (images[i].getAttribute('class') == 'arrow') {
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
      else if (thisPage == 'CommunityBoard') {
        images[i].setAttribute('alt','');
      }
      else if (thisPage == 'Exhibitors') {
        images[i].setAttribute('alt','');
      }
      else if (thisPage == 'Messages') {
        images[i].setAttribute('alt','');
      }
      else if (thisPage == 'VideoGallery') {
        images[i].setAttribute('alt','');
      }
      else if (thisPage == 'Documents') {
        images[i].setAttribute('alt','');
      }
      else if (thisPage == 'Polls') {
        images[i].setAttribute('alt','');
      }
      else if (thisPage == 'Surveys') {
        images[i].setAttribute('alt','');
      }
    }
  }
}

function fixLandmarks(thisPage) {

  // All content on the page is wrapped in <main>, which is incorrect usage
  // Add role="presentation" to override main, so screen readers will ignore it
  // Use id ('app') to retrieve main; otherwise this function will override our replacement main element
  // if called a second time on the same page

  var main, headerTop, headerBottom, headerParent, header, nav, newMain;

  main = document.getElementById('app');
  if (typeof main !== 'undefined') {
    main.setAttribute('role', 'presentation');
  }

  // Add correct ARIA landmark roles

  // The banner is comprised of two sections, and there is no wrapper that contains them both
  // To include both, a new parent needs to be inserted that contains both sections
  headerTop = document.getElementsByClassName('whova-header')[0];
  headerBottom = document.getElementsByClassName('event-name-header')[0];
  if (typeof headerTop !== 'undefined') {
    headerParent = headerTop.parentNode;
    header = document.createElement('header');
    header.setAttribute('role', 'banner');
    header.append(headerTop);
    if (typeof headerBottom !== 'undefined') {
      header.append(headerBottom);
    }
    headerParent.prepend(header);
  }

  nav = document.getElementsByClassName('sidenav')[0];
  if (typeof nav !== 'undefined') {
    nav.setAttribute('role', 'navigation');
  }

  newMain = document.getElementsByClassName('page-content')[0];
  if (typeof newMain !== 'undefined') {
    newMain.setAttribute('role', 'main');
  }
}

function fixHeadings(thisPage) {

  var main, i, h1, h2, h3, h2s, h3s, h4s, textContent, personLinks, personLinkParent, leftColumn;

  // Add a visible H1 heading to main (if it hasn't already been done)
  if (document.getElementsByTagName('h1').length === 0) {
    main = document.getElementsByClassName('page-content')[0];
    if (typeof main !== 'undefined') {
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
      main.prepend(h1);
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
    leftColumn = document.getElementsByClassName('left-container')[0];
    if (typeof leftColumn !== 'undefined') {
      h2 = document.createElement('h2');
      h2.textContent = 'List of Topics';
      leftColumn.prepend(h2);
    }

    // Make the existing big bold text at the top of the right column an h2
    // and preface it with "Selected Topic: "
    h2 = document.getElementsByClassName('topic-title')[0];
    h2.textContent = 'Selected Topic: ' + h2.textContent;
    h2.setAttribute('role','heading');
    h2.setAttribute('aria-level','2');

    // Convert each topic in list to h3 heading
    h3s = document.getElementsByClassName('title');
    for (i=0; i < h3s.length; i++) {
      h3s[i].setAttribute('role','heading');
      h3s[i].setAttribute('aria-level','3');
    }
  }
  else if (thisPage == 'Exhibitors') {

    // Add an h2 heading "List of Exhibitors" at the top of the left column
    leftColumn = document.getElementById('exhibitors-layout-col-0');
    if (typeof leftColumn !== 'undefined') {
      h2 = document.createElement('h2');
      h2.textContent = 'List of Exhibitors';
      leftColumn.prepend(h2);
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
    if (typeof h2 !== 'undefined') {
      h2.textContent = 'Selected Exhibitor: ' + h2.textContent;
      h2.setAttribute('role','heading');
      h2.setAttribute('aria-level','2');
    }

    // Convert heading "Chat" to h2 heading
    h2 = document.getElementsByClassName('chat-header')[0];
    h2.setAttribute('role','heading');
    h2.setAttribute('aria-level','2');

  }
  else if (thisPage == 'Messages') {

    // Add an h2 heading "List of Messages" at the top of the left column
    leftColumn = document.getElementsByClassName('threadlist-root')[0];
    if (typeof leftColumn !== 'undefined') {
      h2 = document.createElement('h2');
      h2.textContent = 'List of Messages';
      leftColumn.prepend(h2);
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
    if (typeof h2 !== 'undefined') {
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

  // TODO: Make modal dialogs more accessible.
  // This function is called each time a dialog appears,
  // detected via the mutation observer
  // If page includes a pop-up dialog, make that more accessible
  // Example: On Attendees page, there's a "View Profile" dialog
  // Add id to dialog title
  // Add aria-labelled to outer dialog element
  // Add support for Escape key to close the dialog
  // Trap keyboard focus

}

function fixOther(thisPage) {

  var i, chat;

  // TODO: If page contains a #message_form, make that more accessible:
  // Add role="form" so it appears as an ARIA landmark
  // Add aria-label="Message Form"
  // Add role="input" and aria-label="Enter message here" to the message field

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
    if (typeof leftArrow !== 'undefined') {
      leftArrow.setAttribute('role','button');
      leftArrow.setAttribute('tabindex','0');
      leftArrow.setAttribute('aria-label','Previous date');
    }
    var rightArrow = document.getElementById('tab-arrow-right');
    if (typeof rightArrow !== 'undefined') {
      rightArrow.setAttribute('role','button');
      rightArrow.setAttribute('tabindex','0');
      rightArrow.setAttribute('aria-label','Next date');
    }
    */
  }


  else if (thisPage == 'Exhibitors') {

    // Make the chat an ARIA live region
    //  Add aria-live="polite" and aria-atomic="false" to the chat region
    chat = document.getElementsByClassName('chat')[0];
    chat.setAttribute('aria-live','polite');
    chat.setAttribute('aria-atomic','false');
  }
  else if (thisPage == 'SessionQA') {

    // "View questions" links behave like links, but look like buttons
    // They're coded as buttons inside of links
    // TODO: Add role="presentation" to the button? Setup a screen reader test first to see what works

  }
  else if (thisPage == 'Documents') {

    // Documents previews are presented in a <canvas> element, followed by a link
    // TODO: Test the previews to see if they're announced at all by screen readers
    // If needed, could add role="presentation" to an outer div
    // Also, add role="list" and role="listitem" to outer divs
  }
}

function makeButton(el,thisPage) {

  // make an accessible interactive button out of element el
  if (typeof el !== 'undefined') {
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 || event.keyCode == 32) { // Enter or space
        event.preventDefault();
        // Emulate a mouse click on the element. Whova will do the rest.
        el.click();
        // Agenda will refresh; need to fix the page again
        fixPage(thisPage);
        countSearchResults(thisPage);
      }
    });
  }
}

function addEventListeners(thisPage) {

  var i, j, k, pageLinks, searchFields;
  if (thisPage == 'Agenda') {
    // See makeButton() for event listeners on agenda buttons
  }
  else if (thisPage == 'Attendees') {
    // Add event listener for clicks and keydowns on pagination links
    pageLinks = document.querySelectorAll('ul.pagination li a');
    for (i=0; i < pageLinks.length; i++) {
      j = i;
      pageLinks[i].addEventListener('click', function() {
        // attendee list will refresh. fix the page again
        fixPage(thisPage);
      });
      pageLinks[j].addEventListener('keydown', function(event) {
        if (event.keyCode === 13 || event.keyCode == 32) { // Enter or space
          event.preventDefault();
          pageLinks[j].click();
          fixPage(thisPage);
        }
      });
    }
  }
  // Add an event listener to all search fields
  searchFields = document.getElementsByClassName('form-control');
  for (k=0; k < searchFields.length; k++) {
    searchFields[k].addEventListener('keydown', function() {
      countSearchResults(thisPage);
    });
  }
}

function countSearchResults(thisPage) {

  // wait briefly, for search results to refresh
  // then count them, and display results in the alertDiv

  // NOTE: The search feature is buggy in Whova. Example:
  // Start with 99 sessions.
  // Type a letter, narrow the results to 30 sessions.
  // Type a second letter, the results goes back to 99.
  // With each subsequent letter, the results narrow as expected
  // So, the second letter seems to be the problem

  var results, msg, alertDiv;

  alertDiv = document.getElementById('a11y-alert');
  if (typeof alertDiv !== 'undefined') {

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
      else if (thisPage == 'Videos') {
        results = document.getElementsByClassName('video-info');
        msg = 'Showing ' + results.length + ' videos';
      }
      else if (thisPage == 'Videos') {
        results = document.getElementsByClassName('video-info');
        msg = 'Showing ' + results.length + ' videos';
      }
      else if (thisPage == 'Videos') {
        results = document.getElementsByClassName('video-info');
        msg = 'Showing ' + results.length + ' videos';
      }
      alertDiv.textContent = msg;
      alertDiv.style.display = 'block';
    },1000);
  }
}

