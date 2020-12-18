/***********************************************************************
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
***********************************************************************/

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
  ticket: '946291ca177466d81b7a4f07f4600067c85d677138ab89739a114764dc7af6e649bcca0e33f52d4e107730950eb9353af6988d1ae7a86a8721b334c5fefb4484fe041c20449d095a2b662c294781423fba4a4419e103f6ac120d09d66131651c1946601b1ff0935dac1d0ef0b9c91a02d481e745c2e6-70721bcc172411f265a0d519fe4a0697',
  modelViewUrl: 'eu-central-1'
};

// create the viewer, get back an API v2 object
var api = new SDVApp.ParametricViewer(_viewerSettings);
var viewerInit = false;
var parameters;
api.scene.addEventListener(api.scene.EVENTTYPE.VISIBILITY_ON, function() {
  if (!viewerInit) {
    // set up different blocks for parameters
    var sizingDiv = document.getElementById("sizing-param-knobs");
    var materialDiv = document.getElementById("material-param-knobs");
    var doorDiv = document.getElementById("door-param-knobs");
    var spaceDiv = document.getElementById("space-param-knobs");
    parameters = api.parameters.get();
    parameters.data.sort(function(a, b) {
      return a.order - b.order;
    });
    console.log(parameters.data);
  }
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
// exportAction(exportName): inner function that executes the actual
//													 export action request to SD's API
// @exportName - specifies what type of export action it is considering
************************************************************************/

function exportAction(exportName) {
  api.exports.requestAsync({
    name: exportName
  }).then(
    function(response) {
      let link = response.data.content[0].href;
      window.location = link;
    }
  );
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
      layerOptions[i].classList.remove("list-hidden");
      continue;
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
  var orderElementVar = [lowerCurrentDisplay, middleCurrentDisplay, topCurrentDisplay];

  console.log(topCurrentDisplay);
  console.log(middleCurrentDisplay);
  console.log(lowerCurrentDisplay);

  // clear all previous selections in current display
  for (i = 0; i < topCurrentDisplay.length; i++) {
    topCurrentDisplay[i].checked = false;
    middleCurrentDisplay[i].checked = false;
    lowerCurrentDisplay[i].checked = false;
  }
  // get current section item order
  curOrder = api.parameters.get({name: curSection.concat(" items")}, "CommPlugin_1").data[0].value;
  curOrderArr = curOrder.split(',');
  // Update shapediver with new set of parameters and change current option for radio
  if (curSelected == "alchol") {
    topCurrentDisplay[0].checked = true; // top
    middleCurrentDisplay[2].checked = true; // middle
    lowerCurrentDisplay[2].checked = true; // lower
    var newOrder = "1,1,100";
    api.parameters.updateAsync({
      name: curSection.concat(" items"),
      value: newOrder
    });
  } else if (curSelected == "phone") {
    topCurrentDisplay[3].checked = true; // top
    middleCurrentDisplay[1].checked = true; // middle
    lowerCurrentDisplay[4].checked = true; // lower
    var newOrder = "2,3,1";
    api.parameters.updateAsync({
      name: curSection.concat(" items"),
      value: newOrder
    });
  } else if (curSelected == "snacks") {
    topCurrentDisplay[0].checked = true; // top
    middleCurrentDisplay[5].checked = true; // middle
    lowerCurrentDisplay[5].checked = true; // lower
    var newOrder = "1,1,100";
    api.parameters.updateAsync({
      name: curSection.concat(" items"),
      value: newOrder
    });
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

function dynamicOptions(curSelected, curSection, SDchoice) {
  modifyCurrentSelected(curSelected, curSection); // function has to consider three of the displayed options independently.
  modifyList(curSelected, curSection);
  // ShapeDiver API call for respective section functionality
  var curSection_SDFormat = curSection.concat(" func");
  SDsectionFunctionality(curSection_SDFormat, SDchoice);
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
// -------- SHAPEDIVER API LISTENER SECTION ---------

/************************************************************************
// SDmaterialSelection(choice): Provides API command to SD for user's material
//                              selection.
// choice - user's selection of material
************************************************************************/
function SDmaterialSelection(choice) {
  api.parameters.updateAsync({
  name: 'choose wood',
  value: choice
  });
}
/************************************************************************
// SDmaterialSelection(choice): Provides API command to SD for user's material
//                              selection.
// choice - user's selection of material
************************************************************************/
function SDsectionFunctionality(section, choice) {
  api.parameters.updateAsync({
  name: section,
  value: choice
  });
}
/************************************************************************
// SDmidLength(): Provides API command to SD for mid section length adjustments
************************************************************************/
var SDmidSlider = document.getElementById('midSlider');
SDmidSlider.addEventListener('input', SDmidLength, false);
function SDmidLength() {
  api.parameters.updateAsync({
  name: 'mid pos',
  value: (SDmidSlider.value)/100
  });
}

/************************************************************************
// SDitemSelection(section, order, choice): Provides API command on which section (L/M/R)
//                          did the user decide to change item arrangements
// section - Left, middle, or right section (in SD API formality (+items))
// order - top, middle, or bottom
// choice - user's selection of item
************************************************************************/
function SDitemSelection(section, order, choice) {
  // get current section layout
  curOrder = api.parameters.get({name: section}, "CommPlugin_1").data[0].value;
  curOrderArr = curOrder.split(',');
  // access the right order to alter user selection
  curOrderArr[order] = choice;
  // update parameter
  api.parameters.updateAsync({
    name: section,
    value: curOrderArr.toString()
  });
}
