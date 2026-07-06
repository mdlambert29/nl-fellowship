var location_list = null;
var ver = Date.now();
var json_file = "https://cdn.jsdelivr.net/gh/mdlambert29/nl-fellowship@refs/heads/main/elsi_export_partners.json?v=" + ver;
console.log(json_file);

var cities = [];
var districts = [];
var distIdPairs = [];

var request2 = new XMLHttpRequest();
request2.open("GET", json_file);
request2.overrideMimeType("application/json; charset=utf-8");
request2.send(null);

request2.onreadystatechange = function() {
  if (request2.readyState === 4 && request2.status === 200) {
    var json_obj = JSON.parse(request2.responseText);
    location_list = Object.keys(json_obj).map(function(itm) {
      return json_obj[itm];
    });
    setCities(location_list);
  }
};

function setCities(list) {
  const data = list;
  for (var z = 0; z < data.length; z++) {
    var city = data[z].location_city;
    if (!cities.includes(city)) {
      cities.push(city);
    }
  }
  cities.sort();
  console.log(cities);
}

function setDistricts(list, city) {
  const data = list;

  while (districts.length > 0) {
    districts.pop();
  }
  while (distIdPairs.length > 0) {
    distIdPairs.pop();
  }

  console.log(city);
  console.log(list);

  for (var z = 0; z < data.length; z++) {
    if (data[z].location_city == city) {
      if (districts.includes(data[z].agency_name)) {
        console.log('skipping ' + data[z].agency_name);
      } else {
        districts.push(data[z].agency_name);
        distIdPairs.push([data[z].agency_name, data[z].agengy_id]);
      }
    }
  }

  if (city == "NEW YORK") {
    districts.push("NYCPS (New York City Public Schools)");
    distIdPairs.push(["NYCPS (New York City Public Schools)", ""]);
  }

  districts.sort();
  console.log(districts);
  console.log(distIdPairs);
}

function getDistrictIdByName(name) {
  const match = distIdPairs.find(function(pair) {
    return pair[0] === name;
  });
  return match ? match[1] : null;
}

const eduField = document.getElementById('accelerator_education');
const gpaWrap = document.getElementById('gpa-wrap');
const gpaField = document.getElementById('bachelors_gpa');

eduField.addEventListener("change", (event) => {
  if (event.target.value == "Bachelor's Degree" || event.target.value == "Master's Degree or higher") {
    gpaWrap.classList.remove('hide');
    gpaField.setAttribute('required', '');
  } else {
    gpaWrap.classList.add('hide');
    gpaField.removeAttribute('required');
  }
});

const comboBox = document.getElementById('combo-box');
const searchInput = document.getElementById('city');
const comboBox2 = document.getElementById('combo-state');
const searchInput2 = document.getElementById('school_organization');
const comboBox3 = document.getElementById('combo-sub');
const searchInput3 = document.getElementById('nyc_sub_district');

let subDistricts = [
  "District 1","District 2","District 3","District 4","District 5","District 6",
  "District 7","District 8","District 9","District 10","District 11","District 12",
  "District 13","District 14","District 15","District 16","District 17","District 18",
  "District 19","District 20","District 21","District 22","District 23","District 24",
  "District 25","District 26","District 27","District 28","District 29","District 30",
  "District 31","District 32","District 75","District 79"
];

const selectedState = {
  city: false,
  district: false,
  subdistrict: false
};

function markInvalid(input, message = 'Please select an option from the list.') {
  input.setCustomValidity(message);
  input.dataset.selected = 'false';
  input.classList.add('is-invalid');
}

function markValid(input) {
  input.setCustomValidity('');
  input.dataset.selected = 'true';
  input.classList.remove('is-invalid');
}

function clearSelection(input, key) {
  selectedState[key] = false;
  input.dataset.selected = 'false';
  input.setCustomValidity('Please select an option from the list.');
  input.classList.remove('is-invalid');
}

function validateCombo(input, options, key) {
  const value = input.value.trim();

  if (!selectedState[key]) {
    markInvalid(input);
    return false;
  }

  if (!options.includes(value)) {
    selectedState[key] = false;
    markInvalid(input);
    return false;
  }

  markValid(input);
  return true;
}

function populateOptions(options, id) {
  const optionsList = document.getElementById(id);
  optionsList.innerHTML = '';

  options.forEach(option => {
    const li = document.createElement('li');
    li.textContent = option;

    li.addEventListener('click', () => {
      const changeEvent = new Event('change', { bubbles: true });

      if (id === "cities-list") {
        searchInput.value = option;
        selectedState.city = true;
        markValid(searchInput);
        searchInput.dispatchEvent(changeEvent);
        document.getElementById('district-wrapper').style.display = "flex";
      } else if (id === "districts-list") {
        searchInput2.value = option;
        selectedState.district = true;
        markValid(searchInput2);
        searchInput2.dispatchEvent(changeEvent);
      } else if (id === "subdistricts-list") {
        searchInput3.value = option;
        selectedState.subdistrict = true;
        markValid(searchInput3);
        searchInput3.dispatchEvent(changeEvent);
      }

      optionsList.style.display = 'none';
    });

    optionsList.appendChild(li);
  });
}

populateOptions(cities, 'cities-list');

searchInput.addEventListener('input', () => {
  clearSelection(searchInput, 'city');

  const searchTerm = searchInput.value.toLowerCase();
  const optionsList = document.getElementById('cities-list');
  const filteredOptions = cities.filter(option =>
    option.toLowerCase().includes(searchTerm)
  );

  populateOptions(filteredOptions, 'cities-list');
  optionsList.style.display = 'block';

  searchInput2.value = '';
  selectedState.district = false;
  markInvalid(searchInput2);

  // Optional: clear hidden district ID field when city changes
  const districtIdField = document.getElementById('school_organization_id');
  if (districtIdField) districtIdField.value = '';
});

searchInput2.addEventListener('input', () => {
  clearSelection(searchInput2, 'district');

  const searchTerm = searchInput2.value.toLowerCase();
  const optionsList = document.getElementById('districts-list');
  const filteredOptions = districts.filter(option =>
    option.toLowerCase().includes(searchTerm)
  );

  populateOptions(filteredOptions, 'districts-list');
  optionsList.style.display = 'block';

  // Optional: clear hidden district ID field while typing
  const districtIdField = document.getElementById('school_organization_id');
  if (districtIdField) districtIdField.value = '';
});

searchInput3.addEventListener('input', () => {
  clearSelection(searchInput3, 'subdistrict');

  const searchTerm = searchInput3.value.toLowerCase();
  const optionsList = document.getElementById('subdistricts-list');
  const filteredOptions = subDistricts.filter(option =>
    option.toLowerCase().includes(searchTerm)
  );

  populateOptions(filteredOptions, 'subdistricts-list');
  optionsList.style.display = 'block';
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => validateCombo(searchInput, cities, 'city'), 150);
});

searchInput2.addEventListener('blur', () => {
  setTimeout(() => validateCombo(searchInput2, districts, 'district'), 150);
});

searchInput3.addEventListener('blur', () => {
  setTimeout(() => validateCombo(searchInput3, subDistricts, 'subdistrict'), 150);
});

document.addEventListener('click', (event) => {
  if (!comboBox.contains(event.target)) {
    document.getElementById('cities-list').style.display = 'none';
  }
  if (!comboBox2.contains(event.target)) {
    document.getElementById('districts-list').style.display = 'none';
  }
  if (!comboBox3.contains(event.target)) {
    document.getElementById('subdistricts-list').style.display = 'none';
  }
});

comboBox3.addEventListener('click', () => {
  const optionsList = document.getElementById('subdistricts-list');
  populateOptions(subDistricts, 'subdistricts-list');
  optionsList.style.display = 'block';
});

comboBox2.addEventListener('click', () => {
  const optionsList = document.getElementById('districts-list');
  setDistricts(location_list, document.getElementById('city').value);
  populateOptions(districts, 'districts-list');
  optionsList.style.display = 'block';
});

comboBox.addEventListener('click', () => {
  const optionsList = document.getElementById('cities-list');
  populateOptions(cities, 'cities-list');
  optionsList.style.display = 'block';
});

document.getElementById('city').addEventListener('change', (event) => {
  console.log('input value changed');
  setDistricts(location_list, document.getElementById('city').value);
  populateOptions(districts, 'districts-list');
  document.getElementById('school_organization').value = '';

  const districtIdField = document.getElementById('school_organization_id');
  if (districtIdField) districtIdField.value = '';
});

document.getElementById('school_organization').addEventListener('change', (event) => {
  console.log('district input value changed');
  document.getElementById('nyc_sub_district').value = '';

  var selectedDistrictName = event.target.value;
  var selectedDistrictId = getDistrictIdByName(selectedDistrictName);

  console.log('Selected district:', selectedDistrictName);
  console.log('Selected district ID:', selectedDistrictId);

  // Optional hidden field to pass district ID through the form
  const districtIdField = document.getElementById('school_organization_id');
  if (districtIdField) {
    districtIdField.value = selectedDistrictId || '';
  }
});

function setDistrictIdPair(name, id) {
  if (!distIdPairs.some(function(pair) { return pair[0] === name; })) {
    distIdPairs.push([name, id]);
  }
}

function hideSchoolPartnerFields() {
  const schoolPartnersWrap = document.getElementById('schoolPartners');
  if (schoolPartnersWrap) schoolPartnersWrap.classList.add('hide4');

  const partnerField = document.getElementById('school_system_partners');
  if (partnerField) partnerField.value = '';

  document.getElementById('city-cell').classList.add('hide1');
  document.getElementById('district-cell').classList.add('hide1');
  document.getElementById('subdistrict-cell').classList.add('hide2');

  document.getElementById('city').value = '';
  document.getElementById('school_organization').value = '';
  document.getElementById('nyc_sub_district').value = '';

  const districtIdField = document.getElementById('school_organization_id');
  if (districtIdField) districtIdField.value = '';

  selectedState.city = false;
  selectedState.district = false;
  selectedState.subdistrict = false;
}

document.getElementById('state').addEventListener('change', (event) => {
  if (document.getElementById('state').value == "New York" && document.getElementById('working_outside_home_state').value == "No") {
    document.getElementById('schoolPartners').classList.remove('hide4');
  } else if (document.getElementById('working_outside_home_state').value == "No") {
    document.getElementById('otherState').classList.add('hide3');
    hideSchoolPartnerFields();
  }
});

document.getElementById('state_i_will_work_in').addEventListener('change', (event) => {
  if (document.getElementById('state_i_will_work_in').value == "New York" && document.getElementById('working_outside_home_state').value == "Yes") {
    document.getElementById('schoolPartners').classList.remove('hide4');
  }
});

document.getElementById('working_outside_home_state').addEventListener('change', (event) => {
  if (document.getElementById('working_outside_home_state').value == "Yes") {
    document.getElementById('otherState').classList.remove('hide3');
  } else {
    if (document.getElementById('state').value != "New York") {
      hideSchoolPartnerFields();
    }
    document.getElementById('otherState').classList.add('hide3');
  }
});

document.getElementById('school_organization').addEventListener('change', (event) => {
  if (document.getElementById('school_organization').value == "NYCPS (New York City Public Schools)") {
    populateOptions(subDistricts, 'subdistricts-list');
    document.getElementById('subdistrict-cell').classList.remove('hide2');
  } else {
    document.getElementById('subdistrict-cell').classList.add('hide2');
  }
});

document.getElementById('school_system_partners').addEventListener('change', (event) => {
  const value = event.target.value;
  const cityField = document.getElementById('city');
  const districtField = document.getElementById('school_organization');
  const districtIdField = document.getElementById('school_organization_id');

  if (value === '') {
    document.getElementById('city-cell').classList.add('hide1');
    document.getElementById('district-cell').classList.add('hide1');
    document.getElementById('subdistrict-cell').classList.add('hide2');
    cityField.value = '';
    districtField.value = '';
    document.getElementById('nyc_sub_district').value = '';
    if (districtIdField) districtIdField.value = '';
    selectedState.city = false;
    selectedState.district = false;
    selectedState.subdistrict = false;
  } else if (value === 'Other') {
    cityField.value = '';
    districtField.value = '';
    document.getElementById('nyc_sub_district').value = '';
    if (districtIdField) districtIdField.value = '';
    selectedState.city = false;
    selectedState.district = false;
    selectedState.subdistrict = false;
    document.getElementById('subdistrict-cell').classList.add('hide2');
    document.getElementById('city-cell').classList.remove('hide1');
    document.getElementById('district-cell').classList.remove('hide1');
  } else if (value === 'NYCPS (New York City Public Schools)') {
    document.getElementById('city-cell').classList.add('hide1');
    document.getElementById('district-cell').classList.add('hide1');
    cityField.value = 'NEW YORK';
    setDistrictIdPair('NYCPS (New York City Public Schools)', '');
    districtField.value = 'NYCPS (New York City Public Schools)';
    districtField.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    document.getElementById('city-cell').classList.add('hide1');
    document.getElementById('district-cell').classList.add('hide1');

    const match = location_list && location_list.find(function(r) {
      return String(r.agengy_id) === value;
    });

    if (match) {
      cityField.value = match.location_city;
      setDistrictIdPair(match.agency_name, String(match.agengy_id));
      districtField.value = match.agency_name;
      districtField.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.warn('No matching school found for partner id', value);
      cityField.value = '';
      districtField.value = '';
      if (districtIdField) districtIdField.value = '';
    }
  }
});

$("#next").click(function() {
  if (stage1()) {
    $("#next").hide();
    $("#more-info").hide();
    $("#phase2").removeClass("hide");
  }
});

$("#submit").click(function() {
  if (stage2()) {
    formv4("accel-form", "d070e21d-97d7-4464-b94c-39ecae44f115");
  }
});

var moreInfo = false;
$("#more-info").click(function() {
  if (stage1()) {
    moreInfo = true;
    formv4("phase1", "d070e21d-97d7-4464-b94c-39ecae44f115");
  }
});

var hasBachDegree = false;
var eduLevel = "";
var workingInNewYork = false;
var workingInSchool = false;
var gpaPass = false;

function stage2() {
  var stage1valid = stage1();
  if (!stage1valid) {
    return false;
  }

  var timeline = document.getElementById("accelerator_start_preference");
  var inSchool = document.getElementById("working_in_a_school");
  var state = document.getElementById("state");
  var workingOutState = document.getElementById("working_outside_home_state");
  var otherState = document.getElementById("state_i_will_work_in");
  var city = document.getElementById("city");
  var district = document.getElementById("school_organization");
  var subdistrict = document.getElementById("nyc_sub_district");
  var ugDeg = document.getElementById("accelerator_education");
  var valid = true;
  var gpaScore = document.getElementById("bachelors_gpa");

  if (!timeline.checkValidity()) {
    timeline.reportValidity();
    valid = false;
  }

  if (!gpaScore.checkValidity()) {
    gpaScore.reportValidity();
    valid = false;
  } else if (gpaScore.value == "Below 2.5") {
    gpaPass = false;
  } else {
    gpaPass = true;
  }

  if (!inSchool.checkValidity()) {
    inSchool.reportValidity();
    valid = false;
  } else {
    if (inSchool.value == "true") {
      workingInSchool = true;
    }
  }

  if (!state.checkValidity()) {
    state.reportValidity();
    valid = false;
  } else if (state.value == "New York") {
    workingInNewYork = true;
  }

  if (!workingOutState.checkValidity()) {
    workingOutState.reportValidity();
    valid = false;
  }

  if (workingOutState.value == "Yes" && otherState.value == "") {
    otherState.setCustomValidity("Please select the state you will be working in");
    otherState.reportValidity();
    valid = false;
  } else if (workingOutState.value == "Yes" && otherState.value != "") {
    otherState.setCustomValidity("");
    if (otherState.value == "New York") {
      workingInNewYork = true;
    } else {
      workingInNewYork = false;
    }
  }

  if (!ugDeg.checkValidity()) {
    ugDeg.reportValidity();
    valid = false;
  } else {
    if (ugDeg.value !== "") {
      eduLevel = ugDeg.value;
    }
  }

  if (workingInNewYork) {
    var schoolPartnerField = document.getElementById('school_system_partners');
    var partnerValue = schoolPartnerField ? schoolPartnerField.value : '';
    var usingPartnerLookup = partnerValue !== '' && partnerValue !== 'Other';

    if (usingPartnerLookup) {
      if (!city.value || !district.value) {
        schoolPartnerField.setCustomValidity("Please select your school system partner again");
        schoolPartnerField.reportValidity();
        valid = false;
      } else {
        schoolPartnerField.setCustomValidity("");
        city.setCustomValidity("");
        district.setCustomValidity("");
      }
    } else {
      const cityValid = validateCombo(searchInput, cities, 'city');
      const districtValid = validateCombo(searchInput2, districts, 'district');

      if (!cityValid) {
        city.setCustomValidity("Please select the city you will be working in");
        city.reportValidity();
        valid = false;
      } else {
        city.setCustomValidity("");
      }

      if (!districtValid) {
        district.setCustomValidity("Please select the district you will be working in");
        district.reportValidity();
        valid = false;
      } else {
        district.setCustomValidity("");
      }
    }

    if (district.value == "NYCPS (New York City Public Schools)") {
      const subdistrictValid = validateCombo(searchInput3, subDistricts, 'subdistrict');
      if (!subdistrictValid) {
        subdistrict.setCustomValidity("Please select the NYC subdistrict you will be working in");
        subdistrict.reportValidity();
        valid = false;
      } else {
        subdistrict.setCustomValidity("");
      }
    }
  }

  console.log(valid);
  return valid;
}

function stage1() {
  var fname = document.getElementById("firstname");
  var lname = document.getElementById("lastname");
  var email = document.getElementById("email");
  var phoneNum = document.getElementById("mobilephone");
  var valid = true;

  if (!phoneNum.checkValidity()) {
    phoneNum.reportValidity();
    valid = false;
  }
  if (!fname.checkValidity()) {
    fname.reportValidity();
    valid = false;
  }
  if (!lname.checkValidity()) {
    lname.reportValidity();
    valid = false;
  }
  if (!email.checkValidity()) {
    email.reportValidity();
    valid = false;
  }
  return valid;
}

function compileData(selector) {
  const dataStr = new Array();
  var container = document.getElementById(selector);
  var list = container.querySelectorAll("input");
  var longInputs = container.querySelectorAll("textarea");
  var selects = container.querySelectorAll("select");

  for (var x = 0; x < longInputs.length; x++) {
    var item = {"objectTypeId": "0-1", "name": longInputs[x].name, "value": longInputs[x].value};
    if (item.value == "") {
      console.log(item.name);
      console.log(item.value);
    }
    dataStr.push(item);
  }

  for (var x = 0; x < selects.length; x++) {
    var item = {"objectTypeId": "0-1", "name": selects[x].name, "value": selects[x].value};
    if (item.value == "") {
      console.log(item.name);
      console.log(item.value);
    }
    dataStr.push(item);
  }

  for (var x = 0; x < list.length; x++) {
    if (list[x].type != 'submit') {
      var item = {"objectTypeId": "0-1", "name": list[x].name, "value": list[x].value};
      if (item.value == "") {
        console.log(item.name);
        console.log(item.value);
      }
      dataStr.push(item);
    }
  }

  return dataStr;
}

function formv4(wrapperId, formId) {
  var xhr = new XMLHttpRequest();
  var url = 'https://api.hsforms.com/submissions/v3/integration/submit/20257315/' + formId;
  var testVar = setEligibility();
  var input = compileData(wrapperId);

  var data = {
    "fields": input,
    "context": {
      "hutk": getCookie('hubspotutk'),
      "pageUri": window.location.href,
      "pageName": document.title
    }
  };

  var final_data = JSON.stringify(data);
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      window.dataLayer.push({
        'event': 'hubspot-form-success',
        'hs-form-guid': formId
      });
      $("#accel-form").addClass('hide');
      $("#accel-results-wrap").removeClass('hide');
      var code = setEligibility();
      $(`[accel-results="${code}"`).removeClass('hide');
    } else if (xhr.readyState == 4 && xhr.status == 400) {
      console.log(xhr.responseText);
    } else if (xhr.readyState == 4 && xhr.status == 403) {
      console.log(xhr.responseText);
    } else if (xhr.readyState == 4 && xhr.status == 404) {
      console.log(xhr.responseText);
    }
  };

  xhr.send(final_data);
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setEligibility() {
  var pass = false;
  if (moreInfo == true) {
    $('#accelerator_eligibility').val("Unknown - Requested More Information");
    pass = "moreInfo";
  } else if (!workingInNewYork) {
    $('#accelerator_eligibility').val("Ineligible - Outside New York");
    pass = "ny";
  } else if (!workingInSchool) {
    $('#accelerator_eligibility').val("Ineligible - Not Working In School");
    pass = "noSchool";
  } else if (!gpaPass) {
    $('#accelerator_eligibility').val("Ineligible - Bachelor's GPA Below 2.5 ");
    pass = "gpaTooLow";
  } else if (eduLevel == "High School Diploma or GED") {
    $('#accelerator_eligibility').val("Eligible - Bachelors Program");
    pass = "successBach";
  } else if (eduLevel == "Some college (no degree)") {
    $('#accelerator_eligibility').val("Eligible - Bachelors Program");
    pass = "successBach";
  } else if (eduLevel == "Associate's Degree") {
    $('#accelerator_eligibility').val("Eligible - Bachelors Program");
    pass = "successBach";
  } else if (eduLevel == "Bachelor's Degree") {
    $('#accelerator_eligibility').val("Eligible - Masters Program");
    pass = "successMasters";
  } else if (eduLevel == "Master's Degree or higher") {
    $('#accelerator_eligibility').val("Eligible - Masters Program");
    pass = "successMasters";
  }

  console.log($('#accelerator_eligibility').val());
  return pass;
}