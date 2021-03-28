/* ==================================
  GLOBAL VARIABLES
===================================== */

const form = document.querySelector('form');
const nameField = document.getElementById('name');
const jobRoleField = document.getElementById('title');
const otherJobRoleField = document.getElementById('other-job-role');
const shirtDesignField = document.getElementById('design');
const shirtColorField = document.getElementById('color');
const activities = document.getElementById('activities');
const activitiesFields = activities.querySelectorAll('[type="checkbox"]');
const paymentField = document.getElementById('payment');
const requiredFields = document.querySelectorAll('.error-border');

nameField.focus(); // Set auto focus for the first field
otherJobRoleField.style.display = 'none'; // Hide other job role field by default
shirtColorField.disabled = true; // Disable color field by default
paymentField.selectedIndex = 1; // Choose credit card option for paymentField by default
document.getElementById('paypal').style.display = 'none'; // Hide paypal field by default
document.getElementById('bitcoin').style.display = 'none'; // Hide bitcoin field by default

/* ==================================
  HELPERS
===================================== */

// --- Validation ---
const validationSchema = {
  checkName: name => /^[A-Za-z]{2,}$/.test(name),
  checkEmail: email => /^([a-zA-Z\-0-9.]+)@([a-zA-Z\-0-9]+).com$/.test(email),
  checkActivities: () => activities.querySelector('[type="checkbox"]:checked') ? true : false,
  checkExpiryMonth: () => document.getElementById('exp-month').selectedIndex !== 0,
  checkExpiryYear: () => document.getElementById('exp-year').selectedIndex !== 0,
  checkCCNum: () => document.getElementById('cc-num').value.length >= 13 && document.getElementById('cc-num').value.length <= 16,
  checkZip: () => document.getElementById('zip').value.length >= 5 && document.getElementById('zip').value.length <= 5,
  checkCVV: () => document.getElementById('cvv').value.length >= 3 && document.getElementById('cvv').value.length <= 3
}

const isValid = field => {
  if (field.id === 'name') return validationSchema.checkName(field.value);
  if (field.id === 'email') return validationSchema.checkEmail(field.value);
  if (field.id === 'activities-box') return validationSchema.checkActivities();
  // If the credit card option is selected run the validation
  if (paymentField.selectedIndex === 1) {
    if (field.id === 'exp-month') return validationSchema.checkExpiryMonth(field.value);
    if (field.id === 'exp-year') return validationSchema.checkExpiryYear(field.value);
    if (field.id === 'cc-num') return validationSchema.checkCCNum(field.value);
    if (field.id === 'zip') return validationSchema.checkZip(field.value);
    if (field.id === 'cvv') return validationSchema.checkCVV(field.value);
    // otherwise, skip with setting validation to true
  } else {
    return true;
  }
}

const handleInput = (input, label, hint) => {
  // add a key up event handler
  input.addEventListener('keyup', () => {
    // if the field is valid, hide error if showing, otherwise, show error
    isValid(input) ? hideError(label, hint) : showError(label, hint)
  });
}

const handleSelect = (select, label, hint) => {
  // add a blur event handler
  select.addEventListener('blur', () => {
    // if the field is valid, hide error if showing, otherwise, show error
    isValid(select) ? hideError(label, hint) : showError(label, hint)
  });
  // add an on change event handler
  select.addEventListener('change', () => {
    // if the field is valid, hide error if showing, otherwise, show error
    isValid(select) ? hideError(label, hint) : showError(label, hint)
  });
}

const handleActivityChange = (chosenField, field, label) => {
  const chosenDate = chosenField.getAttribute('data-day-and-time');
  const fieldDate = field.getAttribute('data-day-and-time');
  if (field !== chosenField && fieldDate === chosenDate) {
    // set the field to disabled and add the disabled class to the label
    field.disabled = true;
    label.classList.add('disabled');
  }
  // if the clicked field is not checked, and the field is disabled, and the field date is the same as the clicked field
  if (!chosenField.checked && field.disabled && fieldDate === chosenDate) {
    // set the field usable and remove the disabled class from the label
    field.disabled = false;
    label.classList.remove('disabled');
  }
}

// --- Elements ---
const showError = (label, hint) => {
  label.classList.add('not-valid');
  label.classList.remove('valid');
  hint.style.display = 'block';
}

const hideError = (label, hint) => {
  label.classList.add('valid');
  label.classList.remove('not-valid');
  hint.style.display = '';
}

/* ==================================
  EVENT HANDLERS
===================================== */

// --- Required fields ---
requiredFields.forEach(field => {
  // find the label and hint element's of the iterated field
  const label = field.parentElement;
  const hint = label.lastElementChild;
  // if it's an input, call the handleInput method to handle input element validation
  if (field.tagName === 'INPUT') {
    handleInput(field, label, hint);
  }
  // if it's an input, call the handleSelect method to handle select element validation
  handleSelect(field, label, hint);
});

// --- Job role field ---
jobRoleField.addEventListener('change', function () {
  // if the field's value is equal to other, display the other role field, otherwise don't
  this.value === 'other' ? otherJobRoleField.style.display = 'block' : otherJobRoleField.style.display = 'none';
});

// --- shirt design field ---
shirtDesignField.addEventListener('change', function () {
  // make the field usable
  shirtColorField.disabled = false;
  // for each option of the shirt color options
  for (option of shirtColorField.options) {
    // if the option's data-theme attribute is not equal to the select element's value set the option hidden, otherwise don't
    option.getAttribute('data-theme') !== this.value ? option.hidden = true : option.hidden = false;
  }
  // select the option for the select element
  shirtColorField.querySelector(`[data-theme="${this.value}"]`).selected = true;
});

// --- activities field ---
activities.addEventListener('change', e => {
  const total = document.getElementById('activities-cost');
  // set an initial counter price
  let price = 0;
  // get the clicked field
  const chosenField = e.target;
  // for each activity field
  activitiesFields.forEach(field => {
    const label = field.parentElement;
    // handle any changes to the activities field with the helper
    handleActivityChange(chosenField, field, label);
    // add event listener to the field for focus and blur, add and remove the focus class from the label
    field.addEventListener('focus', () => label.classList.add('focus'));
    field.addEventListener('blur', () => label.classList.remove('focus'));
    // if the field is checked, add the field's cost to the price variable, otherwise do nothing
    field.checked ? price += parseInt(field.getAttribute('data-cost')) : null;
  });
  // set the total element's price content to the price variable
  total.textContent = `Total: $${price}`;
});

// --- payment field ---
paymentField.addEventListener('change', function () {
  // for each option of the payment select element
  for (option of paymentField.options) {
    // if the option's index is greater than 0
    if (option.index > 0) {
      // if the option value is not equal to the select element's value
      option.value !== this.value
      // find the element and set it's display to none
        ? document.getElementById(`${option.value}`).style.display = 'none'
      // otherwise, find the element and display it
        : document.getElementById(`${option.value}`).style.display = '';
    }
  }
});

// --- form ---
form.addEventListener('submit', e => {
  // for each required field
  requiredFields.forEach(field => {
    // get the label and hint of the field
    const label = field.parentElement;
    const hint = label.lastElementChild;
    // if the field is valid
    if (isValid(field)) {
      // hide error if showing
      hideError(label, hint);
    } else {
      // otherwise, show error
      showError(label, hint);
      // if the field's id attribute is equal to email
      if (field.id === 'email') {
        // find the email hint element
        const emailHint = document.getElementById('email-hint');
        // if the field value is an empty string, set different hint texts
        field.value === '' ? emailHint.textContent = 'Enter an email address' : emailHint.textContent = 'Email address must be formatted correctly';
      }
      // prevent the default form submission from event
      e.preventDefault();
    }
  });
});