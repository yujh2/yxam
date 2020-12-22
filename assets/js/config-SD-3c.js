/************************************************************************
// ShapeDiver Product Configuration Viewer - Prototype 3.5
// Date: 2020/10/05
// Creator: Henry Yu, YXAM R&D
// Viewer Description:
// 		This viewer is a single item demonstrator that interacts directly
//    with ShapeDiver's API and provides a instant feedback for customization.
//    Main features include: 1.) Import all parameters from SD<>GH Model
// 													 2.) Expandable/Hidden drawer for parameters
//													 3.) Interactable viewer (spin, zoom, transpose)
// 													 4.) Material chooser visualizer with image icon
// 													 5.) Multi-action submit button (export PDF & CSV
// 															 files for manufacturablility)
//										[Beta] 6.) Added experimental mouse interaction feature.
//															 (Need GH file to verify how objects are seperated)
************************************************************************/

var _container = document.getElementById('sdv-container');
// viewer settings
var _viewerSettings = {
  // container to use
  container: _container,
  // when creating the viewer, we want to get back an API v2 object
  api: {
    version: 2
  },
  // ticket for a ShapeDiver model
  ticket: 'e84dcddba80f80e456e2e9d4d44547f7981818008ff56d62be20a41d2012c89f64ce78cf12dcaf730eb29c89d64c1fafce6830316b0fe524581e0126037cc79bdcaa335fc4451fde048e0847eff876cfb3da409e61884a23031e8d11f3fac2dd0d992cfa28fcc3282f0b94233a55931a4f3bf666cec0-b1a4466a9c54aa9e9dfcd822c158794a',
  modelViewUrl: 'eu-central-1',
  showControlsInitial: true,
  showSettingsInitial: false
};

// create the viewer, get back an API v2 object
var api = new SDVApp.ParametricViewer(_viewerSettings);
var viewerInit = false;
var parameters;
api.scene.addEventListener(api.scene.EVENTTYPE.VISIBILITY_ON, function() {
  if (!viewerInit) {
    parameters = api.parameters.get();
    parameters.data.sort(function(a, b) {
      return a.order - b.order;
    });
    console.log(parameters.data);
  }
});
api.state.addEventListener(api.state.EVENTTYPE.BUSY, function(){
  document.getElementById('loader').hidden = false;
});
api.state.addEventListener(api.state.EVENTTYPE.IDLE, function(){
  document.getElementById('loader').hidden = true;
});

/************************************************************************
// exportFile(): Dedicated function triigered when onclick event is activated
// 							 when user clicked submit.
************************************************************************/
function exportFile() {
  var userEmail = document.getElementById('email').value;
  api.parameters.updateAsync({
    // PDF maker startup. (id corresponds to PDF maker)
    name: 'enter email',
    value: userEmail
  });
}
/************************************************************************
// validateForm(): function that sets a validation for email input group.
//								 It also sends export action codes to shapeDiver
//                 if email validation is correct.
************************************************************************/

function validateForm() {
  var emailInput = document.getElementById('email');
  var submitButton = document.getElementById('button-submit');
  var email = emailInput.value;
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // check if email format is invalid
  if (email == "" || !re.test(email)) {
    document.querySelector('.invlalid-feedback').innerHTML = "電子郵件空白或格式不符";
    emailInput.classList.add('is-invalid');
    return false;
  } else {
    // if email format if valid
    if (emailInput.classList.contains('is-invalid')) {
      // remove 'is-invalid' class if previous submission triggered invalid
      emailInput.classList.remove('is-invalid');
    }
    // Set input group to 'is-valid' status
    emailInput.classList.add('is-valid');
    document.querySelector('.invlalid-feedback').innerHTML = "";
    // change button status after successful update
    submitButton.innerHTML = "完成!"
    submitButton.setAttribute("style", "background: linear-gradient(to right, #5ead07 0%, #5ead07 50%, #5ead07 100%); cursor: default;");
    submitButton.disabled = 'disabled';
    // update user's email to SD param and redirect to finish page
    exportFile();
    api.exports.requestAsync({name: "data email"}).then( function(response) {
        console.log(response);
        window.location.href = "finish.html";
      }
    );
  }
}

/************************************************************************
// modifyList(curSelected, layerOptions): modify displayed option list for
//                                        user to select from.
// curSelected - previous preference based on user's previous selection
// layerSelected - The array of elements that represents all the options in
//                 one side (left1/2/3, right1/2/3, etc.)
************************************************************************/

function modifyList(curSelected, curSection) {
  var layerOptions = document.getElementsByClassName(curSection.concat("-list"));
  // Add hidden class to all options
  for (i = 0; i < layerOptions.length; i++) {
    // default make every option hidden first
    layerOptions[i].classList.add("list-hidden");
    // Make sub-list options visible based on 'curSelected' user made
    if (layerOptions[i].getAttribute('value') == "all" || layerOptions[i].getAttribute('value') == curSelected) {
      console.log("it did came here");
      layerOptions[i].classList.remove("list-hidden");
      console.log(layerOptions[i].getAttribute('value') );
      continue;
    } else {
      console.log('nothing got validated');
      console.log(layerOptions[i].getAttribute('value') );
    }
  }
}

/************************************************************************
// modifyCurrentSelected(curSelected, curSection): Change the altered section's
//                                                 (left, right, middle)
//                                                 arrangement (up(1), middle(2)
//                                                 , lower(3)) based on the
//                                                 user's selection.
// curSelected - previous preference based on user's previous selection
// curSection - show which section is the user adjusting (left,right,middle)
************************************************************************/

function modifyCurrentSelected(curSelected, curSection) {

  var topCurrentDisplay = document.getElementById(curSection.concat("1")).getElementsByClassName('select-box-top__input');
  var middleCurrentDisplay = document.getElementById(curSection.concat("2")).getElementsByClassName('select-box-middle__input');
  var lowerCurrentDisplay = document.getElementById(curSection.concat("3")).getElementsByClassName('select-box-lower__input');

  console.log(topCurrentDisplay);
  console.log(middleCurrentDisplay);
  console.log(lowerCurrentDisplay);

  // clear all previous selections in current display
  for (i = 0; i < topCurrentDisplay.length; i++) {
    topCurrentDisplay[i].checked = false;
    middleCurrentDisplay[i].checked = false;
    lowerCurrentDisplay[i].checked = false;
  }

  // Update shapediver with new set of parameters and change current option for radio
  if (curSelected == "write") {
    topCurrentDisplay[1].checked = true; // top
    middleCurrentDisplay[2].checked = true; // middle
    lowerCurrentDisplay[0].checked = true; // lower
  } else if (curSelected == "phone") {
    topCurrentDisplay[3].checked = true; // top
    middleCurrentDisplay[4].checked = true; // middle
    lowerCurrentDisplay[0].checked = true; // lower
  } else if (curSelected == "cup") {
    topCurrentDisplay[5].checked = true; // top
    middleCurrentDisplay[0].checked = true; // middle
    lowerCurrentDisplay[0].checked = true; // lower
  }
}


/************************************************************************
// dynamicOptions(curSelected): This function dynamically show the user
//                              an updated group of options based on their
//                              previous preferences (used in functionality
//                              selections)
// curSelected - previous preference based on user's previous selection
// curSection - show which section is the user adjusting (left,right,middle)
************************************************************************/

function dynamicOptions(curSelected, curSection) {
  modifyCurrentSelected(curSelected, curSection); // function has to consider three of the displayed options independently.
  modifyList(curSelected, curSection);
}

/************************************************************************
// paramsOpenClose(section): minimize & maximize viewport for parameters
// section - shows which parameter group is the user closing or opening
************************************************************************/
function paramsOpenClose(section) {
  var paramName = "adjust-labels-";
  var paramSection = document.getElementsByClassName(paramName.concat(section));
  for (i = 0; i < paramSection.length; i++) {
    paramSection[i].classList.toggle("adjust-labels-hidden");
  }
}

/************************************************************************
// ** (FREE ADJUSTMENT PAGE ONLY) noUiSlider created here **
************************************************************************/


var leftRightRange = document.getElementById('leftRightRange');
noUiSlider.create(leftRightRange, {
    start: [ -125, 125 ], // Handle start position
    step: 1, // Slider moves in increments of '10'
    margin: 131, // Handles must be more than '20' apart
    connect: true, // Display a colored bar between the handles
    direction: 'ltr', // Put '0' at the bottom of the slider
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable .
    range: {'min': -234,'max': 234 },
    format: wNumb({
      decimals: 0,
      suffix: ' (mm)'
    }),
    padding: 64
});

leftRightRange.noUiSlider.on('change', function (values, handle) {
  // obtain individual values
  var tempLeft = values[0].match(/(\d+)/);
  var tempRight = values[1].match(/(\d+)/);
  // compare individual values
  if (Math.abs(tempLeft[0]) < 65) {
    // left reset minimum
    leftRightRange.noUiSlider.set([-65, tempRight[0]]);
  } else if (tempRight[0] < 65) {
    // right reset minimum
    leftRightRange.noUiSlider.set([-tempLeft[0],65]);
  }
});

var leftRightRangeDatas = [
  document.getElementById('leftRangeData'),
  document.getElementById('RightRangeData')
];
leftRightRange.noUiSlider.on('update', function (values, handle) {
     left = values[0]; //left range data
     formatLeft(left);
     right = values[1];
     formatRight(right);
});
function formatLeft(left) {
  temp = (234+parseInt(left)).toString()
  leftRightRangeDatas[0].innerHTML = temp.concat('(mm)');
}
function formatRight(right) {
  temp = (234-parseInt(right)).toString()
  leftRightRangeDatas[1].innerHTML = temp.concat('(mm)');
}

var midLineRange = document.getElementById('midLineRange');
noUiSlider.create(midLineRange, {
    start: [ 0 ], // Handle start position
    step: 1, // Slider moves in increments of '10'
    margin: 20, // Handles must be more than '20' apart
    direction: 'rtl', // Put '0' at the bottom of the slider
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable
    range: {'min': -50,'max': 50 },
    format: wNumb({
      suffix: ' (mm)'
    })
});

var midLineRangeData = document.getElementById('midLineRangeData');
midLineRange.noUiSlider.on('update', function (values, handle) {
     midLineRangeData.innerHTML = values[handle];
});

var depth = document.getElementById('depth');
noUiSlider.create(depth, {
    start: [ 5 ], // Handle start position
    step: 1, // Slider moves in increments of '10'
    margin: 20, // Handles must be more than '20' apart
    connect: [false, true], // Display a colored bar between the handles
    direction: 'rtl', // Put '0' at the bottom of the slider
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable
    range: {'min': 0,'max': 7 },
    format: wNumb({
      suffix: ' (mm)'
    })
});

var depthData = document.getElementById('depthData');
depth.noUiSlider.on('update', function (values, handle) {
     depthData.innerHTML = values[handle];
});


/************************************************************************
// mobileParamSelect(selected): This function dynamically show the parameter's
//                              content based on user's selection. (mobile
//                              view only)
// selected - user's selection of parameter to customize
// content - to call 'paramsOpenCLose' to open content
************************************************************************/
function mobileParamSelect(selected, iconId) {
  // get all parameters by 'param-switch-mobile' by getElementsByClassName
  var allParams = document.getElementsByClassName('param-switch_mobile');
  var openParam = document.getElementsByClassName(selected);
  var iconImg = document.getElementsByClassName('param-icon-img');
  // change all tooltip toward up direction

  // traverse through all elements and see which one has display: flex and remove it
  for (i = 0; i < allParams.length; i++) {
    // uncheck selected param (icon)
    if(allParams[i].hasAttribute("style")) {
      allParams[i].removeAttribute("style");
      iconImg[i].removeAttribute("style");
    }
  }
  // add "selected param" with display=flex inline css
  openParam[0].setAttribute("style","display: flex;");
  iconImg[iconId].setAttribute("Style", "border-bottom: 2px solid #ef6e0c;");
}

// // Validation for detailed text input parameters
// var paramTest = document.getElementById('ind-column-count');
// paramTest.addEventListener("input", testMe, false);
// function testMe() {
//   var inputTest = paramTest.value;
//   var check = /g[0-2]*[0-9]+;/;
//   if (!inputTest == "" && !check.test(inputTest)) {
//     paramTest.classList.add('is-invalid');
//   } else {
//     // if email format if valid
//     if (paramTest.classList.contains('is-invalid')) {
//       // remove 'is-invalid' class if previous submission triggered invalid
//       paramTest.classList.remove('is-invalid');
//     }
//     // Set input group to 'is-valid' status
//     paramTest.classList.add('is-valid');
//   }
//   console.log(inputTest);
// }

// -------- SHAPEDIVER API LISTENER SECTION ---------

/************************************************************************
// SDmaterialSelection(choice): Provides API command to SD for user's material
//                              selection.
// choice - user's selection of material
************************************************************************/
function SDmaterialSelection(choice) {
  api.parameters.updateAsync({
  name: 'MAT',
  value: choice
  });
}
/************************************************************************
// SDrowCount: API variable for SD to change number of rows universally
//             throughout all blocks
************************************************************************/
var SDrowCount = document.getElementById('row-count');
SDrowCount.addEventListener('input', function() {
  api.parameters.updateAsync({
    name: 'B',
    value: SDrowCount.value
  });
});

// ---------- TEXT INPUT TYPE PARAMS -------------
/************************************************************************
// SDconnectBlocks: API variable for SD to choose which blocks to connect
//                  into bigger area
************************************************************************/
var SDconnectBlocks = document.getElementById('connect-blocks');
SDconnectBlocks.addEventListener('input', function() {
  api.parameters.updateAsync({
    name: 'combine items',
    value: SDconnectBlocks.value
  });
});

/************************************************************************
// SDindColumnCount: API variable for SD to change number of columns individually
//                   for dedicated blocks
************************************************************************/
var SDindColumnCount = document.getElementById('ind-column-count');
SDindColumnCount.addEventListener('input', function() {
  api.parameters.updateAsync({
    name: 'separate num,amount',
    value: SDindColumnCount.value
  });
});
/************************************************************************
// SDsquare2circle: API variable for SD to change specific default suqare
//                  slots into circle slots
************************************************************************/
var SDsquare2circle = document.getElementById('square-to-circle');
SDsquare2circle.addEventListener('input', function() {
  api.parameters.updateAsync({
    name: 'circles',
    value: SDsquare2circle.value
  });
});
/************************************************************************
// SDcircle2hole: API variable for SD to change specific default circle
//                  slots into circle holes
************************************************************************/
var SDcircle2hole = document.getElementById('circle-to-hole');
SDcircle2hole.addEventListener('input', function() {
  api.parameters.updateAsync({
    name: 'holes',
    value: SDcircle2hole.value
  });
});

/************************************************************************
// SDblockNumber: API variable for SD to switch on and off the number index
//                for blocks in the viewer
************************************************************************/
var SDblockNumber = document.getElementById('customSwitch1');
SDblockNumber.addEventListener('click', function() {
  api.parameters.updateAsync({
    name: 'num Toggle',
    value: SDblockNumber.checked
  })
});

/************************************************************************
// SDgridNumber: API variable for SD to switch on and off the number index
//                for each grid (small boxes/holes) in the viewer
************************************************************************/
var SDgridNumber = document.getElementById('customSwitch2');
SDgridNumber.addEventListener('click', function() {
  api.parameters.updateAsync({
    name: 'grid num Toggle',
    value: SDgridNumber.checked
  })
});
