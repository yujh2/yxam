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
  ticket: '31f654e77118a29835d2098b56872b64be47ef7bfb25ff9caf1ee2cb3cf2713bb5ff4115c7ea6c379e2cc56e0a8ce5ae2d70e8acd102b6d9728918d92b6f69014207da3161c2fc6969c12d9c3a4707172f106bf1d0010f108698f1406064582b39bcf9d24d657e116aa71d7ac7684559af46dad5d3fb-94f7cdbc7f3a8d6215e5a77b1ddb40d1',
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
    for (let i = 0; i < parameters.data.length - 2; i++) {
      let paramInput = null;
      let paramDiv = document.createElement("div");
      let param = parameters.data[i];
      let label = document.createElement("label");
      label.setAttribute("for", param.id);
      label.innerHTML = param.name;
      if (i == 3) {
        // skip the material parameter because there's already one in the HTML
        continue;
      } else if (param.type == "Int" || param.type == "Float" || param.type == "Even" || param.type == "Odd") {
        paramInput = document.createElement("input");
        paramInput.setAttribute("id", param.id);
        paramInput.setAttribute("type", "range");
        paramInput.setAttribute("min", param.min);
        paramInput.setAttribute("max", param.max);
        paramInput.setAttribute("value", param.value);
        if (param.type == "Int") paramInput.setAttribute("step", 1);
        else if (param.type == "Even" || param.type == "Odd") paramInput.setAttribute("step", 2);
        else paramInput.setAttribute("step", 1 / Math.pow(10, param.decimalplaces));
        paramInput.onchange = function() {
          api.parameters.updateAsync({
            id: param.id,
            value: this.value
          });
        };
      } else if (param.type == "Bool") {
        paramInput = document.createElement("input");
        paramInput.setAttribute("id", param.id);
        paramInput.setAttribute("type", "checkbox");
        paramInput.setAttribute("unchecked", param.value);
        paramInput.onchange = function() {
          console.log(this);
          api.parameters.updateAsync({
            id: param.id,
            value: this.checked
          });
        };
      } else if (param.type == "String") {
        paramInput = document.createElement("input");
        paramInput.setAttribute("id", param.id);
        paramInput.setAttribute("type", "text");
        paramInput.setAttribute("value", param.value);
        paramInput.onchange = function() {
          api.parameters.updateAsync({
            id: param.id,
            value: this.value
          });
        };
      } else if (param.type == "Color") {
        paramInput = document.createElement("input");
        paramInput.setAttribute("id", param.id);
        paramInput.setAttribute("type", "color");
        paramInput.setAttribute("value", param.value);
        paramInput.onchange = function() {
          api.parameters.updateAsync({
            id: param.id,
            value: this.value
          });
        };
      } else if (param.type == "StringList") {
        paramInput = document.createElement("select");
        paramInput.setAttribute("id", param.id);
        for (let j = 0; j < param.choices.length; j++) {
          let option = document.createElement("option");
          option.setAttribute("value", j);
          option.setAttribute("name", param.choices[j]);
          option.innerHTML = param.choices[j];
          if (param.value == j) option.setAttribute("selected", "");
          paramInput.appendChild(option);
        }
        paramInput.onchange = function() {
          api.parameters.updateAsync({
            id: param.id,
            value: this.value
          });
        };
      }
      if (param.hidden) paramDiv.setAttribute("hidden", "");
      paramDiv.appendChild(label);
      paramDiv.appendChild(paramInput);
      // append different part of params to different blocks
      if (i >= 0 && i <= 2) {
        sizingDiv.appendChild(paramDiv);
      } else if (i >= 3 && i <= 5) {
        materialDiv.appendChild(paramDiv);
      } else if (i >= 6 && i <= 11) {
        doorDiv.appendChild(paramDiv);
      } else {
        spaceDiv.appendChild(paramDiv);
      }
    }
  }
});

/************************************************************************
// exportFile(): Dedicated function triigered when onclick event is activated
// 							 when user clicked submit.
************************************************************************/
function exportFile() {
  api.parameters.updateAsync({
    // PDF maker startup. (id corresponds to PDF maker)
    id: 'd9d4958d-da98-4e04-a279-b0ff47569d71',
    value: true
  });
  setTimeout(() => {
    exportAction('paramCSV');
  }, 2000);
  setTimeout(() => {
    exportAction('fileDownload');
  }, 5000);
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

// apply user's choice in picking the material of their choice (onclick with HTML element)
var applyOption = function(opt) {
  api.parameters.updateAsync({
    id: "7f00fbb0-586e-47c4-9b3b-c7b96af5a8fa",
    value: opt
  }).then(function() {
    api.scene.camera.updateAsync(initCamera);
    leftTrans.transformations[0].rotationDegree = 90;
    rightTrans.transformations[0].rotationDegree = -90;
  });
}


/************************************************************************
// validateForm(): function that sets a validation for email input group.
//								 It also sends export action codes to shapeDiver
//                 if email validation is correct.
************************************************************************/

function validateForm() {
  var emailInput = document.getElementById('email');
  var email =  emailInput.value;
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
    window.location.href = "finish.html";
    return true;
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
  if (curSelected == "alchol") {
    topCurrentDisplay[1].checked = true; // top
    middleCurrentDisplay[1].checked = true; // middle
    lowerCurrentDisplay[0].checked = true; // lower
  } else if (curSelected == "phone") {
    topCurrentDisplay[2].checked = true; // top
    middleCurrentDisplay[3].checked = true; // middle
    lowerCurrentDisplay[0].checked = true; // lower
  } else if (curSelected == "snacks") {
    topCurrentDisplay[4].checked = true; // top
    middleCurrentDisplay[4].checked = true; // middle
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
function SDleftFunctionality(choice) {
  api.parameters.updateAsync({
  name: 'choose func',
  value: choice
  });
}
