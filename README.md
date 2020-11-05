Whova Accessibility Fix
==============================

This user script was created on behalf of the 2020 [Accessing Higher Ground][] conference 
to fix the highest priority accessibility issues in the Whova web app. It was based entirely on this one conference experience; it has not been tested with other events that use the Whova app.  

Issues Addressed by this Script
---------------------------------------

* Adds headings
* Adds ARIA landmarks
* Adds unique titles for each page
* Changes clickable div elements into buttons and makes them keyboard-focusable
* Adds alt text to informative images, and empty alt to decorative images
* Improves accessibility of chat interfaces using ARIA live regions
* As a user filters results by typing into a search field or selecting other filters, a message is written to an ARIA live region indicating the new results count.  

How to Use This Script
----------------------

1. Install a userscript manager browser extension, such as [Tampermonkey for Chrome][] or [Tampermonkey for Firefox][]. 
2. Go to the [raw source code] of the Whova Accessibility Fix script.
3. Select All, then copy. 
4. In your browser, click the Tampermonkey icon in your browser's toolbar, then select "Create a new script" from the popup menu. 
5. This will place you in a code editor, which is pre-populated with a userscript template. 
6. Select All to remove the template code, then press Delete. 
7. Paste the code that you copied in Step 2. 
8. Save the script (by selecting File > Save from the menu, or Cmd + S in Mac OS browsers, or Ctrl + S in Windows browsers). 
9. After you have saved the script, it's now installed and running in the background. When you login to the [Whova web app][] the script will automatically run behind the scenes, resulting in a more accessible Whova experience. 

AHG Conference Attendees: If you need help installing the script, please contact me (Terrill, [tft@uw.edu][]) and I'll be happy to assist. 

Keeping Up with Updates
------------------------ 

After installing the script, I recommend checking at least once daily for updates as we will be continually working to improve it throughout the conference. To do this, click the Tampermonkey icon in your browser's toolbar, then select "Check for userscript updates". 

Reporting Bugs or Feature Requests
----------------------------------

To report bugs or submit feature requests, please use go to the [Github Issues] page, and select the "New Issue" link. This is a volunteer effort, so we can't guarantee that we'll be able to address all issues, but we'll do our best. 

Contributing
-------------------

I welcome contributions, and particularly encourage AHG attendees to help make the conference more accessible! 
I'll be working to improve the script throughout the conference, which ends November 19, 2020. If you'd like to help, just let me know. I can be reached by email at [tft@uw.edu][] or via Twitter, [@terrillthompson][]. 

Or simply submit a pull request. 

Providing Feedback to Whova
--------------------------- 

Paying customers should not have to go to such extraordinary lengths to fix a broken application. The Accessing Higher Ground program committee reported all of the issues fixed by this script to Whova, but they made no known effort to fix the problems, nor did they provide any indication of when they might be able to fix the issues, despite our multiple requests for this information. 

Please feel free to express your disappointment with Whova via any of the following channels:
* Twitter: [@WhovaSupport][] 
* Email: [support@whova.com][]
* Email: [tim@whova.io][] Tim Sheng, Whova's co-founder


[Accessing Higher Ground]: https://accessinghigherground.org
[tft@uw.edu]: mailto:tft@uw.edu
[@terrillthompson]: https://twitter.com/terrillthompson
[Github Issues]: https://github.com/terrill/whova-a11y-fix/issues
[Greasemonkey for Firefox]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[raw source code]: https://raw.githubusercontent.com/terrill/whova-a11y-fix/main/user.js
[support@whova.com]: mailto:support@whova.com
[Tampermonkey for Chrome]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
[Tampermonkey for Firefox]: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
[tim@whova.io]: mailto:tim@whova.io
[@WhovaSupport]: https://twitter.com/whovasupport
[Whova web app]: https://whova.com/portal/webapp

