HEAD:
apple-touch-icon and apple-touch-startup-image icons should be customized

javascripts/supergroups.js

AJAX HANDSHAKE
Line 294 - Find: prizeClaim('trial');

GAME COMPLETION
Login and register links:
Line 313 - Find: $('#playArea div').append('<a href="https://minigroup.com/login

Trial link:
Line 321 - Find: $('#playArea div').append('<a href="https://minigroup.com/register

If you want to test game completion, without assembling all 50 groups:
Line 206 - Find: (passedGroups.length>=grp.length)?gameComplete():null; and change grp.length to a small integer