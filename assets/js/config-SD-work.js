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
  ticket: '923a49814eaf5c47a2e31b9d29f5c48961906ab405319976c0cbac75ea74f570cae92b39f12e12ed84bdd73038ab337fce648cd6f31e3504a88c25a1f66c7e4dc4ed393a771199289c039e2c77849f1ed933befc13c0b72dcc461a1a1c8d927733e8ffcb59a66a469d554f1b279aee090aeba5213e1f-0d1b77a1371b63109e7861b2371bef52',
  modelViewUrl: 'eu-central-1',
  showControlsInitial: true,
  showSettingsInitial: false,
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
        window.location.href = "finish-post-config.html";
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
  // Update shapediver with new set of parameters and change current display selection for radio
  // [ concat 'curSection' with 1, 2, 3 to only clearup the specific side that user changed ]
  // [ get left1, left2, left3 by id and seperately iterate inside and clear all 'checked'.]
  // [ set 'checked' status for options with designated id ] -> organize a list of combos first
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
