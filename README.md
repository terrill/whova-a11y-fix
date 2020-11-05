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

1. Install a userscript manager browser extension, such as [Greasemonkey for Firefox][], [Tampermonkey for Firefox][], or [Tampermonkey for Chrome][].
2. Follow this link to the [Whova Accessibility Fix script][]. This should open in your userscript manager, and you will be prompted to install it. Look for an "Install" button.  
3. After you have installed the script, it runs in the background. When you login to the [AHG 2020 Virtual Conference][] the script will automatically run behind the scenes, resulting in a more accessible Whova experience. 
4. You can control the script (e.g., disable it, enable it, or check for updates) via your userscript manager, which should be available on your browser's toolbar. 

AHG Conference Attendees: If you need help installing the script, please contact me (Terrill, [tft@uw.edu][]) and I'll be happy to assist. 

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
[AHG 2020 Virtual Conference]: https://whova.com/portal/webapp/ahead_202011
[Github Issues]: https://github.com/terrill/whova-a11y-fix/issues
[Greasemonkey for Firefox]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[support@whova.com]: mailto:support@whova.com
[Tampermonkey for Chrome]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
[Tampermonkey for Firefox]: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
[tft@uw.edu]: mailto:tft@uw.edu
[@terrillthompson]: https://twitter.com/terrillthompson
[tim@whova.io]: mailto:tim@whova.io
[Whova Accessibility Fix script]: https://raw.githubusercontent.com/terrill/whova-a11y-fix/main/WhovaA11yFix.user.js
[@WhovaSupport]: https://twitter.com/whovasupport



