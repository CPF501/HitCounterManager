//MIT License

//Copyright (c) 2018-2019 Peter Kirmeier

//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE.

// ------------------------------------------------------------------------------------
// ---------------------------------- Initialization ----------------------------------

var link_font = document.createElement('link');
var link_font_href = '';
var link_css = document.createElement('link');
var link_css_href = 'stylesheet.css';
var iframe;
var font_name;

link_font.rel  = 'stylesheet';
link_font.href = link_font_href;
document.getElementsByTagName('head')[0].appendChild(link_font);
link_css.rel  = 'stylesheet';
link_css.href = link_css_href;
document.getElementsByTagName('head')[0].appendChild(link_css);

function Start()
{
	iframe = document.getElementsByTagName('iframe')[0];
	iframe.src="../HitCounter.html";

	Watchdog(); // Starts actual eternal loop
}

// ------------------------------------------------------------------------------------
// --------------------------------- Helper functions ---------------------------------

function IntToStringSigned(i) { if (i == 0) return '0'; else if (i > 0) return '+' + i; else return i; }

function ShowCrossOrCheckMark(i) { return '<img src="' + (i > 0 ? 'img_cross.png" height="15px"' : ( i == 0 ? 'img_check.png" height="21px"' : 'img_bar.png" height="21px"')) + '>'; }

function ShowSessionProgress() { return '<img src="img_star.png" height="21px">'; }

function IntToRomanStr(val)
{
	if (isNaN(val) || (val <= 0)) { return val; }

	var letters = new Array("M",  "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I");
    var weight  = new Array(1000, 900 , 500, 400 , 100, 90  , 50 , 40  , 10 , 9   , 5  , 4   , 1  );
	var result = "";
	for (var i = 0; i < weight.length; i++)
	{
		while (val >= weight[i])
		{
			result += letters[i];
			val -= weight[i];
		}
	}
	return result;
}

// ------------------------------------------------------------------------------------
// ------------------------------------- Watchdog -------------------------------------

var heartbeat = 0;
var init_done = false;
function Watchdog()
{
	setTimeout(function() { Watchdog();	}, 1500); // refresh every second
	if (heartbeat <= 1)
		heartbeat++;
	else
	{
		if (!init_done) // reading the data file never worked before or updating failed?
		{
			ShowHelpText('The browser or broadcasting software cannot read the hit counter data file.<br/>' +
			'Please try one of the following:<br/>&nbsp;<br/>' +
			'- <u>OBS Studio / SLOBS</u>: Make sure "local file" is checked at your browser source<br/>' +
			'- <u>OBS Studio</u>: If "local file" is not available with your OBS Studio version, make sure the URL of the browser source looks like this: <b>http://absolute/</b>C:/MyHitCounter/Designs/HitCounterNumeric.html<br/>' +
			'- <u>Chrome</u>: Make sure to start the browser with command line option <b>--allow-file-access-from-files</b><br/>' +
			'- <u>Firefox</u>: Change the security policy in the browser settings <b>"about:config" -&gt; "security.fileuri.strict_origin_policy" -&gt; false</b>. But keep in mind, this is a global settings, means you should enable this only for offline/trusted websites!<br/>' +
			'- <u>Internet Explorer 11</u>: Accepting the "blocked execution" warning should be sufficient<br/>' +
			'- <u>Others or still not working?</u>: Please disable cross domain protection as reading local files don\'t have a "domain", ' +
			'so the data file is treated as being hosted on another domain. This does not allow reading the file due to security reasons by most browsers\'  default. ' +
			'Please look at the online readme on github for the latest instructions that may already contain additional instructions.');
		}
		iframe.src = '../HitCounter.html'; // retry reloading file in case of errors
	}
}

// ------------------------------------------------------------------------------------
// ---------------------------------- Periodic update ---------------------------------

function DoUpdate(data)
{
	heartbeat = 0; // reset heartbeat, because we are alive
	init_done = true; // the data file could be loaded successfully

	// Do this before loading the CSS file, so we give the browser enough time to load it between the previous and this update cycle
	if (font_name != data.font_name)
	{
		if (data.font_name != undefined)
		{
			font_name = data.font_name;

			var importedSheet = link_css.sheet ? link_css.sheet : link_css.styleSheet;
			var rules = importedSheet.cssRules ? importedSheet.cssRules : importedSheet.rules;
			for ( i = 0 ; i < rules.length ; i = i + 1 )
			{
				if (rules[i].type == CSSRule.STYLE_RULE)
				{
					if (rules[i].style.fontFamily) { rules[i].style.fontFamily = font_name; } // update the used font
				}
			}
		}
		else link_css_href = ''; // restoring defaults means: reload CSS
	}

	// reload new files if changed..
	if (link_font_href != data.font_url) link_font.href = link_font_href = data.font_url;
	if (link_css_href  != data.css_url) { link_css.href = link_css_href  = data.css_url; font_name = undefined; }

	DoVisualUpdate(data); // build graphical content

	setTimeout(function() { iframe.src = '../HitCounter.html';}, 1500); // refresh around every second
}
